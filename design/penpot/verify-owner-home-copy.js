// Read-only, one board per call to avoid starving the browser's MCP heartbeat.
const d=storage.ownerCopy;
if(!d)throw Error('Owner-copy capture is unavailable');
d.rounded=value=>JSON.stringify(JSON.parse(value),(_k,v)=>typeof v==='number'?Math.round(v*1e6)/1e6:v);
d.verify=id=>{
 const b=penpot.currentPage.getShapeById(id),sp=d.find(b,'SP instrument'),mismatches=[];
 for(const [role,fields] of Object.entries(d.content))for(const [name,value] of Object.entries(fields)){
  if(d.norm(d.find(d.find(b,role),name).characters)!==d.norm(value))mismatches.push(role+'/'+name);
 }
 const ui=b.children.filter(s=>s.name!=='SP instrument').flatMap(d.visible);
 const overflow=ui.filter(s=>s.type==='text').filter(s=>{const q=s.textBounds;return q&&(q.x<s.x-2||q.y<s.y-2||q.x+q.width>s.x+s.width+2||q.y+q.height>s.y+s.height+2);}).map(s=>s.name);
 return {board:b.name,size:[b.width,b.height],copyMismatches:mismatches,overflow,spUnchanged:d.rounded(d.freeze(sp))===d.rounded(d.before[id].sp),navigationUnchanged:d.freeze(d.find(b,'Navigation'))===d.before[id].nav,linkedVisibleRoots:b.children.filter(s=>!s.hidden&&s.isComponentInstance()).length,nestedSpHeads:d.visible(sp).filter(s=>s.id!==sp.id&&s.isComponentHead()).length,headings:['Releases header','Guides header'].map(n=>{const t=d.find(d.find(b,n),'Description');return {text:t.characters,visible:!t.hidden,fill:t.fills};})};
};
return 'Read-only per-board verification loaded';
