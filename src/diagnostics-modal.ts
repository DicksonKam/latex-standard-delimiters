import { Modal, Notice, Setting, finishRenderMath, renderMath, type App, type Editor, type MarkdownView } from 'obsidian';
import type { EquationDiagnosis } from './diagnostics';

export class EquationDiagnosticModal extends Modal {
  private active = false;
  constructor(
    app: App,
    readonly diagnosis: EquationDiagnosis,
    private readonly editor: Editor,
    private readonly view: MarkdownView,
    private readonly snapshot: string,
    private readonly sourcePath: string | undefined,
    private readonly renderingStatus: string,
    private readonly repairMode: boolean,
    private readonly closed: () => void
  ) { super(app); }

  onOpen(): void {
    this.active = true;
    this.contentEl.addClass('lsd-equation-diagnostic');
    this.setTitle(this.repairMode ? 'Preview equation repair' : 'Diagnose selected equation');
    this.contentEl.createEl('p', {text: this.renderingStatus});
    if (this.view.getState().source === true) this.contentEl.createEl('p', {text: 'This pane is in source mode. Switch to live preview or reading view to render equations in the note.'});
    for (const message of this.diagnosis.messages) this.contentEl.createEl('p', {text: message});
    for (const warning of this.diagnosis.warnings) this.contentEl.createEl('p', {text: warning, cls: 'lsd-diagnostic-warning'});
    this.contentEl.createEl('h3', {text: 'Exact selected source'});
    this.contentEl.createEl('pre', {text: this.diagnosis.original || '(empty selection)'});
    const proposal = this.repairMode ? this.diagnosis.repair : undefined;
    if (proposal) {
      this.contentEl.createEl('p', {text: proposal.description});
      this.contentEl.createEl('h3', {text: 'Proposed source'});
      this.contentEl.createEl('pre', {text: proposal.replacement});
    } else if (this.repairMode) this.contentEl.createEl('p', {text: 'No safe delimiter repair is available. Review the diagnostic messages and correct the source manually.'});
    else if (this.diagnosis.repair) this.contentEl.createEl('p', {text: 'Run “preview equation repair” to inspect the proposed change.'});

    const formulas = proposal?.equations ?? this.diagnosis.equations;
    const status = this.contentEl.createEl('p', {text: formulas.length ? 'Checking MathJax preview…' : 'MathJax received no equation in this diagnostic because no complete block was recognized.'});
    const previews = this.contentEl.createDiv();
    let apply: (() => void) | undefined;
    const controls = new Setting(this.contentEl);
    if (proposal) controls.addButton(button => {
      button.setButtonText('Apply delimiter repair').setCta().setDisabled(true).onClick(() => {
        let attached = false;
        this.app.workspace.iterateAllLeaves(leaf => { if (leaf.view === this.view) attached = true; });
        if (!this.active || !attached || this.view.editor !== this.editor || this.view.file?.path !== this.sourcePath || this.editor.getValue() !== this.snapshot) {
          new Notice('The note changed or closed while the preview was open. Run the command again to make a fresh proposal.');
          button.setDisabled(true); return;
        }
        this.editor.replaceRange(proposal.replacement, this.editor.offsetToPos(this.diagnosis.from), this.editor.offsetToPos(this.diagnosis.to));
        this.close();
        this.editor.focus();
        new Notice('Equation delimiters repaired. Undo restores the original selection.');
      });
      apply = () => { button.setDisabled(false); };
    });
    controls.addButton(button => button.setButtonText('Close').onClick(() => this.close()));
    void (async () => {
      try {
        for (const formula of formulas.slice(0, 10)) {
          const host = previews.createDiv({cls: 'lsd-math lsd-math-block'});
          host.appendChild(renderMath(formula.source, formula.display));
        }
        if (!formulas.length) return;
        await finishRenderMath();
        if (!this.active) return;
        const errors = Array.from(previews.querySelectorAll<HTMLElement>('mjx-merror, [data-mjx-error]'));
        if (errors.length) status.setText('MathJax rejected the preview: ' + errors.map(error => error.getAttribute('data-mjx-error') || error.getAttribute('title') || error.textContent || 'Invalid TeX').join('; '));
        else {
          status.setText('MathJax rendered ' + Math.min(formulas.length, 10) + ' preview(s). This checks the selected TeX only; check how the equation appears in your note after applying a repair.' + (formulas.length > 10 ? ' Select fewer equations to inspect the remaining previews.' : ''));
          apply?.();
        }
      } catch (error) { if (this.active) status.setText('MathJax preview failed: ' + String(error)); }
    })();
  }

  onClose(): void {
    this.active = false;
    this.contentEl.empty();
    this.closed();
  }
}
