// Register bounded propagation helpers, then call prepare() and batch() through
// storage.spParts on SP components, Guide components, Homepage and First guide.
// Newly inserted Penpot children do not inherit existing scale/theme overrides.
if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const lib=penpot.library.local;
const walk=s=>s.hidden?[]:[s,...(s.children||[]).flatMap(walk)];
const mains=Object.fromEntries(lib.components.filter(c=>c.path==='SP').map(c=>[c.name,c]));
const colors=Object.fromEntries(lib.colors.map(c=>[c.name,c]));
const darkMap={Paper:'Dark paper',Ink:'Dark ink',Muted:'Dark muted',Line:'Dark line',Surface:'Dark surface'};
const dark=s=>{for(let p=s;p;p=p.parent)if(/dark/i.test(p.name))return true;return false;};
const api={queue:[]};
api.prepare=()=>{
 if(api.queue.length)throw Error('Finish the pending batch first');
 const visible=walk(penpot.currentPage.root);
 const guide=['Guide components','First guide'].includes(penpot.currentPage.name);
 const instruments=visible.filter(s=>s.isComponentHead()&&s.component()?.name==='Instrument');
 const displays=visible.filter(s=>s.isComponentHead()&&s.component()?.name==='Display');
 const add=(s,x,y,w,h,font=null)=>api.queue.push({s,x,y,w,h,font,dark:dark(s)});
 for(const instrument of instruments){
  const k=instrument.width/400;
  for(const [name,x,y]of [['Knob surround',56,43],['Effects surround',60,111]]){
   const root=instrument.children.find(s=>s.name===name),main=mains[name].mainInstance();
   if(!root)throw Error('Missing linked '+name);
   const target=walk(root),source=walk(main);
   for(let i=0;i<source.length;i++){
    const a=source[i],b=target.find(s=>s.name===a.name)||(!i?root:null);
    if(!b)throw Error('Missing surround part '+a.name);
    add(b,instrument.x+(x+a.x-main.x)*k,instrument.y+(y+a.y-main.y)*k,a.width*k,a.height*k);
   }
  }
  const fx=instrument.children.find(s=>s.name==='Effect buttons');
  const dy=instrument.y+117*k-fx.y;
  for(const s of walk(fx))add(s,s.x,s.y+dy,s.width,s.height);
 }
 for(const display of displays){
  const k=display.width/132,items=walk(display);
  const group=items.find(s=>s.name==='OLED viewport / circular clip');
  const aperture=items.find(s=>s.name==='OLED circular aperture');
  const bg=items.find(s=>s.name==='OLED background');
  const rim=items.find(s=>s.name==='Inner glass edge');
  const slot=items.find(s=>s.isComponentHead()&&s.name.startsWith('OLED content slot'));
  if(!group||!aperture||!bg||!rim||!slot)throw Error('Incomplete display '+display.id);
  if(guide&&slot.component()?.name!=='Menu title screen'){
   slot.swapComponent(lib.components.find(c=>c.name==='Menu title screen'));
   slot.name='OLED content slot / Menu title screen';
  }
  const sx=slot.x,sy=slot.y,sw=slot.width,sh=slot.height;
  const content=walk(slot).slice(1).map(s=>({s,x:(s.x-sx)/sw,y:(s.y-sy)/sh,w:s.width/sw,h:s.height/sh,font:s.type==='text'?Number(s.fontSize)*122*k/sw:null}));
  for(const s of [group,aperture,rim])add(s,display.x+5*k,display.y+5*k,122*k,122*k);
  for(const s of [bg,slot])add(s,display.x+5*k,display.y+35.5*k,122*k,61*k);
  for(const p of content)add(p.s,display.x+(5+p.x*122)*k,display.y+(35.5+p.y*61)*k,p.w*122*k,p.h*61*k,p.font);
 }
 return {page:penpot.currentPage.name,instruments:instruments.length,displays:displays.length,remaining:api.queue.length};
};
api.batch=()=>{
 for(const p of api.queue.splice(0,20)){
  p.s.resize(p.w,p.h);p.s.x=p.x;p.s.y=p.y;if(p.font!==null)p.s.fontSize=String(p.font);
  if(p.dark){
   if(Array.isArray(p.s.fills))p.s.fills=p.s.fills.map(f=>{const key=Object.keys(darkMap).find(n=>colors[n].id===f.fillColorRefId);return key?{...f,...colors[darkMap[key]].asFill()}:f;});
   if(p.s.strokes?.length)p.s.strokes=p.s.strokes.map(f=>{const key=Object.keys(darkMap).find(n=>colors[n].id===f.strokeColorRefId);return key?{...f,...colors[darkMap[key]].asStroke(),strokeWidth:f.strokeWidth}:f;});
  }
 }
 return {remaining:api.queue.length};
};
storage.spParts=api;
return {ready:true};
