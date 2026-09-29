// Load on Homepage, then run mains() on Design system and board(id) on Homepage.
// Captures the owner's white desktop wording before changing shared components.
if (penpot.currentFile?.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3' || penpot.currentPage.name !== 'Homepage') throw Error('Open OpenSP Homepage');
const d = storage.ownerCopy = {};
d.find = (r, n) => { const s = penpotUtils.findShape(s => s.name === n || s.name === 'OpenSP / ' + n, r); if (!s) throw Error('Missing ' + n); return s; };
d.boards = penpot.currentPage.root.children.filter(s => !s.hidden && s.name.startsWith('Homepage /'));
d.source = d.boards.find(s => s.name === 'Homepage / Desktop / Light');
d.visible = r => { const result = []; const walk = s => { if(s.hidden || s.name.startsWith('Archived')) return; result.push(s); for(const c of s.children || []) walk(c); }; walk(r); return result; };
d.freeze = r => JSON.stringify(d.visible(r).map(s => [s.id,s.x-r.x,s.y-r.y,s.width,s.height,s.type==='text'?s.characters:null,s.fills,s.strokes,s.isComponentHead()]));
d.before = Object.fromEntries(d.boards.map(b => [b.id, {sp:d.freeze(d.find(b,'SP instrument')),nav:d.freeze(d.find(b,'Navigation'))}]));
d.norm = s => s.replace(/\s+/g,' ').trim();
d.content = {};
for(const r of d.source.children.filter(s => s.name !== 'SP instrument' && s.name !== 'Navigation' && s.name !== 'Preview notice')) {
 d.content[r.name] = Object.fromEntries(d.visible(r).filter(s => s.type === 'text').map(s => [s.name,s.characters]));
}
// Paragraph boundaries change; spelling, punctuation and words do not.
d.content['Hero copy'].Subtitle = d.norm(d.content['Hero copy'].Subtitle).replace('. Everything', '.\n\nEverything');
d.styles = Object.fromEntries(penpot.library.local.typographies.map(t => [t.name,t]));
d.box = (s,p,x,y,w,h) => { if(s.flex || s.grid) throw Error('Unexpected automatic layout: '+s.name); if(w!==undefined)s.resize(w,h); s.x=p.x+x;s.y=p.y+y;return s; };
d.put = (r,n,x,y,w,h) => d.box(d.find(r,n),r,x,y,w,h);
d.copy = (r,key) => { for(const [name,value] of Object.entries(d.content[key])) { const t=d.find(r,name); if(t.characters!==value)t.characters=value; } };
d.geometry = (r,role,m=false) => {
 if(role==='Hero copy') {
  r.resize(m?342:760,m?264:300);
  d.put(r,'Subtitle',0,m?112:136,m?342:570,m?152:164);
  if(!m)d.find(r,'Subtitle').characters=d.content['Hero copy'].Subtitle.replace('guides for the','guides\nfor the');
 } else if(role==='Section header') {
  if(m) {
   r.resize(342,128);d.put(r,'Rule',0,0,342,1);d.put(r,'Numbered label',0,24);
   const t=d.put(r,'Description',0,60,310,56);t.hidden=false;t.fontSize='22';t.lineHeight='1.25';
   d.put(r,'Disclosure indicator',310,16,32,44);
  }
 } else if(role==='Release content') {
  r.resize(m?342:992,m?280:208);d.put(r,'Body',0,0,m?342:850,m?144:72);
  const card=d.put(r,'Release card',0,m?168:96,m?342:992,m?104:88);
  d.put(card,'Card surface',0,0,m?342:992,m?104:88);
  d.put(card,'Status',m?20:24,14,m?302:944,24);
  d.put(card,'Card body',m?20:24,44,m?302:944,m?48:28);
 } else if(role==='Footer') {
  r.resize(m?342:1312,m?112:72);d.put(r,'Rule',0,0,m?342:1312,1);
  d.put(r,'Project note',0,24,m?342:740,m?48:24);
  d.put(r,'Preview note',m?0:952,m?76:24,m?342:360,24);
 }
};
d.mains = () => {
 if(penpot.currentPage.name!=='Design system')throw Error('Open Design system');
 const comps=penpot.library.local.components;
 for(const [name,key] of [['Hero copy','Hero copy'],['Section header','Releases header'],['Release content','Release content'],['Footer','Footer']]) {
  const r=comps.find(c=>c.name===name).mainInstance();d.copy(r,key);d.geometry(r,name);
 }
 const card=comps.find(c=>c.name==='Release card').mainInstance();
 for(const n of ['Status','Card body'])d.find(card,n).characters=d.content['Release content'][n];
 return 'Five shared component mains updated from the owner desktop copy';
};
d.board = id => {
 if(penpot.currentPage.name!=='Homepage')throw Error('Open Homepage');
 const b=penpot.currentPage.getShapeById(id),m=b.width===390;
 for(const [name] of Object.entries(d.content))d.copy(d.find(b,name),name);
 for(const name of ['Hero copy','Release content','Footer'])d.geometry(d.find(b,name),name,m);
 d.find(b,'Preview notice').hidden=true;
 if(m) {
  const sp=d.find(b,'SP instrument');sp.y=b.y+416;
  d.put(b,'Releases header',24,904);d.geometry(d.find(b,'Releases header'),'Section header',true);
  d.put(b,'Release content',24,1032);
  d.put(b,'Guides header',24,1344);d.geometry(d.find(b,'Guides header'),'Section header',true);
  const ink=penpot.library.local.colors.find(c=>c.name===(b.name.endsWith('Dark')?'Dark ink':'Ink'));
  for(const name of ['Releases header','Guides header'])d.find(d.find(b,name),'Description').fills=[ink.asFill()];
  b.children.filter(s=>s.name.startsWith('Guide /')).forEach((r,i)=>d.box(r,b,24,1472+i*96));
  d.put(b,'Footer',24,1792);b.resize(390,1904);
 } else {
  d.put(b,'Footer',64,1520);b.resize(1440,1592);
 }
 b.setPluginData('opensp-layout',JSON.stringify({mobile:m,dark:b.name.endsWith('Dark'),linked:true,revision:'2026-09-28-owner-copy'}));
 return {board:b.name,size:[b.width,b.height]};
};
d.rounded = value => JSON.stringify(JSON.parse(value),(_key,v)=>typeof v==='number'?Math.round(v*1e6)/1e6:v);
d.verify = id => d.boards.filter(b=>b.id===id).map(b => {
 const mismatches=[];
 for(const [role,fields] of Object.entries(d.content))for(const [name,value] of Object.entries(fields)) {
  if(d.norm(d.find(d.find(b,role),name).characters)!==d.norm(value))mismatches.push(role+'/'+name);
 }
 const ui=b.children.filter(s=>s.name!=='SP instrument').flatMap(d.visible);
 const overflows=ui.filter(s=>s.type==='text').filter(s=>{const q=s.textBounds;return q&&(q.x<s.x-2||q.y<s.y-2||q.x+q.width>s.x+s.width+2||q.y+q.height>s.y+s.height+2);}).map(s=>({name:s.name,id:s.id,frame:[s.x,s.y,s.width,s.height],bounds:s.textBounds}));
 return {board:b.name,copyMismatches:mismatches,spUnchanged:d.rounded(d.freeze(d.find(b,'SP instrument')))===d.rounded(d.before[b.id].sp),navigationUnchanged:d.freeze(d.find(b,'Navigation'))===d.before[b.id].nav,linkedRoots:b.children.filter(s=>!s.hidden&&s.isComponentInstance()).length,nestedSpHeads:d.visible(d.find(b,'SP instrument')).filter(s=>s.id!==d.find(b,'SP instrument').id&&s.isComponentHead()).length,overflows};
});
return {capturedFrom:d.source.name,content:d.content,boards:d.boards.map(b=>({id:b.id,name:b.name}))};
