(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('TestVault only');
 const fs=require('node:fs'),root=app.vault.adapter.getBasePath(),leaf=app.workspace.activeLeaf,results=[],observations=[];
 const check=(name,passed)=>results.push({name,passed}),wait=()=>new Promise(r=>setTimeout(r,250)),bodyClasses=document.body.className;
 const theme=document.createElement('style');theme.dataset.lsdTestTheme='Minimal';theme.textContent=fs.readFileSync(root+'/.obsidian/themes/Minimal/theme.css','utf8');document.head.appendChild(theme);
 let view,oldWidth;
 try{
  await leaf.setViewState({type:'markdown',state:{file:'Comfort.md',mode:'source',source:false}});await wait();view=leaf.view.editor.cm;const before=view.state.doc.toString();oldWidth=view.dom.style.width;
  view.dom.style.width='360px';view.dispatch({selection:{anchor:before.indexOf('\\[')+2}});await wait();
  for(const mode of ['theme-light','theme-dark']){
   document.body.classList.remove('theme-light','theme-dark');document.body.classList.add(mode);await wait();
   const preview=view.dom.querySelector('.lsd-editing-preview'),token=view.dom.querySelector('.lsd-token-number');
   check(mode+': Minimal source tokens visible',!!token&&getComputedStyle(token).display!=='none'&&getComputedStyle(token).color!=='rgba(0, 0, 0, 0)');
   check(mode+': narrow preview remains contained',preview.getBoundingClientRect().width<=361);
   check(mode+': long math scrolls in narrow preview',preview.scrollWidth>preview.clientWidth&&getComputedStyle(preview).overflowX==='auto');
   observations.push({mode,theme:'Minimal stylesheet',tokenColor:getComputedStyle(token).color,background:getComputedStyle(view.dom).backgroundColor,previewWidth:preview.clientWidth,mathWidth:preview.scrollWidth});
  }
  check('Narrow layout and theme changes preserve source',view.state.doc.toString()===before);
 }finally{theme.remove();document.body.className=bodyClasses;if(view)view.dom.style.width=oldWidth;await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});}
 const report={timestamp:new Date().toISOString(),scope:'Actual Minimal stylesheet in desktop document at 360px editor width; no real mobile or touch keyboard certification',observations,mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),results};fs.writeFileSync(root+'/theme-narrow-report.json',JSON.stringify(report,null,2));console.log('THEME NARROW',results.filter(x=>!x.passed));
})();
