(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');const p=window.lsdNativeDaily;if(!p)throw Error('Set up native keyboard test first');
 const results=[],check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail}),keys=p.records.filter(r=>r.type==='keydown');
 check('Native Down enters equation source',keys.some(r=>r.key==='ArrowDown'&&r.head===p.text.indexOf('246')));
 check('Native Right advances within equation',keys.some(r=>r.key==='ArrowRight'&&r.head===p.text.indexOf('246')+1));
 check('Native typing inserts at intended math position',p.records.some(r=>r.source===p.text.replace('246','2946')));
 check('Native undo restores original source',keys.some(r=>r.key.toLowerCase()==='z'&&r.source===p.text));
 check('Native redo restores inserted digit',keys.some(r=>r.key.toLowerCase()==='z'&&r.source===p.text.replace('246','2946')));
 check('Native Backspace restores original source',keys.some(r=>r.key==='Backspace'&&r.source===p.text));
 check('Native paste retains exact LaTeX',p.records.some(r=>r.type==='paste'&&r.source===p.text.replace('246',String.raw`2\alpha_246`)));
 check('Native input events are trusted',p.records.some(r=>r.type==='input'&&r.trusted)&&keys.length>=5&&keys.every(r=>r.trusted));
 check('Final source restored after native undo',p.cm.state.doc.toString()===p.text);
 const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Actual native UI Down/Right, typing, undo/redo, Backspace, LaTeX paste and undo in disposable NativeDaily.md; trusted input/keydown capture. Does not certify every OS keyboard, IME or callout interaction.',results,records:p.records};
 p.cleanup();if(p.cm.state.doc.toString()!==p.text)p.cm.dispatch({changes:{from:0,to:p.cm.state.doc.length,insert:p.text}});await p.leaf.setViewState(p.original);delete window.lsdNativeDaily;
 fs.writeFileSync(root+'/native-daily-keyboard-report.json',JSON.stringify(report,null,2));console.log('NATIVE_DAILY',results.filter(r=>!r.passed));
})();
