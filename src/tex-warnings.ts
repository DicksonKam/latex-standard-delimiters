import { mathTokens } from './highlight';

/** Source warnings, not a TeX compiler or an automatic rewrite. */
export function texSourceWarnings(source: string): string[] {
  const warnings = new Set<string>();
  for (const token of mathTokens(source)) {
    if (token.kind !== 'command' || source.slice(token.from, token.to) !== '\\begin') continue;
    const argument = /^\s*\{(aligned|gathered)\}\s*\[/.exec(source.slice(token.to));
    if (!argument || /^\s*(?:[tbc]\s*)?\]/.test(source.slice(token.to + argument[0].length))) continue;
    warnings.add('Square brackets immediately after \\begin{' + argument[1] + '} are read as an optional alignment argument. MathJax may hide the enclosed expression without reporting an error. If these brackets belong to the equation, group the expression as {[...]} before adding its subscript; for example, {[\\mathbf r]}_{\\mathrm{cyl}}.');
  }
  return [...warnings];
}
