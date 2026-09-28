// Restore only the earlier stacked sections. Keep the compact hero and navigation.
// Load on Homepage before editing mains; call mains(), then board(id) separately.
if(penpot.currentFile?.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3'||penpot.currentPage.name!=='Homepage')throw Error('Open OpenSP Homepage');
const d=storage.sections={before:{}};
d.find=(r,n)=>{const s=penpotUtils.findShape(s=>s.name===n,r);if(!s)throw Error('Missing '+n);return s;};
d.box=(s,p,x,y,w,h)=>{if(w!==undefined)s.resize(w,h);s.x=p.x+x;s.y=p.y+y;return s;};
d.put=(r,n,x,y,w,h)=>d.box(d.find(r,n),r,x,y,w,h);
d.freeze=r=>[r.id,r.x,r.y,r.width,r.height,r.type==='text'?[r.characters,r.fontId,r.fontSize,r.lineHeight,r.letterSpacing]:null,r.fills,(r.children||[]).filter(s=>!s.hidden).map(d.freeze)];
d.protected=b=>JSON.stringify(b.children.filter(s=>['Navigation','Hero copy','SP instrument'].includes(s.name)).map(d.freeze));
for(const b of penpot.currentPage.root.children.filter(s=>!s.hidden&&s.name.startsWith('Homepage /')))d.before[b.id]=d.protected(b);
d.geometry=(r,role,m=false)=>{
 if(role==='Section header'){
  r.resize(m?342:1312,m?76:104);d.put(r,'Rule',0,0,m?342:1312,1);d.put(r,'Numbered label',0,m?24:34);
  d.put(r,'Description',320,26,912,56);d.find(r,'Description').hidden=m;
  d.put(r,'Disclosure indicator',m?310:1276,m?16:25,m?32:36,m?44:48);
 }else if(role==='Release card'){
  const w=m?342:992,h=m?104:88;r.resize(w,h);d.put(r,'Card surface',0,0,w,h);
  d.put(r,'Status',m?20:24,14,w-(m?40:48),24);d.put(r,'Card body',m?20:24,44,w-(m?40:48),m?48:28);
 }else if(role==='Release content'){
  r.resize(m?342:992,m?224:208);d.put(r,'Body',0,0,m?342:850,m?144:72);
  const card=d.put(r,'Release card',0,m?120:96);d.geometry(card,'Release card',m);
 }else if(role==='Guide row'){
  r.resize(m?342:992,m?96:88);d.put(r,'Rule',0,0,m?342:992,1);d.put(r,'Index',0,22,40,24);d.find(r,'Index').hidden=m;
  d.put(r,'Title',m?0:56,14,m?310:880,30);d.put(r,'Description',m?0:56,m?46:48,m?310:880,m?48:26);
  d.put(r,'Link arrow',m?314:960,m?16:18,m?28:32,m?28:36);
 }
};
d.mains=()=>{
 if(penpot.currentPage.name!=='Design system')throw Error('Open Design system');
 for(const n of ['Section header','Release card','Release content','Guide row'])d.geometry(penpot.library.local.components.find(c=>c.name===n).mainInstance(),n);
 return 'Four section mains restored';
};
d.board=id=>{
 if(penpot.currentPage.name!=='Homepage')throw Error('Open Homepage');
 const b=penpot.currentPage.getShapeById(id),m=b.width===390,margin=m?24:64,col=m?24:384;
 const start=d.find(b,'Releases header').y-b.y,guides=start+(m?324:344);
 for(const [name,y,role] of [['Releases header',start,'Section header'],['Release content',start+(m?76:104),'Release content'],['Guides header',guides,'Section header']]){
  const r=d.put(b,name,role==='Release content'?col:margin,y);d.geometry(r,role,m);
 }
 b.children.filter(s=>s.name.startsWith('Guide /')).forEach((r,i)=>{d.box(r,b,col,guides+(m?76:104)+i*(m?96:88));d.geometry(r,'Guide row',m);});
 const notice=d.put(b,'Preview notice',col,guides+392,m?342:992,m?56:48);d.put(notice,'Notice',0,0,m?342:992,m?56:48);
 const footer=d.put(b,'Footer',margin,guides+(m?472:436));b.resize(b.width,footer.y-b.y+footer.height);
 if(d.protected(b)!==d.before[id])throw Error('Protected hero/navigation/instrument changed');
 b.setPluginData('opensp-layout',JSON.stringify({mobile:m,dark:b.name.endsWith('Dark'),linked:true,revision:'2026-09-28-stacked-sections'}));
 return {board:b.name,heroNavigationInstrumentUnchanged:true,height:b.height};
};
return {loaded:true,protectedBoards:Object.keys(d.before).length};
