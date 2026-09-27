// Prepare OS-keyboard checks. Drive keys through native UI after this resolves.
(async()=>{
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');if(window.lsdRuntimeChecksRunning)throw Error('Other tests running');
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),text=String.raw`Above
\[246+1\]
Below
`;
 await app.vault.adapter.write('NativeDaily.md',text);await new Promise(r=>setTimeout(r,50));await leaf.setViewState({type:'markdown',state:{file:'NativeDaily.md',mode:'source',source:false}});
 const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:5}});
 const probe={original,leaf,cm,text,records:[],timers:new Set()};
 const record=e=>{
  const type=e.type,key=e.key??e.inputType??'',trusted=e.isTrusted;
  const timer=setTimeout(()=>{probe.timers.delete(timer);probe.records.push({type,key,trusted,source:cm.state.doc.toString(),head:cm.state.selection.main.head,anchor:cm.state.selection.main.anchor,previews:cm.dom.querySelectorAll('.lsd-editing-preview').length});},80);probe.timers.add(timer);
 };
 for(const type of ['keydown','input','paste'])cm.contentDOM.addEventListener(type,record,true);
 probe.cleanup=()=>{for(const type of ['keydown','input','paste'])cm.contentDOM.removeEventListener(type,record,true);for(const timer of probe.timers)clearTimeout(timer);};window.lsdNativeDaily=probe;
 setTimeout(()=>cm.focus(),500);console.log('NATIVE_DAILY_READY');
})();
