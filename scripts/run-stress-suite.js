// Set lsdTestScriptsPath and lsdTestHostVersion as for run-runtime-suite.js.
(async()=>{
 const fs=require('node:fs'),crypto=require('node:crypto'),root=app.vault.adapter.getBasePath();
 if(!root.endsWith('/work/TestVault'))throw Error('Disposable work/TestVault only');
 if(typeof window.lsdTestScriptsPath!=='string'||typeof window.lsdTestHostVersion!=='string')throw Error('Set script path and displayed host version first');
 for(const script of ['boundary-stress-check.js','daily-editing-check.js','stress-rendering-check.js','stress-lifecycle-check.js','stress-volume-check.js'])await eval(fs.readFileSync(window.lsdTestScriptsPath+'/'+script,'utf8'));
 const mainJsSha256=crypto.createHash('sha256').update(fs.readFileSync(root+'/.obsidian/plugins/latex-standard-delimiters/main.js')).digest('hex');
 const reports=['boundary-stress','daily-editing','stress-rendering','stress-lifecycle','stress-volume'].map(name=>{
  const report=JSON.parse(fs.readFileSync(root+'/'+name+'-report.json','utf8'));
  if(report.mainJsSha256!==mainJsSha256)throw Error('Bundle changed during stress run');
  return {name,count:report.results.length,failures:report.results.filter(r=>!r.passed)};
 });
 const report={version:app.plugins.plugins['latex-standard-delimiters'].manifest.version,obsidianVersion:window.lsdTestHostVersion,timestamp:new Date().toISOString(),mainJsSha256,reports,passed:reports.every(r=>r.failures.length===0)};
 fs.writeFileSync(root+'/stress-suite-report.json',JSON.stringify(report,null,2));console.log('STRESS_SUITE',report);
})();
