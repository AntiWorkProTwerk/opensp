if(penpot.currentPage.name!=='Guide components')throw Error('Open Guide components');
const lib=penpot.library.local,d=storage.demos;
d.repair=async(spec,ids)=>{
 const main=lib.components.find(c=>c.name==='Demo: '+spec.slug).mainInstance();
 const boards=[main,...[false,true].map(m=>lib.components.find(c=>c.name==='Demo figure: '+spec.slug+(m?' (Mobile)':' (Desktop)')).mainInstance().children.find(s=>s.component?.()?.name==='Demo: '+spec.slug))];
 for(const b of boards){
  const k=b.width/480;
  for(const m of spec.marks.filter(m=>ids.includes(m.id))){
   const s=penpotUtils.findShape(s=>s.name===m.id,b);if(!s)throw Error('Missing '+m.id);
   if(m.type==='path'){
    s.d=m.d.replace(/[MLHV][^MLHV]*/g,part=>{const command=part[0],numbers=part.slice(1).trim().split(/[ ,]+/).map(Number);return command+numbers.map((n,i)=>n*k+(['H'].includes(command)?b.x:['V'].includes(command)?b.y:i%2?b.y:b.x)).join(' ');});
   }else{d.put(s,b,m.x*k,m.y*k,m.w*k,m.h*k);if(m.type==='text'){s.characters=m.text||' ';s.fontSize=String(m.size*k);}}
  }
  await new Promise(r=>setTimeout(r,25));
 }
 return {slug:spec.slug,repaired:ids};
};
d.finish=async(names)=>{
 const results=[];
 for(const name of names){
  const b=lib.components.find(c=>c.name===name).mainInstance();if(b.getPluginData('opensp-demo-finish')==='v1'){results.push({name,existed:true});continue;}
  const mobile=name.endsWith('(Mobile)'),pad=mobile?24:28;
  const diagram=b.children.find(s=>s.component?.()?.path==='OpenSP / Demonstrations');
  const controls=b.children.filter(s=>/^(Control|Choice|Option|Range|Value|Action) \/ /.test(s.name));
  if(!mobile){const top=Math.min(...controls.map(s=>s.y)),bottom=Math.max(...controls.map(s=>s.y+s.height));const shift=Math.max(0,(diagram.height-(bottom-top))/2);for(const s of controls)s.y+=shift;}
  for(const s of b.children)s.y+=pad;
  b.resize(b.width,b.height+pad*2);
  for(const [name,y] of [['Figure top rule',0],['Figure bottom rule',b.height-1]]){const r=penpot.createRectangle();r.name=name;r.fills=[d.colors.Line.asFill()];d.put(r,b,0,y,b.width,1);}
  if(name.includes('synth-design'))for(const id of ['confirm','cancel']){const box=b.children.find(s=>s.name==='Action / '+id),label=b.children.find(s=>s.name==='Control / '+id);box.fills=[d.colors.Surface.asFill()];label.fills=[d.colors.Muted.asFill()];}
  b.setPluginData('opensp-demo-finish','v1');results.push({name,height:b.height});await new Promise(r=>setTimeout(r,25));
 }
 return results;
};
return {ready:true};
