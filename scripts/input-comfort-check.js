(async()=>{
 if(app.vault.getName()!=='TestVault') throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,results=[];
 const check=(name,passed)=>results.push({name,passed});
 await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
 const view=leaf.view.editor.cm,before=view.state.doc.toString();
 const wait=()=>new Promise(r=>setTimeout(r,120));
 const reset=async()=>{view.dispatch({selection:{anchor:0}});await wait();return view.dom.querySelector('.lsd-math-inline');};
 const send=(el,type,x=20,y=20)=>el.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:42,pointerType:'touch',isPrimary:true,clientX:x,clientY:y}));
 try {
  let el=await reset();send(el,'pointerdown');send(el,'pointerup');await wait();
  check('Synthetic touch tap reveals source',view.state.selection.main.head===before.indexOf('\\(')+2);
  el=await reset();send(el,'pointerdown');send(el,'pointerup',45,20);await wait();
  check('Synthetic swipe does not reveal source',view.state.selection.main.head===0);
  el=await reset();send(el,'pointerdown');send(el,'pointermove',45,20);send(el,'pointerup');await wait();
  check('Swipe returning to start does not reveal source',view.state.selection.main.head===0);
  el=await reset();send(el,'pointerdown');send(el,'pointercancel');send(el,'pointerup');await wait();
  check('Cancelled touch does not reveal source',view.state.selection.main.head===0);
  el=await reset();send(el,'pointerdown');await new Promise(r=>setTimeout(r,550));send(el,'pointerup');await wait();
  check('Long press does not force source entry',view.state.selection.main.head===0);
  // Exercises our guards only, not a real operating-system input method.
  const own=Object.getOwnPropertyDescriptor(view,'composing');
  Object.defineProperty(view,'composing',{configurable:true,value:true});
  try {el=await reset();el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));await wait();check('Composition guard ignores equation mouse entry',view.state.selection.main.head===0);} finally {if(own)Object.defineProperty(view,'composing',own);else delete view.composing;}
  check('All input checks preserve source',view.state.doc.toString()===before);
 } finally {view.dispatch({selection:{anchor:0}});}
 const report={timestamp:new Date().toISOString(),mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Synthetic pointer events and composing guard on desktop; not real mobile or IME verification',results};
 fs.writeFileSync(root+'/input-comfort-report.json',JSON.stringify(report,null,2));console.log('INPUT COMFORT',results.filter(x=>!x.passed));
})();
