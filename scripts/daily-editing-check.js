// Stateful daily-use tests with rendered number identity, not merely node counts.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');if(window.lsdRuntimeChecksRunning)throw Error('Other tests active');window.lsdRuntimeChecksRunning=true;
 const leaf=app.workspace.activeLeaf,original=leaf.getViewState(),results=[],errors=[],diagnostics=[];let second;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(name,p,detail)=>results.push({name,passed:Boolean(p),detail});const capture=e=>errors.push(String(e.message??e.reason));window.addEventListener('error',capture);window.addEventListener('unhandledrejection',capture);
 const digits=node=>[...node.querySelectorAll('mjx-mn mjx-c')].map(c=>{const m=c.className.match(/mjx-c([0-9A-F]+)/i);return m?String.fromCodePoint(parseInt(m[1],16)):'';}).join('');
 const identities=dom=>[...dom.querySelectorAll('.lsd-math:not(.lsd-editing-preview) mjx-container')].map(digits);
 const checkIdentity=(name,dom,expected)=>{const actual=identities(dom);check(name,JSON.stringify(actual)===JSON.stringify(expected),{actual,expected});check(name+' no leaked quote glyph',!dom.querySelector('.lsd-math .mjx-c3E'));if(JSON.stringify(actual)!==JSON.stringify(expected))diagnostics.push({name,html:dom.innerHTML.slice(0,40000)});};
 const body=String.raw`Daily editing

Above
\[101+7\]
Below

Inline \(202+8\).

> [!note] Title \(303+9\)
> \[404+6\]
>
> > [!tip] Nested
> > \(505+5\)

| Header |
| --- |
| Plain (606+4), math \(606+4\) |

- \(707+3\)

After
`;
 const expected=['1017','2028','3039','4046','5055','6064','7073'];
 const paths=['Examples.md','EulerCallouts.md','Containers.md'];const before=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(root+'/'+p,'utf8')]));
 const mount=async(text)=>{await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});await app.vault.adapter.write('DailyEditing.md',text);await wait(30);await leaf.setViewState({type:'markdown',state:{file:'DailyEditing.md',mode:'source',source:false}});leaf.view.editor.cm.dispatch({selection:{anchor:0}});await wait(200);return leaf.view.editor.cm;};
 try{
  let cm=await mount(body);checkIdentity('Initial identities in Live Preview',cm.dom,expected);
  await leaf.setViewState({type:'markdown',state:{file:'DailyEditing.md',mode:'preview'}});await wait(200);checkIdentity('Initial identities in Reading View',leaf.view.previewMode.containerEl,expected);
  await leaf.setViewState({type:'markdown',state:{file:'DailyEditing.md',mode:'source',source:false}});cm=leaf.view.editor.cm;cm.focus();
  for(const number of ['101','202','404','505','707']){
   const pos=body.indexOf(number);cm.dispatch({selection:{anchor:pos+1}});await wait(120);
   check(number+' active preview identity',digits(cm.dom.querySelector('.lsd-editing-preview')??document.createElement('div')).startsWith(number));
   cm.dispatch({changes:{from:pos,to:pos+3,insert:'919'},selection:{anchor:pos+1},userEvent:'input.type'});await wait(120);
   check(number+' edit updates preview identity',digits(cm.dom.querySelector('.lsd-editing-preview')??document.createElement('div')).startsWith('919'));
   cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',metaKey:true,bubbles:true,cancelable:true}));await wait(120);check(number+' undo source',cm.state.doc.toString()===body);
   cm.dispatch({selection:{anchor:0}});await wait(120);checkIdentity(number+' undo restores all identities',cm.dom,expected);
  }
  const start=body.indexOf('\\(202'),end=body.indexOf('\\)',start);
  for(const [name,from,to] of [['opener',start,start+2],['closer',end,end+2]]){
   cm.dispatch({changes:{from,to,insert:''},selection:{anchor:start+3},userEvent:'input.type'});await wait(100);
   check(name+' removal hides incomplete preview',!cm.dom.querySelector('.lsd-editing-preview'));
   cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',metaKey:true,bubbles:true,cancelable:true}));await wait(100);
   check(name+' undo recovers exact source',cm.state.doc.toString()===body);cm.dispatch({selection:{anchor:0}});await wait(100);checkIdentity(name+' undo recovers identities',cm.dom,expected);
  }
  const transforms=[
   ['plain',String.raw`\[818+2\]`],['prose-display',String.raw`Given \[818+
2\] then continue.`],['suffix-display',String.raw`\[818+
2\].`],['indented-display',String.raw`  \[818+
2\]  `],['inline',String.raw`Text \(818+2\).`],['callout',String.raw`> [!note] Moved
> \[818+2\]`],['nested',String.raw`> [!note] Outer
> > [!tip] Inner
> > \[818+2\]`],['quote-prose',String.raw`> [!note] Given
> Text \[818+
> 2\] then continue.`],['quote-punctuation',String.raw`> [!note] Given
> \[818+
> 2\].`],['list',String.raw`- \[818+2\]`],['table',String.raw`| Header |
| --- |
| \(818+2\) |`],['folded',String.raw`> [!note]- Folded
> \(818+2\)`]
  ];
  for(let round=0;round<3;round++)for(const [name,text] of transforms){
   cm.dispatch({changes:{from:0,to:cm.state.doc.length,insert:'Before\n\n'+text+'\n\nAfter\n'},selection:{anchor:0}});await wait(150);
   checkIdentity(round+'/'+name+' move retains identity',cm.dom,['8182']);
   check(round+'/'+name+' source remains original Markdown',cm.state.doc.toString()==='Before\n\n'+text+'\n\nAfter\n');
   if(name.startsWith('quote-')){
    const pos=cm.state.doc.toString().indexOf('818');cm.dispatch({selection:{anchor:pos+1}});await wait(100);
    check(round+'/'+name+' active preview identity',digits(cm.dom.querySelector('.lsd-editing-preview')??document.createElement('div'))==='8182');
    check(round+'/'+name+' active preview has no quote glyph',!cm.dom.querySelector('.lsd-editing-preview .mjx-c3E'));
    cm.dispatch({selection:{anchor:0}});await wait(100);
   }
   if(name==='folded')for(let toggle=0;toggle<4;toggle++){
    const callout=cm.dom.querySelector('.callout'),collapsed=callout?.classList.contains('is-collapsed');
    cm.dom.querySelector('.callout-fold')?.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0,cancelable:true}));await wait(100);
    check(round+'/fold '+toggle+' toggles',cm.dom.querySelector('.callout')?.classList.contains('is-collapsed')===!collapsed);checkIdentity(round+'/fold '+toggle+' identity',cm.dom,['8182']);
   }
  }
  cm=await mount('Above\n\\[919+1\\]\nBelow\n');const navText=cm.state.doc.toString(),a=navText.indexOf('\\['),b=navText.indexOf('\\]')+2;
  for(let round=0;round<12;round++)for(const [key,anchor]of [['ArrowDown',a-1],['ArrowUp',b+1]]){
   cm.dispatch({selection:{anchor}});await wait(40);cm.contentDOM.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));await wait(40);
   check(round+'/'+key+' enters source',cm.state.selection.main.head>a&&cm.state.selection.main.head<b);
   check(round+'/'+key+' exact source',cm.state.doc.toString()===navText);
  }
  // Same note in editor and Reading View: assert actual rendered number updates.
  cm=await mount('Before\n\n'+String.raw`\(123+4\)`+'\n\nAfter\n');second=app.workspace.getLeaf('split','vertical');await second.setViewState({type:'markdown',state:{file:'DailyEditing.md',mode:'preview'}});await wait(200);
  for(let edit=0;edit<6;edit++){
   const old=String(123+edit),next=String(124+edit),pos=cm.state.doc.toString().indexOf(old);cm.dispatch({changes:{from:pos,to:pos+3,insert:next},selection:{anchor:0},userEvent:'input.type'});
   for(let i=0;i<40;i++){await wait(75);if(identities(second.view.previewMode.containerEl)[0]===next+'4')break;}
   checkIdentity('Same note editor update '+edit,cm.dom,[next+'4']);checkIdentity('Same note reading update '+edit,second.view.previewMode.containerEl,[next+'4']);
  }
  for(const [p,text]of Object.entries(before))check(p+' unchanged',fs.readFileSync(root+'/'+p,'utf8')===text);check('No uncaught daily editing errors',errors.length===0,errors);
 }catch(e){check('Harness completes',false,String(e));}
 finally{
  if(second)second.detach();await leaf.setViewState(original);app.workspace.setActiveLeaf(leaf,{focus:false});window.removeEventListener('error',capture);window.removeEventListener('unhandledrejection',capture);window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'Numeric glyph identities across original/edited math, undo, delimiter removal, structure moves, folding, repeated vertical entry, and same-note editor/Reading View updates. Scripted editor/key/pointer events, not OS keyboard certification.',results,errors,diagnostics};fs.writeFileSync(root+'/daily-editing-report.json',JSON.stringify(report,null,2));console.log('DAILY_EDITING',results.filter(x=>!x.passed));
 }
})();
