(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');if(window.lsdRuntimeChecksRunning)throw Error('Other tests active');window.lsdRuntimeChecksRunning=true;
 const main=app.workspace.activeLeaf,original=main.getViewState(),results=[],wait=ms=>new Promise(r=>setTimeout(r,ms));let popup;
 const check=(name,passed,detail)=>results.push({name,passed:Boolean(passed),detail});let text='Before\n\n\\[321+\n\n4\\].\n\nAfter\n';
 try{
  const existing=app.vault.getAbstractFileByPath('ReadingRevisionPopout.md');
  if(existing)await app.vault.modify(existing,text);else await app.vault.create('ReadingRevisionPopout.md',text);await wait(100);
  await main.setViewState({type:'markdown',state:{file:'ReadingRevisionPopout.md',mode:'source',source:false}});const cm=main.view.editor.cm;cm.dispatch({selection:{anchor:0}});
  check('Initial editor source equals fixture',cm.state.doc.toString()===text,{actual:cm.state.doc.toString()});
  popup=app.workspace.openPopoutLeaf({size:{width:600,height:700}});
  await popup.setViewState({type:'markdown',state:{file:'ReadingRevisionPopout.md',mode:'preview'}});await wait(350);
  check('Popout Reading View uses separate document',popup.view.containerEl.ownerDocument!==document);
  check('Initial popout split display renders',popup.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-math').length===1);
  const view=popup.view,at=text.indexOf('4\\]');text=text.slice(0,at)+'5'+text.slice(at+1);
  cm.dispatch({changes:{from:at,to:at+1,insert:'5'},selection:{anchor:0},userEvent:'input.type'});
  check('Popout has owned queued revision',app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.has(view));
  popup.detach();popup=null;await wait(400);
  check('Closing popout releases queued work',app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.size===0);
  check('Editor source remains exact after closing popout',cm.state.doc.toString()===text);
  const saveStart=performance.now();while(fs.readFileSync(root+'/ReadingRevisionPopout.md','utf8')!==text&&performance.now()-saveStart<5000)await wait(50);
  check('Disk source remains exact after closing popout',fs.readFileSync(root+'/ReadingRevisionPopout.md','utf8')===text,{saveMs:performance.now()-saveStart,actual:fs.readFileSync(root+'/ReadingRevisionPopout.md','utf8')});
 }catch(error){check('Harness completed',false,String(error.stack??error));}
 finally{
  if(popup)popup.detach();await main.setViewState(original);app.workspace.setActiveLeaf(main,{focus:false});window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Actual desktop popout closed while a cross-section Reading View refresh is queued.',passed:results.every(r=>r.passed),results};
  fs.writeFileSync(root+'/reading-revision-popout-report.json',JSON.stringify(report,null,2));console.log('READING_REVISION_POPOUT_DONE',report.passed);
 }
})();
