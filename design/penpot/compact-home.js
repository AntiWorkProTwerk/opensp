// Load definitions, then run mains(), board(id), scaleBatch() in separate calls.
// Geometry is shared by mains and linked copies. Do not touch archived SVG trees.
if(penpot.currentFile?.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const d=storage.compact={queue:[]};
d.find=(root,name)=>{const s=penpotUtils.findShape(s=>s.name===name||s.name==='OpenSP / '+name,root);if(!s)throw Error('Missing '+name);return s;};
d.box=(s,parent,x,y,w,h)=>{if(w!==undefined)s.resize(w,h);s.x=parent.x+x;s.y=parent.y+y;return s;};
d.put=(root,name,x,y,w,h)=>d.box(d.find(root,name),root,x,y,w,h);
d.geometry=(root,role,m=false)=>{
 if(role==='Navigation'){
  root.resize(m?342:1312,m?104:80);d.put(root,'Wordmark',0,m?14:20);
  d.put(root,'Primary links',m?76:561,m?54:16);d.put(root,'Theme selector',m?214:1184,m?15:20);
  d.put(root,'Rule',0,m?103:79,m?342:1312,1);
 }else if(role==='Hero copy'){
  root.resize(m?342:760,m?172:224);d.put(root,'Eyebrow',0,0,m?342:740,m?20:24);
  d.put(root,'Title',m?-1:-2,m?32:36,m?342:740,m?64:92);
  d.put(root,'Subtitle',0,m?108:136,m?342:570,m?64:72);
 }else if(role==='Section header'){
  root.resize(m?342:1312,m?60:88);d.put(root,'Rule',0,0,m?342:1312,1);
  d.put(root,'Numbered label',0,m?18:30);d.put(root,'Description',216,24,1032,48);
  d.find(root,'Description').hidden=m;d.put(root,'Disclosure indicator',m?310:1276,m?8:20,m?32:36,44);
 }else if(role==='Release card'){
  const w=m?342:528,h=m?104:112;root.resize(w,h);d.put(root,'Card surface',0,0,w,h);
  d.put(root,'Status',20,14,w-40,24);d.put(root,'Card body',20,m?44:48,w-40,48);
 }else if(role==='Release content'){
  root.resize(m?342:1096,m?232:112);d.put(root,'Body',0,0,m?342:528,m?120:112);
  const card=d.put(root,'Release card',m?0:568,m?128:0);d.geometry(card,'Release card',m);
 }else if(role==='Guide row'){
  const tall=m&&root.name==='Guide / Reading the project',h=m?(tall?112:88):72;
  root.resize(m?342:1096,h);d.put(root,'Rule',0,0,m?342:1096,1);
  d.put(root,'Index',0,24,32,24);d.find(root,'Index').hidden=m;
  d.put(root,'Title',m?0:48,m?14:18,m?310:488,32);
  d.put(root,'Description',m?0:568,m?46:23,m?310:488,m?48:28);
  d.put(root,'Link arrow',m?314:1072,m?16:18,m?28:24,32);
 }else if(role==='Preview notice'){
  root.resize(m?342:1096,m?56:40);d.put(root,'Notice',0,0,m?342:1096,m?56:40);
 }else if(role==='Footer'){
  root.resize(m?342:1312,m?80:72);d.put(root,'Rule',0,0,m?342:1312,1);
  d.put(root,'Project note',0,24,m?342:740,24);
  d.put(root,'Preview note',m?0:952,m?48:24,m?342:360,24);
 }
};
d.mains=()=>{
 if(penpot.currentPage.name!=='Design system')throw Error('Open Design system');
 const roles=['Navigation','Hero copy','Section header','Release card','Release content','Guide row','Preview notice','Footer'];
 for(const role of roles){const c=penpot.library.local.components.find(c=>c.name===role);d.geometry(c.mainInstance(),role);}
 return {mainsUpdated:roles};
};
d.board=id=>{
 if(penpot.currentPage.name!=='Homepage')throw Error('Open Homepage');
 const b=penpot.currentPage.getShapeById(id),m=b.width===390,margin=m?24:64;
 if(!b.name.startsWith('Homepage /'))throw Error('Not a homepage');
 b.resize(m?390:1440,m?1456:1184);
 const slots={'Navigation':[margin,0,'Navigation'],'Hero copy':[margin,m?132:144,'Hero copy'],
  'Releases header':[margin,m?608:488,'Section header'],'Release content':[m?24:280,m?668:576,'Release content'],
  'Guides header':[margin,m?924:720,'Section header'],'Preview notice':[m?24:280,m?1296:1048,'Preview notice'],
  'Footer':[margin,m?1376:1112,'Footer']};
 for(const [name,[x,y,role]] of Object.entries(slots)){const root=d.find(b,name);d.box(root,b,x,y);d.geometry(root,role,m);}
 b.children.filter(s=>s.name.startsWith('Guide /')).forEach((r,i)=>{d.box(r,b,m?24:280,(m?984:808)+i*(m?88:72));d.geometry(r,'Guide row',m);});
 const sp=d.find(b,'SP instrument');d.box(sp,b,m?105:1048,m?320:112);
 const k=(m?180:240)/sp.width,ox=sp.x,oy=sp.y;
 const visible=penpotUtils.findShapes(s=>{let p=s;while(p&&p.id!==sp.id){if(p.hidden||p.name.startsWith('Archived'))return false;p=p.parent;}return s.id!==sp.id;},sp);
 d.queue.push(...[sp,...visible].map(s=>({s,x:ox+(s.x-ox)*k,y:oy+(s.y-oy)*k,w:s.width*k,h:s.height*k,font:s.type==='text'?Number(s.fontSize)*k:null})));
 b.setPluginData('opensp-layout',JSON.stringify({mobile:m,dark:b.name.endsWith('Dark'),linked:true,revision:'2026-09-28-compact-grid'}));
 return {board:b.name,queued:d.queue.length};
};
d.scaleBatch=()=>{for(const a of d.queue.splice(0,32)){a.s.resize(a.w,a.h);a.s.x=a.x;a.s.y=a.y;if(a.font)a.s.fontSize=String(a.font);}return {remaining:d.queue.length};};
return {loaded:true};
