// Corrections from the independent finish review. Only guide-owned mains/boards.
const d=storage.guide;
d.reviewMain=()=>{if(penpot.currentPage.name!=='Guide components')throw Error('Open Guide components');const title=d.find(d.main('Article introduction'),'Article title');title.characters='Our first change\non the SP.';title.resize(620,136);d.find(d.main('First change instrument'),'Observation label').hidden=true;return true;};
d.reviewLight=mobile=>{
 const b=penpot.root.children.find(s=>s.name===`First change / ${mobile?'Mobile':'Desktop'} / Light`);if(!b)throw Error('Missing guide');d.active=b;d.mobile=mobile;d.isDark=false;
 const intro=d.find(b,'Article introduction'),title=d.find(intro,'Article title'),hero=d.find(b,'First change instrument');title.characters='Our first change\non the SP.';
 d.find(hero,'Observation label').hidden=true;
 if(mobile){d.put(title,intro,0,0,342,108);d.put(d.find(intro,'Description'),intro,0,136,342,144);d.put(d.find(intro,'Period'),intro,0,280,342,24);intro.resize(342,312);hero.y=intro.y+intro.height+40;const contents=d.find(b,'Contents mobile');contents.characters='ON THIS PAGE';if(!b.children.some(s=>s.name==='Contents plus horizontal')){d.rect(b,'Contents plus horizontal',350,190,12,1,'Ink');d.rect(b,'Contents plus vertical',355.5,184.5,1,12,'Ink');}}
 else title.resize(620,136);
 d.y=hero.y-b.y+hero.height+(mobile?64:80);return {id:b.id,y:d.y};
};
d.removeStaleDark=()=>{
 const ids=['88ef66de-c84d-8075-8008-b5f5ff0230cd','88ef66de-c84d-8075-8008-b5f616fc7218'];
 const removed=[];for(const id of ids){const b=penpot.root.children.find(s=>s.id===id);if(b){if(!/^First change \/ (Desktop|Mobile) \/ Dark$/.test(b.name))throw Error('Unexpected board');removed.push({id,name:b.name});b.remove();}}return removed;
};
return {loaded:true};
