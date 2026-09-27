import assert from 'node:assert/strict';
import test from 'node:test';
import { findMathDelimiters } from '../src/parser';
import { mathPresentation, containerReplacementRanges } from '../src/presentation';

function random(seed: number) { return () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; }; }

test('seeded mixed Markdown documents preserve expected math and exclude protected examples (2000 documents)', () => {
 const rnd=random(0x4c5344);
 for(let trial=0;trial<2000;trial++){
  let text='';const expected:string[]=[];
  for(let part=0;part<8;part++){
   const source=String.raw`\frac{x_{${trial}}}{y^{${part}}}+\underbrace{z}_{\text{odd}}`;
   const kind=Math.floor(rnd()*8);
   if(kind<3){text+=kind===0?`\\(${source}\\)` :kind===1?`\\[${source}\\]`:`> \\(${source}\\)`;expected.push(source);}
   else if(kind===3)text+='`'+`\\(${source}\\)`+'`';
   else if(kind===4)text+='```tex\n'+`\\[${source}\\]`+'\n```';
   else if(kind===5)text+=`<!-- \\(${source}\\) -->`;
   else if(kind===6)text+=`$${source}$`;
   else text+=String.raw`\\(literal\\)`;
   text+='\n\n';
  }
  const matches=findMathDelimiters(text);
  assert.deepEqual(matches.map(x=>x.source),expected,`seed trial ${trial}`);
  for(let i=0;i<matches.length;i++){
   const m=matches[i];assert.equal(text.slice(m.from+2,m.to-2),m.source);assert.ok(i===0||matches[i-1].to<=m.from);
  }
 }
});

test('seeded quote/list projections retain exact source offsets (2000 containers)',()=>{
 const rnd=random(0x534547);
 for(let trial=0;trial<2000;trial++){
  const quote='> '.repeat(1+Math.floor(rnd()*3)),list=rnd()<.5?'- ':'';
  const lines=[String.raw`a_b &= \underbrace{x}_{\text{even}} \\`,String.raw`c_d &= \frac{y}{z}`];
  const prefix=quote+' '.repeat(list.length);
  const text=quote+list+'\\[\n'+lines.map(s=>prefix+s).join('\n')+'\n'+prefix+'\\]';
  const m=findMathDelimiters(text)[0];assert.ok(m);const p=mathPresentation(text,m);
  assert.equal(p.source,'\n'+lines.join('\n')+'\n');assert.ok(p.standalone);
  for(const s of p.segments)assert.equal(text.slice(s.from,s.to),p.source.slice(s.sourceFrom,s.sourceFrom+s.to-s.from));
  for(const range of containerReplacementRanges(text,m,p))assert.ok(!text.slice(range.from,range.to).includes('\n')&&!text.slice(range.from,range.to).startsWith('>'));
 }
});

test('seeded malformed input never produces invalid or overlapping match ranges (3000 inputs)',()=>{
 const rnd=random(0x4d414c),alphabet='\\[]()$`%\n >_*{}abc012';
 for(let trial=0;trial<3000;trial++){
  let text='';for(let i=0;i<150;i++)text+=alphabet[Math.floor(rnd()*alphabet.length)];
  const matches=findMathDelimiters(text,37);let end=37;
  for(const m of matches){assert.ok(m.from>=end&&m.to<=text.length+37&&m.to>m.from+4);assert.equal(text.slice(m.from-35,m.to-39),m.source);end=m.to;}
 }
});
