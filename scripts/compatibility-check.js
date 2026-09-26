// Disposable TestVault only. Uses a copy of the user's Extended MathJax 0.4.1.
(async () => {
  if (app.vault.getName() !== 'TestVault') throw new Error('TestVault only');
  const fs = require('node:fs');
  const root=app.vault.adapter.getBasePath();
  const before=fs.readFileSync(root+'/Compatibility.md','utf8');
  const config=root+'/.obsidian/community-plugins.json';
  const original=fs.readFileSync(config,'utf8');
  const results=[];
  const check=(name,passed,detail='')=>results.push({name,passed,detail});
  const wait=async()=>{ for(let i=0;i<40;i++){ await new Promise(resolve=>setTimeout(resolve,125)); const nodes=[...leaf.view.containerEl.querySelectorAll('mjx-container')]; if(nodes.length&&nodes.every(node=>node.querySelector('mjx-math'))) return; } };
  const leaf=app.workspace.activeLeaf;
  try {
    await app.plugins.loadManifests();
    await app.plugins.enablePlugin('obsidian-latex');
    await wait();
    check('Extended MathJax 0.4.1 loaded',app.plugins.plugins['obsidian-latex']?.manifest.version==='0.4.1');
    for(const mode of ['source','preview']) {
      await leaf.setViewState({type:'markdown',state:{file:'Compatibility.md',mode,source:false}}); await wait();
      const container=leaf.view.containerEl.querySelector(mode==='source'?'.cm-editor':'.markdown-preview-view');
      check(mode+': custom macro and chemistry render',container.querySelectorAll('mjx-container').length===3 && !container.querySelector('mjx-merror'),container.textContent);
      check(mode+': standard and native macro agree',Array.from(container.querySelectorAll('mjx-container')).slice(0,2).every(el=>el.querySelector('.mjx-c1D444')&&el.querySelector('.mjx-c34')&&el.querySelector('.mjx-c32')));
    }
    await app.plugins.disablePlugin('latex-standard-delimiters');
    await leaf.setViewState({type:'markdown',state:{file:'Compatibility.md',mode:'source',source:false}});await wait();
    check('Unloading ours preserves native MathJax',Boolean(leaf.view.containerEl.querySelector('.cm-editor mjx-container .mjx-c1D444')));
    // Simulate saved configuration containing the overlapping renderer.
    const enabled=JSON.parse(original);fs.writeFileSync(config,JSON.stringify([...enabled,'latex-delimiter-renderer']));
    await app.plugins.enablePlugin('latex-standard-delimiters');await wait();
    check('Overlapping renderer guard leaves ours inactive',leaf.view.containerEl.querySelectorAll('.lsd-math').length===0);
    await app.plugins.disablePlugin('latex-standard-delimiters');
    fs.writeFileSync(config,original);
    await app.plugins.enablePlugin('latex-standard-delimiters');await wait();
    check('Restoring plugin renders custom macro again',Boolean(leaf.view.containerEl.querySelector('.lsd-math mjx-container .mjx-c1D444')));
    check('Compatibility note bytes unchanged',fs.readFileSync(root+'/Compatibility.md','utf8')===before);
  } finally { fs.writeFileSync(config,original); }
  fs.writeFileSync(root+'/compatibility-report.json',JSON.stringify({version:'0.3.0',results},null,2));
  console.log('COMPATIBILITY',results.filter(x=>!x.passed));
})();
