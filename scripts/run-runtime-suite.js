// Set window.lsdTestScriptsPath to this directory, then evaluate this file.
(async()=>{
 if(app.vault.getName()!=='TestVault')throw new Error('Disposable TestVault only');
 if(window.lsdRuntimeChecksRunning)throw new Error('Another test run is active');
 if(typeof window.lsdTestHostVersion!=='string')throw new Error('Set window.lsdTestHostVersion from the displayed Obsidian window title');
 if(typeof window.lsdTestScriptsPath!=='string')throw new Error('Set window.lsdTestScriptsPath to the source package scripts folder');
 const fs=require('node:fs'),path=require('node:path'),root=app.vault.adapter.getBasePath();
 for(const file of ['Examples.md','EdgeCases.md','Navigation.md','Audit.md','Typing.md','Compatibility.md','EmbedHost.md','preamble.sty','Comfort.md','Upstream.md','Containers.md','ContainerVariants.md','EulerCallouts.md'])if(!fs.existsSync(path.join(root,file)))throw new Error('Copy supplied fixture '+file+' into TestVault first');
 const swiftSettings=JSON.parse(fs.readFileSync(path.join(root,'.obsidian/plugins/swiftlatex-render/data.json'),'utf8'));
 if(swiftSettings.enableCache!==false || swiftSettings.package_url!=='http://127.0.0.1:9/')throw new Error('Configure isolated SwiftLaTeX with cache disabled and loopback-only endpoint');
 if(!fs.existsSync(path.join(root,'.obsidian/themes/Minimal/theme.css')))throw new Error('Copy Minimal theme stylesheet into TestVault for theme checks');
 window.lsdRuntimeChecksRunning=true;
 // Source visibility requires the focused main document. Popout runs last because
 // closing its native window can leave the parent document unfocused.
 const scripts=['euler-callout-check.js','container-editing-check.js','container-variants-check.js','navigation-check.js','runtime-check.js','editing-preview-check.js','beta-audit.js','typing-compatibility-check.js','compatibility-check.js','input-comfort-check.js','composition-ownership-check.js','panes-comfort-check.js','upstream-coexistence-check.js','swift-coexistence-check.js','vim-check.js','edit-performance-check.js','theme-narrow-check.js','popout-check.js'];
 const reports=['euler-callout','container-editing','container-variants','navigation','runtime','editing-preview','beta-audit','typing-compatibility','compatibility','input-comfort','composition-ownership','panes-comfort','upstream-coexistence','swift-coexistence','vim','edit-performance','theme-narrow','popout'];
 try{
  await app.plugins.disablePlugin('latex-standard-delimiters');await app.plugins.enablePlugin('latex-standard-delimiters');
  for(const script of scripts)await eval(fs.readFileSync(path.join(window.lsdTestScriptsPath,script),'utf8'));
  const summary={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,timestamp:new Date().toISOString(),obsidianVersion:window.lsdTestHostVersion,stylesSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'.obsidian/plugins/latex-standard-delimiters/styles.css'))).digest('hex'),mainJsSha256:require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'.obsidian/plugins/latex-standard-delimiters/main.js'))).digest('hex'),reports:[]};
  for(const name of reports){const report=JSON.parse(fs.readFileSync(path.join(root,name+'-report.json'),'utf8'));const tests=report.results??report.tests;summary.reports.push({name,count:tests.length,failures:tests.filter(test=>!test.passed)});}
  summary.passed=summary.reports.every(report=>report.failures.length===0);
  fs.writeFileSync(path.join(root,'suite-report.json'),JSON.stringify(summary,null,2));console.log('SUITE',summary);
 }finally{window.lsdRuntimeChecksRunning=false;}
})();
