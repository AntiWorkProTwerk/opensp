// Load helpers once, then call named steps separately through the MCP client.
// Deliberately bounded operations: do not batch the whole page or archived SVGs.
if(penpot.currentFile?.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const lib=penpot.library.local;
const d=storage.home={
 colors:Object.fromEntries(lib.colors.map(x=>[x.name,x])),
 type:Object.fromEntries(lib.typographies.map(x=>[x.name,x])),
 c:Object.fromEntries(lib.components.map(x=>[x.name,x]))
};
d.find=(root,name)=>{const s=penpotUtils.findShape(s=>s.name===name,root);if(!s)throw Error('Missing '+name);return s;};
d.put=(root,name,x,y,w,h,style)=>{const s=d.find(root,name);if(w!==undefined)s.resize(w,h);s.x=root.x+x;s.y=root.y+y;if(style){s.applyTypography(d.type[style]);s.lineHeight=d.type[style].lineHeight;}return s;};
d.text=(root,name,value,x,y,w,h,style='Label',color='Ink')=>{const s=penpot.createText(value);s.name=name;s.applyTypography(d.type[style]);s.lineHeight=d.type[style].lineHeight;s.resize(w,h);s.fills=[d.colors[color].asFill()];root.appendChild(s);s.x=root.x+x;s.y=root.y+y;return s;};
d.inst=(name,parent,x,y,label=name)=>{const s=d.c[name].instance();s.name=label;parent.appendChild(s);s.x=parent.x+x;s.y=parent.y+y;return s;};
d.board=(name,x,y,w,h,dark=false)=>{const b=penpot.createBoard();b.name=name;b.resize(w,h);b.x=x;b.y=y;b.fills=[d.colors[dark?'Dark paper':'Paper'].asFill()];return b;};
d.visible=root=>penpotUtils.findShapes(s=>{let p=s;while(p&&p.id!==root.id){if(p.hidden||p.name.startsWith('Archived'))return false;p=p.parent;}return s.id!==root.id;},root);
d.styles=()=>{
 const nav=d.type.Navigation,f=penpot.fonts.all.find(f=>f.name==='Cousine');nav.setFont(f,f.variants.find(v=>v.fontWeight==='400'&&v.fontStyle==='normal'));nav.fontSize='14';nav.lineHeight='1.5';nav.letterSpacing='0.3';
 for(const [name,size,leading,tracking] of [['Hero',76,1.08,-1.9],['Hero mobile',48,1.12,-1.2],['Heading',32,1.25,-.64],['Intro',22,1.45,0],['Caption mobile',16,1.5,0],['Label',13,1.54,.26]]){const t=d.type[name];t.fontSize=String(size);t.lineHeight=String(leading);t.letterSpacing=String(tracking);}
 return 'Shared typography updated';
};
d.mainsTop=()=>{
 if(penpot.currentPage.name!=='Design system')throw Error('Open Design system');
 let b=d.c['Primary links'].mainInstance();b.resize(190,44);d.put(b,'Releases link',0,12,96,24,'Navigation');d.put(b,'Guides link',132,12,58,24,'Navigation');
 b=d.c.Navigation.mainInstance();b.resize(1312,88);d.put(b,'Primary links',561,20);d.put(b,'Rule',0,87,1312,1);d.put(b,'Wordmark',0,24);d.put(b,'Theme selector',1184,24);
 b=d.c['Hero copy'].mainInstance();b.resize(760,240);d.put(b,'Eyebrow',0,0,740,24,'Label');d.put(b,'Title',-2,44,740,92,'Hero');d.put(b,'Subtitle',0,160,570,72,'Intro');
 return 'Navigation and hero mains updated';
};
d.mainsContent=()=>{
 if(penpot.currentPage.name!=='Design system')throw Error('Open Design system');
 let b=d.c['Section header'].mainInstance();b.resize(1312,104);d.put(b,'Numbered label',0,34);d.put(b,'Description',320,26,912,56,'Heading');d.put(b,'Disclosure indicator',1276,25,36,48,'Heading');
 b=d.c['Release content'].mainInstance();b.resize(992,208);d.put(b,'Body',0,0,850,72,'Body');d.put(b,'Release card',0,96,992,88);
 b=d.c['Release card'].mainInstance();b.resize(992,88);d.put(b,'Card surface',0,0,992,88);d.put(b,'Status',24,14,944,24,'Label');d.put(b,'Card body',24,44,944,28,'Caption');
 b=d.c['Guide row'].mainInstance();b.resize(992,88);d.put(b,'Rule',0,0,992,1);d.put(b,'Index',0,22,40,24,'Label');d.put(b,'Title',56,14,880,30,'Intro');d.put(b,'Description',56,48,880,26,'Caption');d.put(b,'Link arrow',960,18,32,36,'Intro');
 return 'Section, release and guide mains updated';
};
d.startBoard=(mobile,dark)=>{
 if(penpot.currentPage.name!=='Homepage')throw Error('Open Homepage');
 const name=`Homepage / ${mobile?'Mobile':'Desktop'} / ${dark?'Dark':'Light'}`;
 if(penpot.root.children.some(s=>s.name===name))throw Error('Already exists '+name);
 const b=d.board(name,(dark?1980:0)+(mobile?1500:0),0,mobile?390:1440,mobile?1624:1450,dark);
 b.setPluginData('opensp-layout',JSON.stringify({mobile,dark,linked:true,revision:'2026-09-28-type-spacing'}));
 d.active=b;d.mobile=mobile;d.isDark=dark;
 return {id:b.id,name};
};
d.top=()=>{
 const b=d.active,m=d.mobile,margin=m?24:64;
 const nav=d.inst('Navigation',b,margin,0);
 if(m){nav.resize(342,116);d.put(nav,'Wordmark',0,16);d.put(nav,'Theme selector',214,17);d.put(nav,'Primary links',76,66);d.put(nav,'Rule',0,115,342,1);}
 const hero=d.inst('Hero copy',b,margin,m?148:188);
 if(m){hero.resize(342,196);d.put(hero,'Eyebrow',0,0,342,22);d.find(hero,'Eyebrow').fontSize='12';d.put(hero,'Title',-1,36,342,64,'Hero mobile');d.put(hero,'Subtitle',0,120,342,64,'Body mobile');}
 const sp=d.inst('Instrument',b,m?90:956,m?372:136,'SP instrument');
 d.sp=sp;
 return {board:b.id,instrument:sp.id,visibleParts:d.visible(sp).length};
};
d.beginScale=()=>{
 const s=d.sp,k=d.mobile?.525:.70,ox=s.x,oy=s.y;
 d.scaleQueue=[s,...d.visible(s)].map(t=>({s:t,x:ox+(t.x-ox)*k,y:oy+(t.y-oy)*k,w:t.width*k,h:t.height*k,font:t.type==='text'?Number(t.fontSize)*k:null}));
 return d.scaleQueue.length;
};
d.scaleBatch=()=>{
 for(const a of d.scaleQueue.splice(0,16)){a.s.resize(a.w,a.h);a.s.x=a.x;a.s.y=a.y;if(a.font)a.s.fontSize=String(a.font);}
 return {remaining:d.scaleQueue.length};
};
d.content=()=>{
 const b=d.active,m=d.mobile,margin=m?24:64,col=m?24:384;
 const header=d.inst('Section header',b,margin,m?716:600,'Releases header');
 const release=d.inst('Release content',b,col,m?792:704,'Release content');
 const guide=d.inst('Section header',b,margin,m?1040:944,'Guides header');
 d.find(guide,'Label').characters='GUIDES';d.find(guide,'Description').characters='Understand it, one step at a time.';
 if(m){
  for(const h of [header,guide]){h.resize(342,76);d.put(h,'Rule',0,0,342,1);d.put(h,'Numbered label',0,24);d.find(h,'Description').hidden=true;d.put(h,'Disclosure indicator',310,16,32,44,'Heading mobile');}
  release.resize(342,264);d.put(release,'Body',0,0,342,144,'Body mobile');d.find(release,'Body').characters='Builds, release notes, and compatibility information. A clear place to see what is ready and what is experimental.';
  const card=d.put(release,'Release card',0,120,342,104);d.put(card,'Card surface',0,0,342,104);d.put(card,'Status',20,14,302,24);d.put(card,'Card body',20,44,302,48,'Caption');
 }
 return 'Section instances added';
};
d.rows=()=>{
 const b=d.active,m=d.mobile,col=m?24:384;
 const rows=[['Meet the instrument','A visual map of the surface.'],['From a pad press to an event','Follow an input through the diagram.'],['Reading the project','How to read observations and open questions.']];
 rows.forEach(([title,desc],i)=>{
  const r=d.inst('Guide row',b,col,(m?1116:1048)+i*(m?96:88),'Guide / '+title);d.find(r,'Title').characters=title;d.find(r,'Description').characters=desc;d.find(r,'Index').characters=String(i+1).padStart(2,'0');
  if(m){r.resize(342,96);d.put(r,'Rule',0,0,342,1);d.find(r,'Index').hidden=true;d.put(r,'Title',0,14,310,30,'Body mobile');d.find(r,'Title').fontSize='20';d.put(r,'Description',0,46,310,48,'Caption mobile');d.put(r,'Link arrow',314,16,28,28,'Body mobile');}
 });
 const foot=d.inst('Footer',b,m?24:64,m?1512:1380);
 if(m){foot.resize(342,84);d.put(foot,'Rule',0,0,342,1);d.put(foot,'Project note',0,24,342,24);d.find(foot,'Project note').characters='OPENSP / INDEPENDENT PROJECT';d.find(foot,'Project note').fontSize='12';d.put(foot,'Preview note',0,50,342,24);d.find(foot,'Preview note').align='left';d.find(foot,'Preview note').fontSize='12';}
 const notice=d.inst('Preview notice',b,col,m?1432:1336);
 if(m){notice.resize(342,56);d.put(notice,'Notice',0,0,342,56);}
 return 'Rows and footer added';
};
d.beginDark=()=>{d.darkQueue=[d.active,...d.visible(d.active)];return d.darkQueue.length;};
d.darkBatch=()=>{
 const map={Paper:'Dark paper',Ink:'Dark ink',Muted:'Dark muted',Line:'Dark line',Surface:'Dark surface'};
 for(const s of d.darkQueue.splice(0,24)){
  if(s.name.startsWith('OLED'))continue;
  if(s.fills?.length)s.fills=s.fills.map(f=>{const n=Object.keys(map).find(n=>f.fillColorRefId===d.colors[n].id);return n?{...f,...d.colors[map[n]].asFill()}:f;});
  if(s.strokes?.length)s.strokes=s.strokes.map(f=>{const n=Object.keys(map).find(n=>f.strokeColorRefId===d.colors[n].id);return n?{...f,...d.colors[map[n]].asStroke(),strokeWidth:f.strokeWidth}:f;});
 }
 return {remaining:d.darkQueue.length};
};
return {loaded:true,components:Object.keys(d.c).length};
