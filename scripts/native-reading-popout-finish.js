(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath(),p=window.lsdNativeReadingPopout;
 if(!root.endsWith('/work/TestVault')||!p)throw Error('No disposable native popout probe');
 const results=p.results,check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});
 const expected=p.text.replace('4\\]','5\\]');await new Promise(r=>setTimeout(r,400));
 check('Trusted input edited the intended equation',p.trusted===true&&p.changed===expected);
 check('Popout had owned queued revision at native edit',p.queued===true);
 check('Closing popout releases queued work',p.closed&&app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.size===0);
 check('Editor source remains exact after closing popout',p.cm.state.doc.toString()===expected);
 const start=performance.now();while(fs.readFileSync(root+'/'+p.file,'utf8')!==expected&&performance.now()-start<5000)await new Promise(r=>setTimeout(r,50));
 check('Disk source remains exact after closing popout',fs.readFileSync(root+'/'+p.file,'utf8')===expected,{saveMs:performance.now()-start});
 p.cm.contentDOM.removeEventListener('input',p.capture,true);if(!p.closed)p.popup.detach();
 await p.main.setViewState(p.original);delete window.lsdNativeReadingPopout;
 const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),inputTrusted:p.trusted===true,queuedBeforeClose:p.queued===true,scope:'Trusted native keyboard input into the main editor, immediately closing a desktop Reading View popout while its refresh is queued. Disk persistence uses the host autosave path.',passed:results.every(r=>r.passed),results};
 fs.writeFileSync(root+'/reading-revision-popout-report.json',JSON.stringify(report,null,2));console.log('NATIVE_READING_POPOUT_DONE',report.passed);
})();
