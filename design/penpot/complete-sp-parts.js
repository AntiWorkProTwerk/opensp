// One-time native geometry refinement. Run on SP components after inspection.
// References and dimensions: docs/references/sp-panel.md. Preserve component IDs.
if (penpot.currentFile.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3' || penpot.currentPage.name !== 'SP components') throw Error('Open SP components');
const lib = penpot.library.local;
if (lib.components.some(c => c.path === 'SP' && c.name === 'Knob surround')) throw Error('Already installed; inspect the existing mains');
const colors = Object.fromEntries(lib.colors.map(c => [c.name,c]));
const sp = Object.fromEntries(lib.components.filter(c => c.path === 'SP').map(c => [c.name,c]));
function place(s,parent,x,y) { parent.appendChild(s); s.x=parent.x+x; s.y=parent.y+y; return s; }
function path(parent,name,d,fill,stroke,width) {
  const s=penpot.createPath(); s.name=name; s.d=d;
  const x=s.x,y=s.y;
  s.fills=fill?[colors[fill].asFill()]:[];
  s.strokes=stroke?[{...colors[stroke].asStroke(),strokeWidth:width,strokeStyle:'solid',strokeAlignment:'center'}]:[];
  return place(s,parent,x,y);
}
function make(name,x,y,w,h,draw) {
  const b=penpot.createBoard(); b.name='SP / '+name; b.resize(w,h); b.x=x; b.y=y; b.fills=[];
  draw(b); const c=lib.createComponent([b]); c.name=name; c.path='SP'; return c;
}
const knobs=make('Knob surround',900,650,288,50,b=>{
  path(b,'Knob rail / outer capsule','M25 0 H263 C276.807 0 288 11.193 288 25 C288 38.807 276.807 50 263 50 H25 C11.193 50 0 38.807 0 25 C0 11.193 11.193 0 25 0 Z','Surface','Ink',1.2);
  path(b,'Knob rail / inset edge','M25 3 H263 C275.15 3 285 12.85 285 25 C285 37.15 275.15 47 263 47 H25 C12.85 47 3 37.15 3 25 C3 12.85 12.85 3 25 3 Z',null,'Line',.6);
});
const effects=make('Effects surround',900,770,280,112,b=>{
  path(b,'Effects housing / curved sides','M18 0 H262 C272 18 280 38 280 56 C280 74 272 94 262 112 H18 C8 94 0 74 0 56 C0 38 8 18 18 0 Z','Surface','Ink',1.2);
});
const instrument=sp.Instrument.mainInstance();
place(knobs.instance(),instrument,56,43).name='Knob surround';
place(effects.instance(),instrument,60,111).name='Effects surround';
// Native children and exported SVG use back-to-front order. Put housings above
// the enclosure but behind every control, without detaching existing instances.
const enclosure=instrument.children.find(s=>s.name==='Enclosure');
instrument.children.find(s=>s.name==='Knob surround').setParentIndex(enclosure.parentIndex+1);
instrument.children.find(s=>s.name==='Effects surround').setParentIndex(enclosure.parentIndex+2);
instrument.children.find(s=>s.name==='Effect buttons').y=instrument.y+117;

const display=sp.Display.mainInstance();
const bg=display.children.find(s=>s.name==='OLED background');
const slot=display.children.find(s=>s.name.startsWith('OLED content slot'));
if(!bg||!slot)throw Error('Missing original display slot');
const old={x:slot.x,y:slot.y,w:slot.width,h:slot.height};
const pixels=slot.children.map(s=>({s,x:(s.x-old.x)/old.w,y:(s.y-old.y)/old.h,w:s.width/old.w,h:s.height/old.h}));
bg.resize(122,61); bg.x=display.x+5; bg.y=display.y+35.5;
slot.resize(122,61); slot.x=bg.x; slot.y=bg.y;
for(const p of pixels){p.s.resize(p.w*122,p.h*61);p.s.x=slot.x+p.x*122;p.s.y=slot.y+p.y*61;}
const aperture=penpot.createEllipse(); aperture.name='OLED circular aperture'; aperture.resize(122,122);
aperture.fills=[colors['OLED pixel'].asFill()]; aperture.strokes=[]; place(aperture,display,5,5);
const viewport=penpot.group([bg,slot,aperture]);
viewport.name='OLED viewport / circular clip';
// Penpot uses the first child as the mask, not the topmost painted child.
aperture.setParentIndex(0); viewport.makeMask();
const rim=penpot.createEllipse(); rim.name='Inner glass edge'; rim.resize(122,122); rim.fills=[];
rim.strokes=[{...colors.Ink.asStroke(),strokeWidth:.7,strokeStyle:'solid',strokeAlignment:'center'}]; place(rim,display,5,5);
display.setPluginData('screen-slot',JSON.stringify({x:5,y:35.5,width:122,height:61,nativeAspect:'128:64',clip:'OLED circular aperture',docs:'docs/sp-display.md'}));
instrument.setPluginData('panel-refinement','Front-on surrounds and circular OLED aperture; docs/references/sp-panel.md');
return {surrounds:[knobs,effects].map(c=>({name:c.name,id:c.id,main:c.mainInstance().id})),viewport:{id:viewport.id,mask:viewport.isMask(),children:viewport.children.map(s=>({name:s.name,id:s.id,index:s.parentIndex}))}};
