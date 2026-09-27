import type { MathDelimiterMatch } from './parser';

export type MathSourceSegment = { from: number; to: number; sourceFrom: number };
export type MathPresentation = {
  source: string;
  segments: MathSourceSegment[];
  container: 'plain' | 'quote' | 'list';
  standalone: boolean;
  projected: boolean;
};

/** Project container math to TeX without changing source or its document offsets. */
export function mathPresentation(text: string, match: MathDelimiterMatch): MathPresentation {
  const openingLine = text.lastIndexOf('\n', match.from - 1) + 1;
  const prefix = text.slice(openingLine, match.from);
  const quote = /^(?: {0,3}>[ \t]?)+/.exec(prefix)?.[0] ?? '';
  const quoteDepth = (quote.match(/>/g) ?? []).length;
  const afterQuote = prefix.slice(quote.length);
  const list = /^([ \t]*)(?:[-+*]|\d{1,9}[.)])([ \t]+)$/.exec(afterQuote);
  const plainPrefix = /^[ \t]*$/.test(afterQuote);
  const closingLineEnd = text.indexOf('\n', match.to);
  const suffix = text.slice(match.to, closingLineEnd < 0 ? text.length : closingLineEnd);
  let standalone = match.display && !!(list || plainPrefix) && /^[ \t\r]*$/.test(suffix);
  let continuationIndent = 0;
  if (!list && plainPrefix && afterQuote.length > 0) {
    const preceding = text.slice(0, openingLine).split('\n');
    for (let i = preceding.length - 1; i >= 0; i--) {
      const previousQuote = /^(?: {0,3}>[ \t]?)+/.exec(preceding[i])?.[0] ?? '';
      const previous = preceding[i].slice(previousQuote.length);
      if (!previous.trim()) continue;
      if ((previousQuote.match(/>/g) ?? []).length !== quoteDepth) break;
      const owner = /^[ \t]*(?:[-+*]|\d{1,9}[.)])[ \t]+/.exec(previous);
      if (owner) {
        if (afterQuote.length >= owner[0].length) continuationIndent = owner[0].length;
        break;
      }
      if ((/^[ \t]*/.exec(previous)?.[0].length ?? 0) < afterQuote.length) break;
    }
  }
  const container = quoteDepth ? 'quote' : list || continuationIndent ? 'list' : 'plain';
  const raw = text.slice(match.from + 2, match.to - 2);
  if (container === 'plain' || (!standalone && !(match.display && (quoteDepth || list || continuationIndent)))) {
    return { source: raw, segments: raw ? [{ from: match.from + 2, to: match.to - 2, sourceFrom: 0 }] : [], container, standalone, projected: false };
  }
  let source = '';
  const segments: MathSourceSegment[] = [];
  const listIndent = list ? afterQuote.length : continuationIndent;
  let first = true;
  let valid = true;
  for (const line of raw.matchAll(/[^\n]*(?:\n|$)/g)) {
    if (!line[0]) continue;
    let remove = 0;
    if (!first) {
      const lineQuote = /^(?: {0,3}>[ \t]?)+/.exec(line[0])?.[0] ?? '';
      if ((lineQuote.match(/>/g) ?? []).length !== quoteDepth) { valid = false; break; }
      remove = lineQuote.length;
      if (listIndent) {
        const indent = line[0].slice(remove, remove + listIndent);
        if (indent.length === listIndent && /^[ \t]*$/.test(indent)) remove += listIndent;
        else if (line[0].slice(remove).trim()) { valid = false; break; }
      }
    }
    const content = line[0].slice(remove);
    if (content) {
      segments.push({ from: match.from + 2 + line.index + remove, to: match.from + 2 + line.index + line[0].length, sourceFrom: source.length });
      source += content;
    }
    first = false;
  }
  if (!valid) return { source: raw, segments: [{ from: match.from + 2, to: match.to - 2, sourceFrom: 0 }], container, standalone: false, projected: false };
  return { source, segments, container, standalone, projected: true };
}

/** Content-only ranges leave Markdown prefixes and line boundaries untouched. */
export function containerReplacementRanges(text: string, match: MathDelimiterMatch, presentation = mathPresentation(text, match)): Array<{ from: number; to: number }> {
  if (presentation.container === 'plain') {
    // Preserve prose, punctuation and line boundaries around a multiline display.
    const ranges: Array<{ from: number; to: number }> = [];
    for (let from = match.from; from < match.to;) {
      const newline = text.indexOf('\n', from);
      const to = newline < 0 ? match.to : Math.min(match.to, newline);
      if (to > from) ranges.push({ from, to });
      from = to + 1;
    }
    return ranges;
  }
  if (!presentation.standalone && !presentation.projected) return [];
  const ranges = [{ from: match.from, to: text.indexOf('\n', match.from) < 0 ? match.to : Math.min(match.to, text.indexOf('\n', match.from)) }];
  for (const segment of presentation.segments) {
    let from = segment.from;
    while (from < segment.to) {
      const newline = text.indexOf('\n', from);
      const to = newline < 0 ? segment.to : Math.min(segment.to, newline);
      if (to > from) ranges.push({ from, to });
      from = to + 1;
    }
  }
  ranges.push({ from: match.to - 2, to: match.to });
  ranges.sort((a, b) => a.from - b.from);
  const merged: Array<{ from: number; to: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
    else if (range.to > range.from) merged.push({ ...range });
  }
  return merged;
}
