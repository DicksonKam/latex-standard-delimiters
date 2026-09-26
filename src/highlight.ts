/** Pure tokenizer: offsets refer to the original source; no text is rewritten. */
export type MathToken = { from: number; to: number; kind: string };
export function mathTokens(source: string, offset = 0): MathToken[] {
  const tokens: MathToken[] = [];
  const pattern = /\\(?:[a-zA-Z]+|[^\n])|%[^\n]*|[{}()[\]]|(?:\d+(?:\.\d*)?|\.\d+)|[+\-=<>*/^_&|!:;,]/g;
  for (const match of source.matchAll(pattern)) {
    const value = match[0];
    const kind = value.startsWith('\\') ? 'command' : value.startsWith('%') ? 'comment' : /^[{}()[\]]$/.test(value) ? 'brace' : /^(?:\d|\.\d)/.test(value) ? 'number' : 'operator';
    tokens.push({ from: offset + match.index, to: offset + match.index + value.length, kind });
  }
  return tokens;
}

export function matchingBraces(source: string, caret: number): number[] {
  const tokens = mathTokens(source);
  const braces = tokens.filter(token => token.kind === 'brace');
  const commands = new Set(tokens.filter(token => token.kind === 'command').map(token => token.from));
  const candidate = braces.find(token => token.from === caret) ?? braces.find(token => token.to === caret);
  if (!candidate) return [];
  // Scalable delimiters can intentionally differ in shape or have an
  // invisible partner (\left( ... \right.). Do not flag those as errors.
  const scalable = new Map<number, number | undefined>();
  const scalableStack: number[] = [];
  const visible = new Set(braces.map(token => token.from));
  for (const delimiter of source.matchAll(/\\(left|right|middle)\s*(\\[{}|]|[()[\]{}.|])/g)) {
    if (!commands.has(delimiter.index)) continue;
    const position = delimiter.index + delimiter[0].length - delimiter[2].length;
    if (delimiter[1] === 'left') { scalableStack.push(position); scalable.set(position, undefined); }
    else if (delimiter[1] === 'right') {
      const opening = scalableStack.pop();
      scalable.set(position, opening !== undefined && visible.has(opening) ? opening : undefined);
      if (opening !== undefined) scalable.set(opening, visible.has(position) ? position : undefined);
    } else scalable.set(position, undefined);
  }
  if (scalable.has(candidate.from)) {
    const partner = scalable.get(candidate.from);
    return partner === undefined ? [] : [candidate.from, partner];
  }
  const pairs = new Map<number, number>();
  const stack: number[] = [];
  for (const token of braces) {
    if (scalable.has(token.from)) continue;
    const char = source[token.from];
    if ('{(['.includes(char)) stack.push(token.from);
    else {
      const opening = stack.pop();
      if (opening !== undefined && '{(['.indexOf(source[opening]) === '})]'.indexOf(char)) {
        pairs.set(opening, token.from); pairs.set(token.from, opening);
      } else stack.length = 0;
    }
  }
  const partner = pairs.get(candidate.from);
  return partner === undefined ? [candidate.from] : [candidate.from, partner];
}
