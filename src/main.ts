import {
  Component,
  MarkdownRenderer,
  MarkdownRenderChild,
  editorLivePreviewField,
  finishRenderMath,
  loadMathJax,
  type MarkdownPostProcessorContext,
  MarkdownView,
  Plugin,
  Notice,
  PluginSettingTab,
  Setting,
  renderMath
} from "obsidian";
import { syntaxTree } from "@codemirror/language";
import { Facet, Prec, StateEffect, StateField, type EditorState } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
  ViewPlugin,
  keymap
} from "@codemirror/view";
import {
  findMathDelimiters,
  tableCellSources,
  type MathDelimiterMatch
} from "./parser";

import { mathTokens, matchingBraces } from "./highlight";

const readingParseCache = new Map<string, MathDelimiterMatch[]>();
function readingMatches(text: string): MathDelimiterMatch[] {
  const cached = readingParseCache.get(text);
  if (cached) return cached;
  const matches = findMathDelimiters(text);
  if (text.length <= 2_000_000) {
    if (readingParseCache.size >= 2) { for (const key of readingParseCache.keys()) { readingParseCache.delete(key); break; } }
    readingParseCache.set(text, matches);
  }
  return matches;
}

const READING_RENDER_MARKER = "data-lsd-math-section";

function renderFormula(source: string, display: boolean, blockHost = display, ownerDocument = document): HTMLElement {
  const wrapper = ownerDocument.createElement(blockHost ? "div" : "span");
  wrapper.className = blockHost
    ? "lsd-math lsd-math-block"
    : "lsd-math lsd-math-inline";
  try {
    wrapper.appendChild(renderMath(source, display));
  } catch (error) {
    wrapper.textContent = display ? `\\[${source}\\]` : `\\(${source}\\)`;
    wrapper.classList.add("lsd-render-error");
    wrapper.title = `MathJax could not render this equation: ${String(error)}`;
  }
  return wrapper;
}

type RenderedCharacter = { node: Text; offset: number };

function renderedCharacters(element: HTMLElement): {
  text: string;
  characters: RenderedCharacter[];
} {
  let text = "";
  const characters: RenderedCharacter[] = [];

  function visit(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).matches("code, pre, .math, mjx-container, script, style, .lsd-math, .latex-delimiter-renderer")) {
      const boundary = element.ownerDocument.createTextNode("\u0000");
      text += boundary.data; characters.push({ node: boundary, offset: 0 });
      return;
    }
    if (node.instanceOf(Text)) {
      for (let offset = 0; offset < node.data.length; offset++) {
        text += node.data[offset];
        characters.push({ node, offset });
      }
      return;
    }
    for (const child of Array.from(node.childNodes)) visit(child);
  }

  visit(element);
  return { text, characters };
}

const disabledRenderers = new WeakSet<Plugin>();
const renderScopes = new WeakMap<Plugin, Set<ReadingRenderScope>>();
const elementScopes = new WeakMap<HTMLElement, ReadingRenderScope>();
class ReadingRenderScope extends MarkdownRenderChild {
  replacements: Array<{ element: HTMLElement; original: DocumentFragment }> = [];
  constructor(element: HTMLElement, readonly context: MarkdownPostProcessorContext, readonly plugin: Plugin) { super(element); }
  onload(): void {
    let scopes = renderScopes.get(this.plugin);
    if (!scopes) { scopes = new Set(); renderScopes.set(this.plugin, scopes); }
    scopes.add(this); elementScopes.set(this.containerEl, this);
  }
  restore(): void {
    for (const replacement of this.replacements) if (replacement.element.parentNode) replacement.element.replaceWith(replacement.original);
    this.replacements = [];
  }
  onunload(): void { this.restore(); renderScopes.get(this.plugin)?.delete(this); elementScopes.delete(this.containerEl); }
}

