(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath(),p=window.lsdNativeCrossProbe;
 if(!root.endsWith('/work/TestVault')||!p)throw Error('No disposable native probe');
 const results=[],check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});
 try{
  const changed=p.text.replace('4\\]','9\\]');await new Promise(r=>setTimeout(r,500));
  check('Trusted typing refreshes split display',p.records.some(r=>r.kind==='input'&&r.trusted&&r.source===changed&&r.digits==='3219'));
  check('Trusted native undo refreshes split display',p.records.some(r=>r.kind==='keydown'&&r.trusted&&r.key.toLowerCase()==='z'&&!r.shift&&r.source===p.text&&r.digits==='3214'));
  check('Trusted native redo refreshes split display',p.records.some(r=>r.kind==='keydown'&&r.trusted&&r.key.toLowerCase()==='z'&&r.shift&&r.source===changed&&r.digits==='3219'));
  check('Native result source is exact',p.cm.state.doc.toString()===changed);
  const saveStart=performance.now();while(fs.readFileSync(root+'/NativeCrossSection.md','utf8')!==changed&&performance.now()-saveStart<5000)await new Promise(r=>setTimeout(r,50));
  check('Native result disk source is exact',fs.readFileSync(root+'/NativeCrossSection.md','utf8')===changed);
  check('Native final equation is current',p.digits()==='3219');
 }finally{
  p.cm.contentDOM.removeEventListener('keydown',p.capture,true);p.cm.contentDOM.removeEventListener('input',p.capture,true);
  p.pane.detach();await p.leaf.setViewState(p.original);delete window.lsdNativeCrossProbe;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Trusted native typing, undo and redo in an editor with the same note open in Reading View. Closing-section edits without reopening.',passed:results.every(r=>r.passed),results,records:p.records};
  fs.writeFileSync(root+'/native-cross-section-report.json',JSON.stringify(report,null,2));console.log('NATIVE_CROSS_FINISHED',report.passed);
 }
})();
