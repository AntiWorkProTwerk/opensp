// Read-only. Run on Homepage; returns bounded checks for all four native views.
if (penpot.currentPage.id !== '65e71e3a-a290-8019-8008-b52b1fb87f69') throw Error('Open Homepage');
function walk(s){return s.hidden?[]:[s,...(s.children||[]).flatMap(walk)];}
const boards=penpot.currentPage.root.children.filter(s=>!s.hidden&&s.type==='board');
return boards.map(b=>{
  const all=walk(b);
  const display=all.find(s=>s.isComponentHead()&&s.component()?.id==='e630c86e-d742-80d8-8008-b565ebd57582');
  const slot=walk(display).find(s=>s.name.startsWith('OLED content slot'));
  const bg=walk(display).find(s=>s.name==='OLED background');
  const aperture=walk(display).find(s=>s.name==='OLED circular aperture');
  if(!slot?.isComponentCopyInstance()||slot.component()?.id!=='88ef66de-c84d-8075-8008-b5cd51dfbbdb')throw Error('Unlinked content');
  for(const [a,c] of [[slot.x,bg.x],[slot.width,bg.width],[slot.height,slot.width/2],[slot.y+slot.height/2,bg.y+bg.height/2]])if(Math.abs(a-c)>.001)throw Error('Slot fit '+b.name);
  if(!aperture||Math.abs(aperture.width-slot.width)>.001||Math.abs(aperture.y+aperture.height/2-slot.y-slot.height/2)>.001)throw Error('Circular aperture fit '+b.name);
  if(all.some(s=>['OLED heading','OLED value','OLED waveform'].includes(s.name)))throw Error('Old placeholder visible');
  if(slot.fills[0]?.fillColor!=='#000000'||slot.children[0].fills[0]?.fillColor!=='#ffffff')throw Error('OLED palette');
  const old=storage.screenBefore?.[b.id];
  const drift=old?.filter(o=>{const s=all.find(v=>v.id===o.id);return !s||['x','y','width','height'].some((k,i)=>Math.abs(s[k]-o[['x','y','w','h'][i]])>.001)||(o.text!==null&&s.characters!==o.text);});
  if(drift?.length)throw Error('Unrelated geometry/copy drift '+JSON.stringify(drift.map(s=>s.id)));
  const instrument=all.find(s=>s.isComponentHead()&&s.component()?.id==='687117da-a825-80bd-8008-b5694305e7b0');
  return {board:b.name,slot:slot.id,width:slot.width,height:slot.height,linked:true,nestedSPHeads:walk(instrument).filter(s=>s.isComponentHead()).length-1,baselineUnchanged:old?true:'not captured this session'};
});
