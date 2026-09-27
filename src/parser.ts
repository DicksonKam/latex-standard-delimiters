export type MathDelimiterMatch = { from: number; to: number; source: string; display: boolean };
export type ProtectedRange = { from: number; to: number; indented?: boolean };

function escapeFlags(text: string): Uint8Array {
  const flags = new Uint8Array(text.length);
  let odd = false;
  for (let i = 0; i < text.length; i++) { flags[i] = Number(odd); odd = text[i] === "\\" ? !odd : false; }
  return flags;
}

/** Return Markdown regions that must never be interpreted as our math. */
export function protectedRanges(text: string): ProtectedRange[] {
  const ranges: ProtectedRange[] = [];
  const lines = /[^\n]*(?:\n|$)/g;
  let fence: { char: string; length: number; from: number } | undefined;
  let frontmatter = false;
  let listIndent: number | undefined;
  for (const line of text.matchAll(lines)) {
    if (!line[0]) continue;
    const from = line.index;
    // Strip blockquote markers so fenced examples in callouts are protected too.
    const body = line[0].replace(/^(?: {0,3}>[ \t]?)+/, "").replace(/\r?\n$/, "");
    if (from === 0 && line[0].replace(/\r?\n$/, "") === "---") { frontmatter = true; continue; }
    if (frontmatter) {
      if (/^(?:---|\.\.\.)\s*$/.test(body)) { ranges.push({ from: 0, to: from + line[0].length }); frontmatter = false; }
      continue;
    }
    const listMarker = /^[ \t]*(?:[-+*]|\d{1,9}[.)])[ \t]+/.exec(body);
    const indent = /^[ \t]*/.exec(body)![0].length;
    if (!fence) {
      if (listMarker) listIndent = listMarker[0].length;
      else if (body.trim() && listIndent !== undefined && indent < listIndent) listIndent = undefined;
    }
    const fenceBody = fence ? body : body.replace(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/, "");
    const marker = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(fenceBody);
    if (fence) {
      if (marker && marker[1][0] === fence.char && marker[1].length >= fence.length && /^\s*$/.test(marker[2])) {
        ranges.push({ from: fence.from, to: from + line[0].length }); fence = undefined;
      }
    } else if (marker && !(marker[1][0] === "`" && marker[2].includes("`"))) {
      fence = { char: marker[1][0], length: marker[1].length, from };
    } else if (/^(?: {4}|\t)/.test(body) && (listIndent === undefined || indent >= listIndent + 4)) ranges.push({ from, to: from + line[0].length, indented: true });
  }
  if (frontmatter) ranges.push({ from: 0, to: text.length });
  if (fence) ranges.push({ from: fence.from, to: text.length });
  for (const match of text.matchAll(/<!--[\s\S]*?(?:-->|$)|<(pre|code|script|style)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi)) {
    ranges.push({ from: match.index, to: match.index + match[0].length });
  }
  ranges.sort((a, b) => a.from - b.from);
  return ranges;
}

/** Scan once, preserving offsets and skipping Markdown code and native dollar math. */
export function findMathInMarkdown(text: string, offset = 0): MathDelimiterMatch[] {
  const matches: MathDelimiterMatch[] = [];
  const escaped = escapeFlags(text);
  const protectedBlocks = protectedRanges(text);
  let blockIndex = 0;
  for (let cursor = 0; cursor < text.length;) {
    while (blockIndex < protectedBlocks.length && protectedBlocks[blockIndex].to <= cursor) blockIndex++;
    const block = protectedBlocks[blockIndex];
    if (block && cursor >= block.from) { cursor = block.to; continue; }
    if (text[cursor] === "`" && !escaped[cursor]) {
      const run = /^`+/.exec(text.slice(cursor))![0];
      let end = cursor + run.length;
      for (;;) {
        end = text.indexOf(run, end);
        if (end === -1) break;
        if (text[end - 1] !== "`" && text[end + run.length] !== "`") break;
        end += run.length;
      }
      if (end !== -1) { cursor = end + run.length; continue; }
      cursor += run.length; continue;
    }
    if (text[cursor] === "$" && !escaped[cursor]) {
      const delimiter = text[cursor + 1] === "$" ? "$$" : "$";
      let end = cursor + delimiter.length;
      for (;;) {
        end = text.indexOf(delimiter, end);
        if (end === -1 || !escaped[end]) break;
        end += delimiter.length;
      }
      // Inline dollars require nonspace content and a nonspace closing edge.
      if (end !== -1 && (delimiter === "$$" || (!/\s/.test(text[cursor + 1] ?? " ") && !/\s/.test(text[end - 1]) && !text.slice(cursor, end).includes("\n")))) {
        cursor = end + delimiter.length; continue;
      }
    }
    if (text[cursor] === "\\" && !escaped[cursor] && /[([]/.test(text[cursor + 1] ?? "")) {
      const display = text[cursor + 1] === "[";
      const closing = display ? "\\]" : "\\)";
      let end = cursor + 2;
      for (; end < text.length; end++) {
        // TeX comments continue to the next line. A closing delimiter in a
        // comment cannot end the formula, whereas escaped \% is literal.
        if (text[end] === "%" && !escaped[end]) {
          const newline = text.indexOf("\n", end);
          if (newline === -1 || !display) { end = -1; break; }
          end = newline;
          continue;
        }
        if (!display && text[end] === "\n") { end = -1; break; }
        if (text.startsWith(closing, end) && !escaped[end]) break;
        // Recover at a fresh opener instead of consuming the next formula
        // as part of an incomplete preceding equation.
        if (text[end] === "\\" && !escaped[end] && /[([]/.test(text[end + 1] ?? "")) { end = -1; break; }
      }
      if (end >= text.length) end = -1;
      let nextBlock = false;
      for (let i = blockIndex; i < protectedBlocks.length && protectedBlocks[i].from < end + 2; i++) {
        if (!protectedBlocks[i].indented && protectedBlocks[i].from > cursor) { nextBlock = true; break; }
      }
      const source = end === -1 ? "" : text.slice(cursor + 2, end);
      if (end !== -1 && !nextBlock && source.trim() && (display || !source.includes("\n"))) {
        matches.push({ from: offset + cursor, to: offset + end + 2, source, display });
        cursor = end + 2; continue;
      }
    }
    cursor++;
  }
  return matches;
}

// Kept as the public pure parser name for consumers of the original renderer.
export const findMathDelimiters = findMathInMarkdown;

/** Source spans for rendered Markdown table cells, excluding boundary pipes. */
export function tableCellSources(line: string): Array<{ from: number; to: number }> {
  const cells: Array<{ from: number; to: number }> = [];
  const escaped = escapeFlags(line);
  let start = 0, codeRun = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "`" && !escaped[i]) {
      const length = /^`+/.exec(line.slice(i))![0].length;
      if (codeRun === 0) codeRun = length; else if (codeRun === length) codeRun = 0;
      i += length - 1;
    } else if (line[i] === "|" && !codeRun && !escaped[i]) {
      cells.push({ from: start, to: i }); start = i + 1;
    }
  }
  cells.push({ from: start, to: line.length });
  if (line.trimStart().startsWith("|")) cells.shift();
  if (line.trimEnd().endsWith("|") && !escaped[line.trimEnd().length - 1]) cells.pop();
  return cells;
}
