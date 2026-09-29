// After inserting/swapping a screen main, run on SP components and Homepage.
// Penpot does not scale newly inserted children into previously resized instances.
// Derive only the content-slot override from the existing OLED background.
if (penpot.currentFile.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3') throw Error('OpenSP only');
function walk(s) { return s.hidden ? [] : [s,...(s.children||[]).flatMap(walk)]; }
const displays=walk(penpot.currentPage.root).filter(s=>s.isComponentHead()&&s.component()?.id==='e630c86e-d742-80d8-8008-b565ebd57582');
return displays.map(display=>{
  const bg=walk(display).find(s=>s.name==='OLED background');
  const slot=walk(display).find(s=>s.name.startsWith('OLED content slot'));
  if(!bg||!slot)throw Error('Missing screen slot in '+display.id);
  const sw=slot.width,sh=slot.height;
  const parts=walk(slot).slice(1).map(s=>({s,x:(s.x-slot.x)/sw,y:(s.y-slot.y)/sh,w:s.width/sw,h:s.height/sh,font:s.type==='text'?Number(s.fontSize):null}));
  slot.resize(bg.width,bg.width/2); slot.x=bg.x; slot.y=bg.y+(bg.height-slot.height)/2;
  for(const p of parts){p.s.resize(p.w*slot.width,p.h*slot.height);p.s.x=slot.x+p.x*slot.width;p.s.y=slot.y+p.y*slot.height;if(p.font!==null)p.s.fontSize=String(p.font*slot.width/sw);}
  slot.setPluginData('screen-fit','Centered 128:64 content inside OLED background; responsive geometry override.');
  return {display:display.id,slot:slot.id,x:slot.x,y:slot.y,width:slot.width,height:slot.height,linked:slot.isComponentCopyInstance()};
});