// Live Preview renders table cells and callout titles separately, often with
// no section metadata. Wait until their widget is attached, then recover the
// exact source fragment through CodeMirror's public DOM-position API.
class EmbeddedMathRenderChild extends MarkdownRenderChild {
  constructor(element: HTMLElement, private readonly context: MarkdownPostProcessorContext, private readonly plugin: Plugin) { super(element); }
  onload(): void {
    const timerWindow = this.containerEl.ownerDocument.defaultView ?? window;
    let frame = 0, attempts = 0;
    this.register(() => timerWindow.cancelAnimationFrame(frame));
    const resolve = (): void => {
      const editor = this.containerEl.closest<HTMLElement>(".cm-editor");
      const view = editor ? EditorView.findFromDOM(editor) : null;
      if (!view) { if (++attempts < 10) frame = timerWindow.requestAnimationFrame(resolve); return; }
      let text: string | undefined;
      try {
        const position = view.posAtDOM(this.containerEl);
        const line = view.state.doc.lineAt(position);
        const cell = this.containerEl.closest<HTMLTableCellElement>("td, th");
        if (cell) {
          const row = cell.parentElement as HTMLTableRowElement;
          const rowNumber = line.number + (row.rowIndex === 0 ? 0 : row.rowIndex + 1);
          if (rowNumber > view.state.doc.lines) return;
          const rowSource = view.state.doc.line(rowNumber).text;
          const spans = tableCellSources(rowSource);
          if (spans.length !== row.cells.length) return;
          const span = spans[cell.cellIndex];
          if (span) text = rowSource.slice(span.from, span.to).trim();
        } else if (this.containerEl.closest(".callout-title")) {
          text = line.text.replace(/^(?: {0,3}>[ \t]?)+\[![^\]]+\][+-]?[ \t]*/, "");
        }
      } catch { return; }
      if (!text) return;
      const section = { text, lineStart: 0, lineEnd: text.split("\n").length - 1 };
      const context: MarkdownPostProcessorContext = {
        docId: this.context.docId, sourcePath: this.context.sourcePath, frontmatter: this.context.frontmatter as unknown,
        addChild: child => this.context.addChild(child), getSectionInfo: () => section
      };
      void renderReadingView(this.containerEl, context, this.plugin).catch(error => console.error("Standard delimiters embedded rendering:", error));
    };
    frame = timerWindow.requestAnimationFrame(resolve);
  }
}

