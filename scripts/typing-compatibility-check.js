(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf;
 const before=fs.readFileSync(root+'/Typing.md','utf8'),results=[];
 const check=(name,passed,detail='')=>results.push({name,passed:Boolean(passed),detail});
 const wait=()=>new Promise(r=>setTimeout(r,250));
 const shapes=()=>[...leaf.view.containerEl.querySelectorAll('.cm-editor mjx-container')].map(node=>node.innerHTML);
 try{
  await app.plugins.loadManifests();await app.plugins.enablePlugin('quick-latex');await wait();
  check('Quick Latex 2.6.5 loads with ours',app.plugins.plugins['quick-latex']?.manifest.version==='2.6.5');
  await leaf.setViewState({type:'markdown',state:{file:'Typing.md',mode:'source',source:false}});await wait();
  let view=leaf.view.editor.cm;
  view.dispatch({selection:{anchor:4}});await wait();
  view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true}));await wait();
  check('Quick Latex native auto-fraction remains functional',view.state.doc.toString().includes('\\frac'),view.state.doc.toString());
  view.dispatch({changes:{from:0,to:view.state.doc.length,insert:before}});
  const anchor=before.indexOf('x/y',6)+3;view.dispatch({selection:{anchor}});await wait();
  view.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true}));await wait();
  check('Standard delimiter source not corrupted by typing assistant',view.state.doc.toString()===before);
  check('Standard delimiter editing preview coexists',Boolean(view.dom.querySelector('.lsd-editing-preview mjx-container')));
  await app.plugins.disablePlugin('quick-latex');
  for(const order of [['obsidian-latex','latex-standard-delimiters'],['latex-standard-delimiters','obsidian-latex']]){
   await app.plugins.disablePlugin('latex-standard-delimiters');await app.plugins.disablePlugin('obsidian-latex');
   for(const id of order)await app.plugins.enablePlugin(id);
   await leaf.setViewState({type:'markdown',state:{file:'Compatibility.md',mode:'source',source:false}});await wait();
   leaf.view.editor.cm.dispatch({selection:{anchor:0}});await wait();
   check('MathJax load order '+order.join(' -> '),shapes().length===3&&shapes().slice(0,2).every(html=>html.includes('mjx-c1D444')&&html.includes('mjx-c34')&&html.includes('mjx-c32')));
  }
  check('Typing fixture bytes unchanged',fs.readFileSync(root+'/Typing.md','utf8')===before);
 }finally{if(app.plugins.plugins['quick-latex'])await app.plugins.disablePlugin('quick-latex');}
 fs.writeFileSync(root+'/typing-compatibility-report.json',JSON.stringify({version:'0.3.0',results},null,2));
 console.log('TYPING COMPATIBILITY',results.filter(r=>!r.passed));
})();
