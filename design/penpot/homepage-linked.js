if(penpot.currentPage.name!=='Homepage')throw new Error('Open Homepage first');
if(penpot.root.children.some(s=>s.name==='Homepage / Desktop / Light'))throw new Error('Homepage already created');
const d=storage.ds,c=d.components;
const old=penpot.root.children.find(s=>s.id==='687117da-a825-80bd-8008-b56969177ccb');old.name='Archive / Imported homepage study';old.hidden=true;
const check=penpot.root.children.find(s=>s.name==='Typography compatibility check');if(check)check.remove();
function find(root,name){const s=penpotUtils.findShape(s=>s.name===name,root);if(!s)throw new Error(name);return s;}
function put(root,name,x,y,w,h,style){const s=find(root,name);if(w!==undefined)s.resize(w,h);s.x=root.x+x;s.y=root.y+y;if(style)s.applyTypography(d.type[style]);return s;}
function scaled(s,w,h){const ow=s.width,oh=s.height;const all=penpotUtils.findShapes(()=>true,s).map(a=>({s:a,x:(a.x-s.x)/ow,y:(a.y-s.y)/oh,w:a.width/ow,h:a.height/oh,font:a.type==='text'?Number(a.fontSize):null}));s.resize(w,h);for(const a of all){a.s.resize(a.w*w,a.h*h);a.s.x=s.x+a.x*w;a.s.y=s.y+a.y*h;if(a.font)a.s.fontSize=String(a.font*w/ow);}return s;}
function mobileHeader(s){s.resize(346,80);put(s,'Rule',0,0,346,1);put(s,'Numbered label',0,22);find(s,'Description').hidden=true;put(s,'Disclosure indicator',310,16,36,45,'Heading mobile');}
function mobileNav(s){s.resize(346,118);put(s,'Wordmark',0,14);put(s,'Primary links',62,62);put(s,'Theme selector',218,17);put(s,'Rule',0,117,346,1);}
function mobileHero(s){s.resize(346,210);put(s,'Eyebrow',0,0,346,24);find(s,'Eyebrow').fontSize='11';put(s,'Title',0,34,346,64,'Hero mobile');put(s,'Subtitle',0,128,346,80,'Body mobile');}
function mobileRelease(s){s.resize(346,230);put(s,'Body',0,0,346,85,'Body mobile');find(s,'Body').characters='Builds, release notes, and\ncompatibility information.';const card=put(s,'Release card',0,116,346,106);put(card,'Card surface',0,0,346,106);put(card,'Status',17,14,312,26);put(card,'Card body',17,45,312,56,'Caption');find(card,'Card body').characters='Verified release details\nwill appear here.';}
function mobileRow(s){s.resize(346,91);put(s,'Rule',0,0,346,1);find(s,'Index').hidden=true;put(s,'Title',0,12,312,31,'Body mobile');find(s,'Title').fontSize='19';put(s,'Description',0,45,320,30,'Caption mobile');put(s,'Link arrow',320,13,26,35,'Body mobile');}
function mobileFooter(s){s.resize(346,84);put(s,'Rule',0,0,346,1);put(s,'Project note',0,24,346,25);find(s,'Project note').characters='OPENSP / INDEPENDENT PROJECT';find(s,'Project note').fontSize='11';put(s,'Preview note',0,50,346,25);find(s,'Preview note').align='left';find(s,'Preview note').fontSize='11';}
const rows=[['Meet the instrument','A visual map of the surface.'],['From a pad press to an event','Follow an input through the diagram.'],['Reading the project','Observations and open questions.']];
d.homeBoards=[];
for(const [mobile,dark,x] of [[false,false,0],[true,false,1500],[false,true,1980],[true,true,3480]]){
 const b=d.board(`Homepage / ${mobile?'Mobile':'Desktop'} / ${dark?'Dark':'Light'}`,x,0,mobile?390:1440,mobile?1600:1440,'Paper');d.homeBoards.push(b.id);
 const margin=mobile?22:64;
 const nav=d.instance(c.Navigation,b,margin,0,'Navigation');if(mobile)mobileNav(nav);
 const hero=d.instance(c['Hero copy'],b,margin,mobile?140:195,'Hero copy');if(mobile)mobileHero(hero);
 const sp=d.instance(d.sp.Instrument,b,mobile?92:961,mobile?372:143,'SP instrument');scaled(sp,mobile?206:280,mobile?293.55:399);
 const release=d.instance(c['Section header'],b,margin,mobile?708:597,'Releases header');if(mobile)mobileHeader(release);
 const content=d.instance(c['Release content'],b,mobile?22:424,mobile?850:703,'Release content');if(mobile)mobileRelease(content);
 const guides=d.instance(c['Section header'],b,margin,mobile?1080:931,'Guides header');d.override(guides,'Label','02 / GUIDES');d.override(guides,'Description','Understand it, one step at a time.');if(mobile)mobileHeader(guides);
 rows.forEach(([title,description],i)=>{const row=d.instance(c['Guide row'],b,mobile?22:424,(mobile?1165:1040)+i*(mobile?91:87),'Guide / '+title);d.override(row,'Title',title);d.override(row,'Description',description);d.override(row,'Index',String(i+1).padStart(2,'0'));if(mobile)mobileRow(row);});
 const footer=d.instance(c.Footer,b,margin,mobile?1510:1380,'Footer');if(mobile)mobileFooter(footer);
 if(dark){d.dark(b);d.override(nav,'Theme label','DARK / ●');}
 b.setPluginData('opensp-layout',JSON.stringify({viewport:mobile?'mobile':'desktop',theme:dark?'dark':'light',componentLinked:true}));
}
penpot.selection=[];penpot.viewport.zoomIntoView(d.homeBoards.map(id=>penpotUtils.findShapeById(id)));
return {boards:d.homeBoards,components:penpot.library.local.components.length};