async function renderReadingView(
  element: HTMLElement,
  context: MarkdownPostProcessorContext,
  plugin: Plugin
): Promise<void> {
  if (disabledRenderers.has(plugin) || element.closest(`[${READING_RENDER_MARKER}="template"]`)) return;

  const section = context.getSectionInfo(element);
  if (!section) { context.addChild(new EmbeddedMathRenderChild(element, context, plugin)); return; }
  const lineStarts = [0];
  for (let i = 0; i < section.text.length; i++) if (section.text[i] === "\n") lineStarts.push(i + 1);
  const sectionStart = lineStarts[section.lineStart] ?? 0;
  const sectionEnd = lineStarts[section.lineEnd + 1] ?? section.text.length;
  const matches = readingMatches(section.text).filter(match => match.from >= sectionStart && match.to <= sectionEnd);
  if (matches.length === 0) return;

  const rendered = renderedCharacters(element);
  const replacements: Array<{
    from: number;
    to: number;
    match: MathDelimiterMatch;
  }> = [];

  for (const match of matches) {
    // Ask the actual Markdown renderer what visible text corresponds to this
    // formula. This survives escaped punctuation and emphasis consumed by Markdown.
    // The marker prevents our own processor recursing into this detached template.
    const template = element.ownerDocument.createElement("div");
    template.setAttribute(READING_RENDER_MARKER, "template");
    const component = new Component();
    component.load();
    let visibleSource: string;
    try {
      let startMarker = "\uE000LSD_START\uE001";
      let endMarker = "\uE000LSD_END\uE001";
      while (section.text.includes(startMarker) || section.text.includes(endMarker)) {
        startMarker += "_"; endMarker += "_";
      }
      const markedSource = section.text.slice(sectionStart, match.from) + startMarker +
        section.text.slice(match.from, match.to) + endMarker + section.text.slice(match.to, sectionEnd);
      await MarkdownRenderer.render(plugin.app, markedSource, template, context.sourcePath, component);
      const markedText = renderedCharacters(template).text;
      const start = markedText.indexOf(startMarker);
      const end = markedText.indexOf(endMarker);
      if (start < 0 || end < start) continue;
      visibleSource = markedText.slice(start + startMarker.length, end);
      const cleanText = markedText.slice(0, start) + visibleSource + markedText.slice(end + endMarker.length);
      const wholeSectionAt = rendered.text.indexOf(cleanText);
      if (wholeSectionAt !== -1) {
        replacements.push({ from: wholeSectionAt + start, to: wholeSectionAt + start + visibleSource.length, match });
        continue;
      }
    } finally { component.unload(); }
    if (!visibleSource) continue;
    let from = rendered.text.indexOf(visibleSource);
    while (
      from !== -1 &&
      replacements.some(
        (replacement) =>
          from < replacement.to && from + visibleSource.length > replacement.from
      )
    ) {
      from = rendered.text.indexOf(visibleSource, from + 1);
    }
    if (from !== -1) {
      replacements.push({ from, to: from + visibleSource.length, match });
    }
  }

  if (disabledRenderers.has(plugin) || replacements.length === 0) return;

  let scope = elementScopes.get(element);
  if (!scope) { scope = new ReadingRenderScope(element, context, plugin); context.addChild(scope); }
  replacements.sort((left, right) => right.from - left.from);
  for (const replacement of replacements) {
    const first = rendered.characters[replacement.from];
    const last = rendered.characters[replacement.to - 1];
    if (!first || !last) continue;

    const range = element.ownerDocument.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, last.offset + 1);
    const original = range.cloneContents();
    range.deleteContents();
    const math = renderFormula(replacement.match.source, replacement.match.display, replacement.match.display, element.ownerDocument);
    range.insertNode(math);
    scope.replacements.push({ element: math, original });
  }
  await finishRenderMath();
}

function rangeTouchesSelection(state: EditorState, match: MathDelimiterMatch): boolean {
  return state.selection.ranges.some((range) => {
    if (range.empty) {
      return range.from >= match.from && range.from <= match.to;
    }
    return range.from < match.to && range.to > match.from;
  });
}

class MathWidget extends WidgetType {
  constructor(
    private readonly source: string,
    private readonly display: boolean,
    private readonly block: boolean,
    private readonly revealPosition: number
  ) {
    super();
  }

  eq(other: MathWidget): boolean {
    return (
      this.source === other.source &&
      this.display === other.display &&
      this.block === other.block &&
      this.revealPosition === other.revealPosition
    );
  }

  toDOM(view: EditorView): HTMLElement {
    const element = renderFormula(this.source, this.display, this.block, view.dom.ownerDocument);
    const reveal = () => {
      // A composing editor owns its selection until the input method commits.
      if (view.composing) return;
      view.dispatch({ selection: { anchor: this.revealPosition }, scrollIntoView: true });
      view.focus();
    };
    element.addEventListener("mousedown", event => {
      if (event.button !== 0 || view.composing) return;
      event.preventDefault();
      event.stopPropagation();
      reveal();
    });
    // Touch taps must reveal source, while swipes and long presses retain the
    // browser's scrolling and selection behavior. Do not prevent pointerdown.
    let touch: { id: number; x: number; y: number; time: number; moved: boolean } | null = null;
    element.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch" || !event.isPrimary) return;
      touch = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, moved: false };
    });
    element.addEventListener("pointermove", event => {
      if (touch?.id === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true;
    });
    element.addEventListener("pointercancel", () => { touch = null; });
    element.addEventListener("pointerup", event => {
      const start = touch;
      touch = null;
      if (!start || start.moved || start.id !== event.pointerId || event.timeStamp - start.time > 500 ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
      reveal();
    });
    queueMicrotask(() => { void finishRenderMath(); });
    return element;
  }

  ignoreEvent(event: Event): boolean {
    return event.type === "mousedown" || event.type.startsWith("pointer");
  }
}

