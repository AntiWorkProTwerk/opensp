// Responsive overrides for linked Guide row instances; safe to reapply.
if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3'||penpot.currentPage.name!=='Guide index')throw Error('Open the OpenSP Guide index');
const colors=Object.fromEntries(penpot.library.local.colors.map(c=>[c.name,c]));
const typography=Object.fromEntries(penpot.library.local.typographies.map(t=>[t.name,t]));
const find=(parent,name)=>{const result=penpotUtils.findShape(s=>s.name===name,parent);if(!result)throw Error('Missing '+name);return result;};
const put=(shape,parent,x,y,w,h)=>{if(w!==undefined)shape.resize(w,h);shape.x=parent.x+x;shape.y=parent.y+y;};
const height=(value,width,size,leading)=>{const cap=Math.floor(width/(size*.51));let lines=0;for(const paragraph of value.split('\n')){let used=0;for(const word of paragraph.split(' ')){if(used&&used+word.length+1>cap){lines++;used=word.length;}else used+=(used?1:0)+word.length;}lines++;}return Math.ceil(lines*size*leading)+6;};
const results=[];
const firstDescription=__FIRST_INDEX_DESCRIPTION__;
for(const board of penpot.root.children.filter(s=>s.type==='board'&&s.getPluginData('opensp-guide-index'))){
 const variant=JSON.parse(board.getPluginData('opensp-guide-index'));
 const rows=board.children.filter(s=>s.name.startsWith('Guide /')).sort((a,b)=>a.y-b.y);
 if(rows.length!==17||rows.some(row=>row.component()?.name!=='Guide row'))throw Error('Expected seventeen linked guide rows');
 const first=rows[0],firstText=find(first,'Description');
 if(first.name!=='Guide / first-change')throw Error('Unexpected first guide');
 if(firstText.characters!==firstDescription){
  firstText.characters=firstDescription;
  const oldHeight=first.height,newHeight=height(firstDescription,firstText.width,Number(firstText.fontSize),Number(firstText.lineHeight));
  firstText.resize(firstText.width,newHeight);
  first.resize(first.width,find(first,'Title').height+newHeight+52);
  const delta=first.height-oldHeight;
  if(!variant.mobile){for(const item of board.children)if(item.id!==first.id&&item.y>=first.y+oldHeight-1)item.y+=delta;board.resize(board.width,board.height+delta);}
 }
 if(!variant.mobile)continue;
 let home=board.children.find(s=>s.name==='Index home link');
 if(!home){home=penpot.createText('Back to OpenSP');home.name='Index home link';board.appendChild(home);home.applyTypography(typography.Navigation);home.lineHeight=typography.Navigation.lineHeight;home.growType='fixed';}
 home.fills=[colors[variant.dark?'Dark ink':'Ink'].asFill()];
 put(home,board,24,140,240,32);
 const intro=find(board,'Article introduction');
 const title=find(intro,'Article title'),description=find(intro,'Description');
 put(intro,board,24,217);
 put(description,intro,0,title.height+20);
 intro.resize(342,title.height+20+description.height);
 let y=217+intro.height+32;
 for(const row of rows){
  find(row,'Index').hidden=true;
  const title=find(row,'Title'),description=find(row,'Description');
  title.fontSize='20';title.lineHeight='1.4';
  description.fontSize='16';description.lineHeight='1.5';
  put(row,board,24,y);
  put(find(row,'Rule'),row,0,0,342,1);
  put(title,row,0,24,310,height(title.characters,310,20,1.4));
  put(description,row,0,28+title.height,310,height(description.characters,310,16,1.5));
  put(find(row,'Link arrow'),row,318,28,24,24);
  row.resize(342,title.height+description.height+52);
  y+=row.height;
 }
 let rule=board.children.find(s=>s.name==='Index final rule');
 if(!rule){rule=penpot.createRectangle();rule.name='Index final rule';board.appendChild(rule);rule.strokes=[];}
 rule.fills=[colors[variant.dark?'Dark line':'Line'].asFill()];
 put(rule,board,24,y,342,1);
 const note=find(board,'Index scope');put(note,board,24,y+40);
 const footer=find(board,'Footer');put(footer,board,24,y+40+note.height+56);
 board.resize(390,footer.y-board.y+footer.height+32);
 results.push({id:board.id,name:board.name,height:board.height,rows:rows.length});
}
return results;
