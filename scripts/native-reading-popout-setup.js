// Prepare trusted keyboard editing followed by immediate popout closure.
(async()=>{
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault')||window.lsdRuntimeChecksRunning||window.lsdNativeReadingPopout)throw Error('Idle disposable TestVault required');
 const main=app.workspace.activeLeaf,original=main.getViewState(),text='Before\n\n\\[321+\n\n4\\].\n\nAfter\n';
 const file='NativeReadingPopout-'+Date.now()+'.md';await app.vault.create(file,text);
 await main.setViewState({type:'markdown',state:{file,mode:'source',source:false}});
 const cm=main.view.editor.cm,popup=app.workspace.openPopoutLeaf({size:{width:600,height:700}});
 await popup.setViewState({type:'markdown',state:{file,mode:'preview'}});
 await new Promise(r=>setTimeout(r,350));
 const results=[],check=(name,passed)=>results.push({name,passed:Boolean(passed)});
 check('Initial editor source equals fixture',cm.state.doc.toString()===text);
 check('Popout Reading View uses separate document',popup.view.containerEl.ownerDocument!==document);
 check('Initial popout split display renders',popup.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-math').length===1);
 const p={main,original,text,file,cm,popup,results,closed:false};
 const capture=e=>{
  if(!e.isTrusted||p.closed)return;
  setTimeout(()=>{
   if(p.closed)return;
   p.trusted=e.isTrusted;p.changed=cm.state.doc.toString();
   p.queued=app.plugins.plugins['latex-standard-delimiters'].pendingReadingRefresh.has(popup.view);
   popup.detach();p.closed=true;
  },0);
 };
 cm.contentDOM.addEventListener('input',capture,true);p.capture=capture;window.lsdNativeReadingPopout=p;
 app.workspace.setActiveLeaf(main,{focus:true});const at=text.indexOf('4\\]');
 cm.dispatch({selection:{anchor:at,head:at+1},scrollIntoView:true});cm.focus();
 console.log('NATIVE_READING_POPOUT_READY: type 5');
})();
