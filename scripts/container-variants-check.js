(async()=>{
if(app.vault.getName()!=='TestVault')throw Error('Disposable TestVault only');
const fs=require('node:fs'),path=require('node:path'),root=app.vault.adapter.getBasePath(),file='ContainerVariants.md',before=fs.readFileSync(path.join(root,file),'utf8'),leaf=app.workspace.activeLeaf;
const results=[],check=(name,passed,detail='')=>results.push({name,passed:Boolean(passed),detail});
const wait=()=>new Promise(r=>setTimeout(r,250));
await leaf.setViewState({type:'markdown',state:{file,mode:'source',source:false}});await wait();const cm=leaf.view.editor.cm;cm.dispatch({selection:{anchor:0}});await wait();
check('Ordered continuation, nested quote and quoted list render',cm.dom.querySelectorAll('.lsd-math mjx-container').length===3,String(cm.dom.querySelectorAll('.lsd-math mjx-container').length));
let next=0;
for(const kind of ['ordered continuation','nested quote','quoted list']){
 const start=before.indexOf('\\[',next);next=before.indexOf('\\]',start)+2;
 cm.dispatch({selection:{anchor:start+2}});await wait();
 check(kind+' active preview is valid',!!cm.dom.querySelector('.lsd-editing-preview mjx-container')&&!cm.dom.querySelector('.lsd-editing-preview mjx-merror'));
 check(kind+' original source remains exact',cm.state.doc.toString()===before);
 cm.dispatch({selection:{anchor:next+1}});await wait();cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));await wait();
 check(kind+' ArrowUp reveals source',cm.state.selection.main.head>start&&cm.state.selection.main.head<next,JSON.stringify({head:cm.state.selection.main.head,start,end:next}));
}
check('Variant fixture bytes stay unchanged',fs.readFileSync(path.join(root,file),'utf8')===before);
const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'.obsidian/plugins/latex-standard-delimiters/main.js'))).digest('hex'),results};fs.writeFileSync(path.join(root,'container-variants-report.json'),JSON.stringify(report,null,2));console.log('CONTAINER_VARIANTS',results.filter(x=>!x.passed));
})();
