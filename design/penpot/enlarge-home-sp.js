// Homepage-only scale overrides; preserve the canonical reusable SP components.
// Load once, call plan() once, drain batch(), then verify(). Never reload mid-queue.
if(penpot.currentFile?.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3'||penpot.currentPage.name!=='Homepage')throw Error('Open OpenSP Homepage');
const d=storage.largeSP={queue:[],before:[],planned:false};
d.walk=s=>(s.children||[]).filter(c=>!c.hidden&&!c.name.startsWith('Archived')).flatMap(c=>[c,...d.walk(c)]);
d.round=n=>Math.round(n*10000)/10000;
d.freeze=(s,ox,oy)=>[s.id,d.round(s.x-ox),d.round(s.y-oy),d.round(s.width),d.round(s.height),s.type==='text'?[s.characters,s.fontId,s.fontSize,s.lineHeight,s.letterSpacing]:null,s.fills,(s.children||[]).filter(c=>!c.hidden).map(c=>d.freeze(c,ox,oy))];
d.plan=()=>{
 if(d.planned)throw Error('Already planned');d.planned=true;
 const boards=penpot.currentPage.root.children.filter(b=>!b.hidden&&b.name.startsWith('Homepage /'));
 for(const b of boards){
  const m=b.width===390,sp=b.children.find(s=>s.name==='SP instrument'),w=m?320:440,k=w/sp.width;
  const rootX=b.x+(m?35:856),rootY=b.y+(m?320:112),delta=m?200:285;
  if(Math.abs(sp.width-(m?180:240))>.01)throw Error('Inspect scale before rerun: '+b.name);
  const protectedRoots=b.children.filter(s=>s.id!==sp.id).map(s=>({s,absolute:['Navigation','Hero copy'].includes(s.name),frozen:JSON.stringify(d.freeze(s,s.x,s.y)),x:s.x,y:s.y}));
  d.before.push({b,sp,protectedRoots,delta,heads:d.walk(sp).filter(s=>s.isComponentHead()).length});
  d.queue.push(...[sp,...d.walk(sp)].map(s=>({s,x:rootX+(s.x-sp.x)*k,y:rootY+(s.y-sp.y)*k,w:s.width*k,h:s.height*k,font:s.type==='text'?Number(s.fontSize)*k:null})));
  for(const a of protectedRoots)if(!a.absolute)a.s.y=a.y+delta;
  b.resize(b.width,b.height+delta);
 }
 return {boards:boards.length,queued:d.queue.length};
};
d.batch=()=>{
 for(const a of d.queue.splice(0,32)){a.s.resize(a.w,a.h);a.s.x=a.x;a.s.y=a.y;if(a.font)a.s.fontSize=String(a.font);}
 return {remaining:d.queue.length};
};
d.verify=()=>{
 if(d.queue.length)throw Error('Finish scaling first');
 return d.before.map(({b,sp,protectedRoots,delta,heads})=>{
  for(const a of protectedRoots){
   if(JSON.stringify(d.freeze(a.s,a.s.x,a.s.y))!==a.frozen)throw Error('Protected component changed: '+b.name+'/'+a.s.name);
   if(Math.abs(a.s.x-a.x)>.01||Math.abs(a.s.y-a.y-(a.absolute?0:delta))>.01)throw Error('Unexpected position: '+a.s.name);
  }
  if(!sp.isComponentHead()||d.walk(sp).filter(s=>s.isComponentHead()).length!==heads)throw Error('SP component links changed');
  b.setPluginData('opensp-layout',JSON.stringify({mobile:b.width===390,dark:b.name.endsWith('Dark'),linked:true,revision:'2026-09-28-dominant-sp'}));
  return {board:b.name,sp:[sp.width,sp.height],height:b.height,sectionsUnchanged:true,nestedSP:heads};
 });
};
return {loaded:true};
