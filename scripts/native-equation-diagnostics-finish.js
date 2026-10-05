(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault required');
 const probe=window.lsdNativeEquationDiagnostics;if(!probe)throw Error('Run setup first');
 const results=[],check=(name,passed)=>results.push({name,passed:Boolean(passed)});
 try{
  check('Trusted native Apply edits only delimiter bytes',probe.records.some(r=>r.kind==='apply'&&r.trusted&&r.source===probe.expected));
  check('Trusted native Cmd-Z restores original source',probe.records.some(r=>r.kind==='undo'&&r.trusted&&r.source===probe.text));
  check('Final editor source is exact',probe.editor.getValue()===probe.text);
  check('Apply closes the diagnostic dialog',!document.querySelector('.lsd-equation-diagnostic'));
 }finally{
  probe.cleanup();await probe.leaf.setViewState(probe.original);
  const start=performance.now();while(await app.vault.adapter.read(probe.path)!==probe.text&&performance.now()-start<2500)await new Promise(r=>setTimeout(r,50));
  check('Saved source matches original after native undo',await app.vault.adapter.read(probe.path)===probe.text);
  window.lsdRuntimeChecksRunning=false;delete window.lsdNativeEquationDiagnostics;
  const report={version:app.plugins.plugins['latex-standard-delimiters']?.manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),stylesSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/styles.css')).digest('hex'),hostVersion:window.lsdTestHostVersion,scope:'Native command-palette repair, trusted Apply click and Cmd-Z, editor and saved bytes in disposable TestVault. Does not certify every platform or input method.',results,records:probe.records,passed:results.every(r=>r.passed)};
  fs.writeFileSync(root+'/native-equation-diagnostics-report.json',JSON.stringify(report,null,2));console.log('NATIVE_EQUATION_DIAGNOSTICS_DONE',report.passed);
 }
})();