class EditingPreviewWidget extends WidgetType {
  constructor(private readonly source: string, private readonly display: boolean) { super(); }
  eq(other: EditingPreviewWidget): boolean { return this.source === other.source && this.display === other.display; }
  toDOM(view: EditorView): HTMLElement {
    const element = renderFormula(this.source, this.display, true, view.dom.ownerDocument);
    element.classList.add("lsd-editing-preview");
    element.setAttribute("aria-label", "Equation preview");
    queueMicrotask(() => { void finishRenderMath(); });
    return element;
  }
}

class LiteralMarkerWidget extends WidgetType {
  constructor(private readonly marker: string) {
    super();
  }

  eq(other: LiteralMarkerWidget): boolean {
    return this.marker === other.marker;
  }

  toDOM(view: EditorView): HTMLElement {
    const element = view.dom.ownerDocument.createElement("span");
    const kind = this.marker === "\\" || /[()[\]]/.test(this.marker) ? "delimiter" : "operator";
    element.className = `lsd-math-source-marker lsd-token-${kind}`;
    element.textContent = this.marker;
    return element;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function markdownFormattingMarkersInMath(
  state: EditorState,
  match: MathDelimiterMatch
): Array<{ from: number; to: number; text: string }> {
  const markers: Array<{ from: number; to: number; text: string }> = [];

  syntaxTree(state).iterate({
    from: match.from,
    to: match.to,
    enter(node) {
      if (
        (node.name.includes("formatting-em") ||
          node.name.includes("formatting-strong") ||
          node.name.includes("formatting-escape")) &&
        node.from >= match.from &&
        node.to <= match.to
      ) {
        markers.push({
          from: node.from,
          to: node.to,
          text: state.doc.sliceString(node.from, node.to)
        });
      }
      return true;
    }
  });

  // Syntax nodes may share ranges. Never insert two widgets for one character.
  return markers.filter((marker, index) => !markers.slice(0, index).some(previous =>
    marker.from < previous.to && marker.to > previous.from));
}

function lowerBound(values: number[], position: number): number {
  let low = 0, high = values.length;
  while (low < high) { const middle = (low + high) >>> 1; if (values[middle] < position) low = middle + 1; else high = middle; }
  return low;
}

const spillCache = new WeakMap<object, { tree: ReturnType<typeof syntaxTree>; spills: Array<{ from: number; to: number }> }>();
function emphasisSpills(state: EditorState, matches: MathDelimiterMatch[]): Array<{ from: number; to: number }> {
  const tree = syntaxTree(state);
  const cached = spillCache.get(state.doc);
  if (cached?.tree === tree) return cached.spills;
  const emphasis: number[] = [], strong: number[] = [];
  tree.iterate({ enter(node) {
    if (node.name.includes("formatting-em")) emphasis.push(node.from);
    if (node.name.includes("formatting-strong")) strong.push(node.from);
  } });
  const breaks = [...state.doc.toString().matchAll(/\n[\t ]*\n/g)].map(match => match.index);
  const spills: Array<{ from: number; to: number }> = [];
  for (const match of matches) {
    const paragraphEnd = breaks[lowerBound(breaks, match.to)] ?? state.doc.length;
    for (const markers of [emphasis, strong]) {
      const start = lowerBound(markers, match.from), end = lowerBound(markers, match.to);
      if ((end - start) % 2 === 0) continue;
      const spillEnd = Math.min(markers[end] ?? paragraphEnd, paragraphEnd);
      if (spillEnd > match.to) spills.push({ from: match.to, to: spillEnd });
    }
  }
  spillCache.set(state.doc, { tree, spills });
  return spills;
}

const renderOptions = Facet.define<{ previews: boolean; enabled: boolean }, { previews: boolean; enabled: boolean }>({
  combine: values => values[0] ?? { previews: true, enabled: true }
});
const parsedDocuments = new WeakMap<object, MathDelimiterMatch[]>();
function parsedMatches(state: EditorState): MathDelimiterMatch[] {
  let matches = parsedDocuments.get(state.doc);
  if (!matches) {
    matches = findMathDelimiters(state.doc.toString());
    parsedDocuments.set(state.doc, matches);
  }
  return matches;
}

const setComposing = StateEffect.define<boolean>();
const compositionState = StateField.define<boolean>({
  create: () => false,
  update(value, transaction) {
    for (const effect of transaction.effects) if (effect.is(setComposing)) value = effect.value;
    return value;
  }
});
const compositionEvents = EditorView.domEventHandlers({
  compositionstart(_event, view) {
    view.dispatch({ effects: setComposing.of(true) });
    return false;
  },
  compositionend(_event, view) {
    // Let CodeMirror commit the composed text before rebuilding widgets.
    queueMicrotask(() => {
      if (view.dom.isConnected && view.state.field(compositionState, false)) view.dispatch({ effects: setComposing.of(false) });
    });
    return false;
  }
});

// Obsidian's Vim normal mode marks the scroller with cm-vimMode. Keep
// complete source visible there so native motions, counts and macros retain
// logical lines. Do not intercept Vim keys or access its private state.
const setVimSource = StateEffect.define<boolean>();
const vimSourceState = StateField.define<boolean>({
  create: () => false,
  update(value, transaction) {
    for (const effect of transaction.effects) if (effect.is(setVimSource)) value = effect.value;
    return value;
  }
});
const vimSourceObserver = ViewPlugin.fromClass(class {
  private destroyed = false;
  private queued = false;
  private observer: MutationObserver;
  constructor(private view: EditorView) {
    const Observer = view.dom.ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
    this.observer = new Observer(() => this.refresh());
    this.observer.observe(view.scrollDOM, { attributes: true, attributeFilter: ["class"] });
    this.refresh();
  }
  private refresh(): void {
    if (this.queued || this.destroyed) return;
    this.queued = true;
    queueMicrotask(() => {
      this.queued = false;
      if (this.destroyed) return;
      const active = this.view.scrollDOM.classList.contains("cm-vimMode");
      if (active !== this.view.state.field(vimSourceState)) this.view.dispatch({ effects: setVimSource.of(active) });
    });
  }
  destroy(): void { this.destroyed = true; this.observer.disconnect(); }
});

function buildLivePreviewDecorations(state: EditorState): DecorationSet {
  const options = state.facet(renderOptions);
  if (!options.enabled || !state.field(editorLivePreviewField, false)) return Decoration.none;
  const matches = parsedMatches(state);
  const composing = state.field(compositionState, false) === true;
  const vimSource = state.field(vimSourceState, false) === true;
  let previewAdded = false;
  const ranges: ReturnType<Decoration["range"]>[] = [];

  for (const spill of emphasisSpills(state, matches)) {
    ranges.push(Decoration.mark({ class: "lsd-math-emphasis-spill" }).range(spill.from, spill.to));
  }
  for (const match of matches) {
    if (vimSource || rangeTouchesSelection(state, match)) {
      for (const token of mathTokens(match.source, match.from + 2)) {
        ranges.push(Decoration.mark({ class: `lsd-token-${token.kind}` }).range(token.from, token.to));
      }
      for (const edge of [match.from, match.to - 2]) {
        ranges.push(Decoration.mark({ class: "lsd-token-delimiter" }).range(edge, edge + 2));
      }
      for (const selection of state.selection.ranges) {
        if (!selection.empty) continue;
        const braces = matchingBraces(match.source, selection.head - match.from - 2);
        for (const brace of braces) {
          const position = match.from + 2 + brace;
          ranges.push(Decoration.mark({ class: braces.length === 2 ? "lsd-brace-match" : "lsd-brace-unmatched" }).range(position, position + 1));
        }
      }
      ranges.push(
        Decoration.mark({ class: "lsd-math-source" }).range(
          match.from,
          match.to
        )
      );
      for (const marker of composing ? [] : markdownFormattingMarkersInMath(state, match)) {
        ranges.push(
          Decoration.replace({
            widget: new LiteralMarkerWidget(marker.text)
          }).range(marker.from, marker.to)
        );
      }
      // A block widget after the final source line avoids changing the line's
      // text or placing uneditable rendered content between source characters.
      if (!vimSource && !composing && options.previews && !previewAdded && state.selection.ranges.length === 1 && state.selection.main.empty) {
        previewAdded = true;
        ranges.push(Decoration.widget({
        widget: new EditingPreviewWidget(match.source, match.display),
        block: true,
        side: 1
      }).range(state.doc.lineAt(match.to).to));
      }
      continue;
    }

    const startLine = state.doc.lineAt(match.from);
    const endLine = state.doc.lineAt(match.to);
    const crossesLines = startLine.number !== endLine.number;
    const isWholeLineBlock =
      match.display && match.from === startLine.from && match.to === endLine.to;

    if (crossesLines && !isWholeLineBlock) continue;

    ranges.push(
      Decoration.replace({
        widget: new MathWidget(
          match.source,
          match.display,
          isWholeLineBlock,
          match.from + 2
        ),
        block: isWholeLineBlock
      }).range(match.from, match.to)
    );
  }
  return Decoration.set(ranges, true);
}

const livePreviewExtension = StateField.define<DecorationSet>({
  create: buildLivePreviewDecorations,
  update(decorations, transaction) {
    const livePreviewChanged =
      transaction.startState.field(editorLivePreviewField, false) !==
      transaction.state.field(editorLivePreviewField, false);
    const selectionChanged = !transaction.startState.selection.eq(transaction.state.selection);
    if (transaction.startState.field(vimSourceState, false) !== transaction.state.field(vimSourceState, false) || transaction.startState.field(compositionState, false) !== transaction.state.field(compositionState, false) || transaction.startState.facet(renderOptions) !== transaction.state.facet(renderOptions) || transaction.docChanged || livePreviewChanged || selectionChanged || syntaxTree(transaction.startState) !== syntaxTree(transaction.state)) {
      return buildLivePreviewDecorations(transaction.state);
    }
    return decorations;
  },
  provide: (field) => Prec.highest(EditorView.decorations.from(field))
});

function enterMathVertically(view: EditorView, forward: boolean): boolean {
  const state = view.state;
  if (view.composing) return false;
  if (!state.facet(renderOptions).enabled || !state.field(editorLivePreviewField, false) || state.selection.ranges.length !== 1 || !state.selection.main.empty) return false;
  const matches = parsedMatches(state);
  if (matches.some(match => rangeTouchesSelection(state, match))) return false;
  const head = state.selection.main.head;
  const target = view.moveVertically(state.selection.main, forward).head;
  const candidates = matches.filter(match => match.display &&
    match.from === state.doc.lineAt(match.from).from && match.to === state.doc.lineAt(match.to).to &&
    (forward ? match.from >= head && match.from <= target : match.to <= head && match.to >= target));
  const match = forward ? candidates[0] : candidates[candidates.length - 1];
  if (!match) return false;
  const anchor = forward ? match.from + 2 : match.to - 2;
  view.dispatch({ selection: { anchor }, scrollIntoView: true });
  return true;
}

const mathNavigation = Prec.highest(keymap.of([
  { key: "ArrowDown", run: view => enterMathVertically(view, true) },
  { key: "ArrowUp", run: view => enterMathVertically(view, false) }
]));

const COLOR_KINDS = ["command", "brace", "number", "operator", "delimiter", "comment"] as const;
type Colors = Partial<Record<typeof COLOR_KINDS[number], string>>;

export default class LatexDelimiterRenderer extends Plugin {
  colors: Colors = {};
  editingPreviews = true;
  renderingMode: "automatic" | "off" = "automatic";
  private knownRendererConflict = false;
  private rendererEnabled = true;
  private disposed = false;
  private checkingConflict = false;
  private embeddedChildren = new Map<HTMLElement, EmbeddedMathRenderChild>();
  private extensions = [livePreviewExtension, EditorView.theme({}), mathNavigation, renderOptions.of({ previews: true, enabled: true }), compositionState, compositionEvents, vimSourceState, vimSourceObserver];

  async saveColors(): Promise<void> {
    await this.saveData({ colors: this.colors, editingPreviews: this.editingPreviews, renderingMode: this.renderingMode });
    await this.checkRendererConflict();
    this.applyColors();
    this.app.workspace.updateOptions();
  }

  private applyColors(): void {
    const variables: Record<string, string> = {};
    for (const kind of COLOR_KINDS) {
      const value = this.colors[kind];
      if (value && /^#[0-9a-f]{6}$/i.test(value)) variables[`--lsd-${kind}`] = value;
    }
    this.extensions[1] = EditorView.theme({ "&": variables });
    this.extensions[3] = renderOptions.of({ previews: this.editingPreviews, enabled: this.rendererEnabled });
  }

  async onload(): Promise<void> {
    const saved = await this.loadData() as { colors?: Colors; editingPreviews?: boolean; renderingMode?: string } | null;
    this.colors = saved?.colors && typeof saved.colors === "object" ? saved.colors : {};
    this.editingPreviews = saved?.editingPreviews !== false;
    this.renderingMode = saved?.renderingMode === "off" ? "off" : "automatic";
    await this.checkRendererConflict();
    this.applyColors();
    this.addSettingTab(new MathColorsTab(this));
    await loadMathJax();

    this.registerMarkdownPostProcessor((element, context) => {
      if (this.rendererEnabled) return renderReadingView(element, context, this);
    });
    this.registerEditorExtension(this.extensions);
    this.registerInterval(window.setInterval(() => { void this.checkRendererConflict(); this.refreshEmbeddedMath(); }, 2000));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.refreshEmbeddedMath()));

    this.app.workspace.onLayoutReady(() => {
      this.app.workspace.updateOptions();
      this.refreshEmbeddedMath();
    });
  }

  private async checkRendererConflict(): Promise<void> {
    if (this.checkingConflict || this.disposed) return;
    this.checkingConflict = true;
    try {
      const configPath = `${this.app.vault.configDir}/community-plugins.json`;
      const value: unknown = await this.app.vault.adapter.exists(configPath)
        ? JSON.parse(await this.app.vault.adapter.read(configPath)) : [];
      if (!Array.isArray(value) || this.disposed) return;
      this.knownRendererConflict = value.includes("latex-delimiter-renderer");
      const enabled = this.renderingMode === "automatic" && !this.knownRendererConflict;
      if (enabled === this.rendererEnabled) return;
      this.rendererEnabled = enabled;
      if (enabled) disabledRenderers.delete(this); else disabledRenderers.add(this);
      for (const scope of renderScopes.get(this) ?? []) {
        if (!enabled) scope.restore();
        else void renderReadingView(scope.containerEl, scope.context, this);
      }
      if (!enabled && this.renderingMode === "automatic") new Notice("Another delimiter renderer is enabled. Standard delimiter rendering is paused here to prevent duplicate equations. Disable the other delimiter renderer to resume automatically. You can inspect rendering status in this plugin’s settings.", 10000);
      this.applyColors();
      this.app.workspace.updateOptions();
      this.app.workspace.iterateAllLeaves(leaf => {
        if (leaf.view instanceof MarkdownView) leaf.view.previewMode.rerender(true);
      });
    } catch {
      // Hidden configuration may be temporarily unavailable during syncing.
      // Keep the last known state and retry without breaking the editor.
    } finally { this.checkingConflict = false; }
  }

  get renderingStatus(): string {
    if (this.renderingMode === "off") return "Rendering is off by your choice. Other plugins can handle equations.";
    if (this.knownRendererConflict) return "Paused: LaTeX Delimiter Renderer is enabled. Disable it to let this plugin handle standard delimiters.";
    return "Active: this plugin handles standard delimiters. MathJax extensions continue to use the shared engine.";
  }

  async refreshRenderingStatus(): Promise<void> { await this.checkRendererConflict(); }

  private refreshEmbeddedMath(): void {
    for (const [element, child] of this.embeddedChildren) {
      if (!element.isConnected) { this.removeChild(child); this.embeddedChildren.delete(element); }
    }
    if (!this.rendererEnabled || this.disposed) return;
    this.app.workspace.iterateAllLeaves(leaf => {
      if (!(leaf.view instanceof MarkdownView) || !leaf.view.file) return;
      const sourcePath = leaf.view.file.path;
      for (const element of Array.from(leaf.view.containerEl.querySelectorAll<HTMLElement>(".cm-table-widget td, .cm-table-widget th, .cm-callout .callout-title-inner"))) {
        if (this.embeddedChildren.has(element) || element.querySelector(".lsd-math")) continue;
        const context: MarkdownPostProcessorContext = {
          docId: sourcePath, sourcePath, frontmatter: null,
          addChild: child => { this.addChild(child); }, getSectionInfo: () => null
        };
        const child = new EmbeddedMathRenderChild(element, context, this);
        this.embeddedChildren.set(element, child); this.addChild(child);
      }
    });
  }

  onunload(): void {
    this.disposed = true; disabledRenderers.add(this);
    for (const scope of renderScopes.get(this) ?? []) scope.restore();
    renderScopes.get(this)?.clear();
    this.embeddedChildren.clear(); readingParseCache.clear();
  }

}

// Imperative settings remain available in the plugin sidebar.
class MathColorsTab extends PluginSettingTab {
  constructor(private readonly plugin: LatexDelimiterRenderer) { super(plugin.app, plugin); }
  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl("p", { text: "Colors apply to equation source while editing. Leave a field empty to follow your theme. Enter a six-digit hex color, for example #88aaff." });
    new Setting(this.containerEl).setName("Standard delimiter rendering").setDesc("Automatic pauses for the known competing renderer. Off leaves rendering to other tools. This never changes another plugin’s settings.").addDropdown(dropdown => {
      dropdown.addOption("automatic", "Automatic").addOption("off", "Off").setValue(this.plugin.renderingMode).onChange(async value => {
        this.plugin.renderingMode = value === "off" ? "off" : "automatic";
        await this.plugin.saveColors();
        this.display();
      });
    });
    new Setting(this.containerEl).setName("Rendering status").setDesc(this.plugin.renderingStatus).addButton(button => {
      button.setButtonText("Refresh").onClick(async () => { await this.plugin.refreshRenderingStatus(); this.display(); });
    });
    new Setting(this.containerEl).setName("Preview equations while editing").setDesc("Show a rendered preview beneath the active equation. Selections and multiple cursors do not show previews.").addToggle(toggle => {
      toggle.setValue(this.plugin.editingPreviews).onChange(async value => {
        this.plugin.editingPreviews = value;
        await this.plugin.saveColors();
      });
    });
    for (const kind of COLOR_KINDS) {
      new Setting(this.containerEl).setName(`${kind[0].toUpperCase()}${kind.slice(1)} color`).addText(input => {
        input.setPlaceholder("Theme default").setValue(this.plugin.colors[kind] ?? "").onChange(async value => {
          if (value !== "" && !/^#[0-9a-f]{6}$/i.test(value)) return;
          this.plugin.colors[kind] = value;
          await this.plugin.saveColors();
        });
      });
    }
  }
}
