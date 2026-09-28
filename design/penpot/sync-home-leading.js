// Propagate paragraph leading from shared typography assets. In Penpot 2.18.1,
// applyTypography and LibraryTypography updates left paragraph lineHeight at 1.2.
// Keep font/color references and documented mobile/theme overrides intact.
const d=storage.home;
const roleByComponent={
 'Hero copy':{'Eyebrow':'Label','Title':'Hero','Subtitle':'Intro'},
 'Primary links':{'Releases link':'Navigation','Guides link':'Navigation'},
 'Section header':{'Description':'Heading','Disclosure indicator':'Heading'},
 'Release content':{'Body':'Body'},
 'Release card':{'Status':'Label','Card body':'Caption'},
 'Guide row':{'Index':'Label','Title':'Intro','Description':'Caption'},
 'Preview notice':{'Notice':'Label'},
 'Footer':{'Project note':'Label','Preview note':'Label'}
};
if(penpot.currentPage.name==='Design system'){
 let count=0;
 for(const [component,roles] of Object.entries(roleByComponent)){
  const main=d.c[component].mainInstance();
  for(const [name,role] of Object.entries(roles)){d.find(main,name).lineHeight=d.type[role].lineHeight;count++;}
 }
 return {mainsUpdated:count};
}
if(penpot.currentPage.name!=='Homepage')throw Error('Open Design system or Homepage');
const result=[];
for(const board of penpot.root.children.filter(s=>s.name.startsWith('Homepage /'))){
 const mobile=board.width===390;let count=0;
 // Restrict to UI component subtrees; SP text is miniature diagram lettering.
 for(const root of board.children.filter(s=>s.name!=='SP instrument')){
  for(const s of d.visible(root).filter(s=>s.type==='text')){
   const component=s.component()?.name;
   const role=roleByComponent[component]?.[s.name];
   if(!role)continue;
   let resolved=role;
   if(mobile&&component==='Hero copy'&&s.name==='Subtitle')resolved='Body mobile';
   if(mobile&&component==='Hero copy'&&s.name==='Title')resolved='Hero mobile';
   if(mobile&&component==='Release content'&&s.name==='Body')resolved='Body mobile';
   s.lineHeight=d.type[resolved].lineHeight;
   count++;
  }
 }
 result.push({name:board.name,paragraphsUpdated:count});
}
return result;
