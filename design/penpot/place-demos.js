// Migrate existing native pages once; retain the old milestone figure as an archive.
if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const lib=penpot.library.local,colors=Object.fromEntries(lib.colors.map(c=>[c.name,c]));
const p=storage.demoPages={};
p.place=async(id,spec)=>{
 const b=penpot.currentPage.getShapeById(id);if(!b)throw Error('Missing article');
 if(b.getPluginData('opensp-demo-migration')==='v1')return {id,existed:true};
 if(penpotUtils.findShape(s=>s.name==='Chapter demonstration',b))throw Error('Inspect partial migration');
 const mobile=b.name.includes('Mobile'),dark=b.name.endsWith('Dark'),x=mobile?24:384;
 const main=lib.components.find(c=>c.name==='Demo figure: '+spec.slug+(mobile?' (Mobile)':' (Desktop)'));if(!main)throw Error('Missing figure');
 const figure=main.instance();figure.name='Chapter demonstration';
 let parent=b,y,delta;
 if(spec.slug==='first-change'){
  const section=b.children.find(s=>s.component?.()?.name==='twelve-characters');if(!section)throw Error('Missing comparison section');
  const checkpoint=section.children.find(s=>s.name==='Reader checkpoint');if(!checkpoint)throw Error('Missing checkpoint');
  // Penpot forbids adding children to an existing component instance. Keep the
  // new linked figure on the article board, in the section's reserved space.
  y=checkpoint.y;delta=figure.height+40;
  const oldBottom=section.y+section.height;
  for(const s of section.children)if(s.y>=y-1)s.y+=delta;
  section.resize(section.width,section.height+delta);
  for(const s of b.children)if(s.id!==section.id&&s.y>=oldBottom-1)s.y+=delta;
 }else if(spec.slug==='first-animation'){
  const paragraphs=b.children.filter(s=>s.name.startsWith(spec.sectionId+' / paragraph'));
  if(!paragraphs.length)throw Error('Missing animation section paragraphs');
  y=Math.max(...paragraphs.map(s=>s.y+s.height))+24;delta=figure.height+40;
  for(const s of b.children)if(s.y>=y-1)s.y+=delta;
 }else{
  const old=b.children.find(s=>s.name==='Journey sequence'),summary=b.children.find(s=>s.name==='Chapter summary'),disclosure=b.children.find(s=>s.name==='Sequence disclosure');
  if(!old||!summary||!disclosure)throw Error('Missing incumbent sequence');
  y=old.y;const oldNext=summary.y+summary.height+(mobile?48:64);
  const newSummary=y+figure.height+32,disclosureTop=newSummary+summary.height+24,newNext=disclosureTop+44+(mobile?48:64);
  delta=newNext-oldNext;
  for(const s of b.children)if(s.y>=oldNext-1)s.y+=delta;
  old.name='Archive / milestone sequence';old.hidden=true;
  summary.y=newSummary;disclosure.characters='READ THE MILESTONE SEQUENCE  +';disclosure.y=disclosureTop;disclosure.resize(mobile?342:760,44);
 }
 parent.appendChild(figure);figure.x=b.x+x;figure.y=y;
 if(dark){const map={Paper:'Dark paper',Ink:'Dark ink',Muted:'Dark muted',Line:'Dark line',Surface:'Dark surface'};let i=0;for(const s of [figure,...penpotUtils.findShapes(s=>s.id!==figure.id,figure)]){
   if(s.fills?.length)s.fills=s.fills.map(f=>{const n=Object.keys(map).find(n=>f.fillColorRefId===colors[n].id);return n?{...f,...colors[map[n]].asFill()}:f;});
   if(s.strokes?.length)s.strokes=s.strokes.map(f=>{const n=Object.keys(map).find(n=>f.strokeColorRefId===colors[n].id);return n?{...f,...colors[map[n]].asStroke(),strokeWidth:f.strokeWidth}:f;});
   if(++i%20===0)await new Promise(r=>setTimeout(r,25));
  }}
 b.resize(b.width,b.height+delta);b.setPluginData('opensp-demo-migration','v1');
 return {id,slug:spec.slug,mobile,dark,figureId:figure.id,componentId:main.id,height:b.height};
};
return {ready:true};
