// Adversarial actual-app matrix. Writes only Stress.md in the disposable work/TestVault.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning)throw Error('Other test run active');
 window.lsdRuntimeChecksRunning=true;
 const results=[],samples=[],failures=[],errors=[],leaf=app.workspace.activeLeaf,original=leaf.getViewState();
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const check=(name,passed,detail)=>{results.push({name,passed:Boolean(passed),detail});};
 const capture=e=>errors.push(String(e.message??e.reason));window.addEventListener('error',capture);window.addEventListener('unhandledrejection',capture);
 const cases=[
 ['same-inline',String.raw`\(x_1\) \(x_1\) \(x_1\)`,3],
 ['literal-twin',String.raw`Plain (x_1), math \(x_1\), plain (x_1).`,1,'Plain (x_1), math'],
 ['emphasis',String.raw`**Bold \(a_b+c_d\)** and *italic \(q_r\)*.`,2],
 ['underbrace',String.raw`\[\underbrace{a}_{\text{even}}+\underbrace{b}_{\text{odd}}\]`,1],
 ['title-twin',String.raw`> [!note] literal (z), math \(z\)`,1,'literal (z), math'],
 ['title-repeated',String.raw`> [!note] \(z\) plus \(z\)`,2],
 ['title-body-same',String.raw`> [!note] \(z\)
> \(z\)`,2],
 ['callout-twins',String.raw`> [!note] Title
> Plain (x_1), math \(x_1\), plain (x_1).`,1,'Plain (x_1), math'],
 ['callout-repeated',String.raw`> [!note] Title
> \(a_b\) \(a_b\) \(a_b\)`,3],
 ['callout-two-paragraphs',String.raw`> [!note] Title
> \(a\)
>
> \(b\)`,2],
 ['callout-two-displays',String.raw`> [!note] Title
> \[a_b+c_d\]
>
> \[a_b+c_d\]`,2],
 ['callout-nested',String.raw`> [!note] Outer
> \(a\)
>
> > [!tip] Inner
> > \(b\)`,2],
 ['callout-nested-display',String.raw`> [!note] Outer
> > [!tip] Inner
> > \[\begin{aligned}
> > a_b &= c_d \\
> > e_f &= g_h
> > \end{aligned}\]`,1],
 ['callout-quoted',String.raw`> > [!note] Nested
> > \(a_b\)`,1],
 ['callout-list',String.raw`> [!note] List
> - \(a_b\)
> - \(c_d\)`,2],
 ['callout-code',String.raw`> [!note] Code
> \(a\)
> `+'`'+String.raw`\(notmath\)`+'`',1],
 ['callout-fence',String.raw`> [!note] Fence
> \(a\)
> `+'```tex\n'+String.raw`> \(notmath\)`+'\n> ```',1],
 ['table-twin',String.raw`| Header |
| --- |
| Plain (x_1), math \(x_1\) |`,1,'Plain (x_1), math'],
 ['table-repeated',String.raw`| \(a\) | \(a\) |
| --- | --- |
| \(a\) | \(a\) |`,4],
 ['table-inline-pipe',String.raw`| Header |
| --- |
| \(a\mid b\) and \(a\lvert b\rvert\) |`,2],
 ['table-escaped-pipe',String.raw`| Header |
| --- |
| \(a\|b\) |`,1],
 ['callout-table',String.raw`> [!note] Table
> | A | B |
> | --- | --- |
> | \(a_b\) | \(c_d\) |`,2],
 ['native-coexistence',String.raw`$x_1$ and \(x_1\).

$$a_b$$

\[a_b\]`,2],
 ['comments',String.raw`\[a % \] ignored
+b\]`,1],
 ['link-label',String.raw`[Equation \(x_1\)](https://example.invalid/)`,1],
 ['html-literal',String.raw`<code>\(notmath\)</code> \(x\)`,1],
 ['frontmatter','---\nexample: "\\(notmath\\)"\n---\n\n'+String.raw`\(x\)`,1],
 ['escaped-opener',String.raw`\\(literal\\) and \(x\)`,1],
 ['incomplete-recovery',String.raw`Incomplete \(oops then \(x\)`,1],
 ['heading',String.raw`## Formula \(a_b\) plus \(a_b\)`,2],
 ['bold-title',String.raw`> [!tip] **\(a_b\)** and *\(c_d\)*`,2],
 ['collapsed-callout',String.raw`> [!note]- Folded
> \(a_b\)`,1],
 ['expanded-callout',String.raw`> [!note]+ Expanded
> \(a_b\)`,1],
 ['nested-title-twin',String.raw`> [!note] Outer
> > [!tip] literal (z), math \(z\)
> > \(a_b\)`,2,'literal (z), math'],
 ['quote-fence',String.raw`> > [!note] Code
> > `+'```tex\n'+String.raw`> > \(notmath\)`+'\n> > ```\n> > '+String.raw`\(x\)`,1],
 ['title-table-math',String.raw`> [!note] \(x\)
> | \(a\) | \(b\) |
> | --- | --- |
> | \(c\) | \(d\) |`,5],
 ['multiple-callouts',String.raw`> [!note] \(z\)
> \(z\)

> [!tip] \(z\)
> \(z\)`,4],
 ['list-fence',String.raw`- First
  `+'```tex\n'+String.raw`  \(notmath\)`+'\n  ```\n\n'+String.raw`- \(x\)`,1],
 ['marker-collision','Literal \uE000LSDSTART\uE001 then '+String.raw`\(x\)`,1],
 ['crlf-callout',String.raw`> [!note] Title
> \[a
> +b\]`.replaceAll('\n','\r\n'),1]
 ];
 const protectedFiles=['Examples.md','EulerCallouts.md','Containers.md'];const before=Object.fromEntries(protectedFiles.map(n=>[n,fs.readFileSync(root+'/'+n,'utf8')]));
 try{
  const crlf='Control\r\n\r\nplain text\r\n';
  await app.plugins.disablePlugin('latex-standard-delimiters');
  await app.vault.adapter.write('Stress.md',crlf);await wait(30);
  await leaf.setViewState({type:'markdown',state:{file:'Stress.md',mode:'source',source:false}});await wait(100);
  await leaf.setViewState({type:'markdown',state:{file:'Stress.md',mode:'preview'}});await wait(100);
  check('Host normalizes CRLF with plugin disabled',fs.readFileSync(root+'/Stress.md','utf8')===crlf.replaceAll('\r\n','\n'));
  await app.plugins.enablePlugin('latex-standard-delimiters');
  for(let cycle=0;cycle<3;cycle++)for(const [name,body,count,literal] of cases){
   await leaf.setViewState({type:'markdown',state:{file:'Examples.md',mode:'source',source:false}});
   const text=(name==='frontmatter'?'':'Stress case '+name+'\n\n')+body+'\n\nAfter\n';await app.vault.adapter.write('Stress.md',text);await wait(30);
   for(const mode of ['source','preview']){
    const start=performance.now();await leaf.setViewState({type:'markdown',state:{file:'Stress.md',mode,source:false}});
    if(mode==='source')leaf.view.editor.cm.dispatch({selection:{anchor:0}});
    await wait(220);
    const dom=mode==='source'?leaf.view.editor.cm.dom:leaf.view.previewMode.containerEl;
    const actual=dom.querySelectorAll('.lsd-math mjx-container').length;const label=`${cycle}/${name}/${mode}`;
    check(label+' count',actual===count,{expected:count,actual});check(label+' valid',!dom.querySelector('.lsd-math mjx-merror,.lsd-render-error'));
    if(literal)check(label+' literal',dom.textContent.includes(literal),literal);
    check(label+' source',fs.readFileSync(root+'/Stress.md','utf8')=== (name==='crlf-callout'&&mode==='preview'?text.replaceAll('\r\n','\n'):text));
    if(actual!==count||(literal&&!dom.textContent.includes(literal)))failures.push({label,expected:count,actual,text,html:dom.innerHTML.slice(0,35000)});
    samples.push({label,ms:performance.now()-start,ownedEmbedded:app.plugins.plugins['latex-standard-delimiters'].embeddedChildren.size});
   }
  }
  for(const [name,text]of Object.entries(before))check(name+' bytes unchanged',fs.readFileSync(root+'/'+name,'utf8')===text);
  check('No captured uncaught errors',errors.length===0,errors);
 }finally{
  if(!app.plugins.plugins['latex-standard-delimiters'])await app.plugins.enablePlugin('latex-standard-delimiters');
  await leaf.setViewState(original);window.removeEventListener('error',capture);window.removeEventListener('unhandledrejection',capture);window.lsdRuntimeChecksRunning=false;
  const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),mainJsSha256:crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex'),scope:'40 adversarial cases, 3 cycles, Reading View and Live Preview; native widgets, repeated formulas, literal lookalikes, nested callouts, tables, Markdown exclusions. Warm settled mounts, not a memory-leak or every-platform certification.',results,samples,failures,errors};fs.writeFileSync(root+'/stress-rendering-report.json',JSON.stringify(report,null,2));console.log('STRESS_RENDERING',results.filter(x=>!x.passed));
 }
})();
