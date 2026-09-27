(async()=>{
 const root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning||window.lsdNativeCrossProbe)throw Error('Other tests active');
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),text='Before\n\n\\[321+\n\n4\\].\n\nAfter\n';
 await app.vault.adapter.write('NativeCrossSection.md',text);await new Promise(r=>setTimeout(r,50));
 await leaf.setViewState({type:'markdown',state:{file:'NativeCrossSection.md',mode:'source',source:false}});
 const cm=leaf.view.editor.cm,pane=app.workspace.getLeaf('split','vertical');
 await pane.setViewState({type:'markdown',state:{file:'NativeCrossSection.md',mode:'preview'}});
 const records=[];const digits=()=>[...pane.view.previewMode.containerEl.querySelectorAll('.lsd-math mjx-mn mjx-c')].map(c=>{const m=c.className.match(/mjx-c([0-9A-F]+)/i);return m?String.fromCodePoint(parseInt(m[1],16)):'';}).join('');
 const capture=e=>{const kind=e.type,key=e.key,shift=e.shiftKey,trusted=e.isTrusted;setTimeout(()=>records.push({kind,key,shift,trusted,source:cm.state.doc.toString(),digits:digits()}),350);};
 cm.contentDOM.addEventListener('keydown',capture,true);cm.contentDOM.addEventListener('input',capture,true);
 window.lsdNativeCrossProbe={leaf,original,text,pane,cm,records,capture,digits};
 app.workspace.setActiveLeaf(leaf,{focus:true});const at=text.indexOf('4\\]');cm.dispatch({selection:{anchor:at,head:at+1},scrollIntoView:true});cm.focus();
 console.log('NATIVE_CROSS_READY: type 9, Cmd-Z, Cmd-Shift-Z');
})();
