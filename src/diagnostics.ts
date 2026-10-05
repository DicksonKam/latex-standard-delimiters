import { findMathInMarkdown, protectedRanges, type MathDelimiterMatch } from './parser';
import { mathPresentation } from './presentation';
import { texSourceWarnings } from './tex-warnings';

export type DiagnosticEquation = { source: string; display: boolean };
export type EquationDiagnosis = {
  from: number; to: number; original: string; messages: string[]; warnings: string[];
  equations: DiagnosticEquation[];
  repair?: { replacement: string; description: string; equations: DiagnosticEquation[] };
};

function equations(text: string, matches: MathDelimiterMatch[]): DiagnosticEquation[] {
  return matches.map(match => ({source: mathPresentation(text, match).source, display: match.display}));
}

/** Inspect original note bytes; a proposal never changes the document. */
export function diagnoseEquation(text: string, from: number, to: number): EquationDiagnosis {
  from = Math.max(0, Math.min(text.length, from));
  to = Math.max(from, Math.min(text.length, to));
  const matches = findMathInMarkdown(text);
  if (from === to) {
    const containing = matches.find(match => match.from <= from && from <= match.to);
    if (containing) { from = containing.from; to = containing.to; }
  }
  const original = text.slice(from, to);
  const result: EquationDiagnosis = {from, to, original, messages: [], warnings: [], equations: []};
  if (!original.trim()) {
    result.messages.push('Select the whole equation block, including its opening and closing delimiters.');
    return result;
  }
  if (original.length > 100_000) {
    result.messages.push('Select one equation block smaller than 100,000 characters.');
    return result;
  }
  const selected = matches.filter(match => match.from >= from && match.to <= to);
  result.equations = equations(text, selected);
  result.warnings.push(...new Set(result.equations.flatMap(equation => texSourceWarnings(equation.source))));
  if (selected.length) {
    result.messages.push('Recognized ' + selected.length + ' complete standard-delimiter equation(s) in the note source.');
    result.messages.push('The diagnostic preview below tests this exact TeX with the shared MathJax engine.');
  } else if (matches.some(match => match.from < to && match.to > from)) {
    result.messages.push('The selection cuts through a recognized equation. Select the entire block to inspect it.');
    return result;
  } else result.messages.push('No complete standard-delimiter equation is recognized in this selection.');
  if (/(?:^|[^\\])\\[ \t]*\r?$/m.test(original) && /\\begin\{(?:p|b|B|v|V)?matrix\}|\\begin\{align(?:ed)?\}/.test(original)) {
    result.warnings.push('A single backslash ends a line in a matrix/alignment. TeX row breaks normally require two backslashes. Review it manually; no row breaks will be guessed.');
  }
  if (selected.length) return result;
  if (protectedRanges(text).some(range => from >= range.from && from < range.to)) {
    result.messages.push('The selection starts inside code, frontmatter, an HTML code element, or a comment. Those regions intentionally stay literal.');
    return result;
  }
  if (/^\s*\$/.test(original)) {
    result.messages.push('Dollar-delimited math is handled by Obsidian. This command repairs only standard bracket delimiters.');
    return result;
  }
  const lines = original.split('\n');
  const openingIndex = lines.findIndex(line => line.trim().length > 0);
  let closingIndex = lines.length - 1;
  while (closingIndex > openingIndex && !lines[closingIndex].trim()) closingIndex--;
  const first = lines[openingIndex], last = lines[closingIndex];
  const startsOnLine = !text.slice(text.lastIndexOf('\n', from - 1) + 1, from).trim();
  const nextNewline = text.indexOf('\n', to);
  const endsOnLine = text[to - 1] === '\n' || !text.slice(to, nextNewline < 0 ? text.length : nextNewline).trim();
  // Only a complete standalone plain/blockquote block is eligible.
  const opening = /^((?: {0,3}>[ \t]?)*[ \t]*)(\\?\[)([ \t]*\r?)$/.exec(first);
  const closing = /^((?: {0,3}>[ \t]?)*[ \t]*)(\\?\])([ \t]*\r?)$/.exec(last);
  const interior = lines.slice(openingIndex + 1, closingIndex);
  if (closingIndex - openingIndex >= 2 && startsOnLine && endsOnLine && opening && closing &&
      !interior.some(line => /^(?: {0,3}>[ \t]?)*[ \t]*\\?(?:\[|\])[ \t]*\r?$/.test(line)) &&
      (opening[2] === '[' || closing[2] === ']') &&
      /\\(?:begin|boxed|frac|dfrac|sqrt|mathbf|underbrace)\b/.test(interior.join('\n'))) {
    lines[openingIndex] = opening[1] + '\\[' + opening[3];
    lines[closingIndex] = closing[1] + '\\]' + closing[3];
    const replacement = lines.join('\n');
    const proposedDocument = text.slice(0, from) + replacement + text.slice(to);
    const proposed = findMathInMarkdown(proposedDocument).filter(match => match.from >= from && match.to <= from + replacement.length);
    // Validate in the whole note, so native math/code exclusions still apply.
    if (proposed.length === 1) {
      const projection = mathPresentation(proposedDocument, proposed[0]);
      if (projection.container === 'plain' || projection.projected) {
        result.repair = {replacement, description: 'Restore missing backslashes on the outer display delimiters. Interior TeX stays exactly as selected.', equations: equations(proposedDocument, proposed)};
        result.warnings.push(...new Set(result.repair.equations.flatMap(equation => texSourceWarnings(equation.source))));
        result.messages.push('The outer bracket delimiters are missing one or both backslashes. A repair proposal is available.');
        return result;
      }
    }
  }
  result.messages.push('Check for missing or doubled delimiter backslashes, a missing closing delimiter, TeX comments, surrounding native dollar math, or an unclosed code fence. Select the entire block to preview a repair.');
  return result;
}
