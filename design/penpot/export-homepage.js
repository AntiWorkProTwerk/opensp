// Read the approved white desktop board. Do not traverse the nested SP artwork.
if(penpot.currentPage.name!=='Homepage')throw Error('Open Homepage first');
const board=penpot.currentPage.getShapeById('ab2e7837-e348-80fc-8008-b5929c5d499d');
function walk(s){return s.hidden||(s.isComponentHead()&&s.component()?.name==='Instrument')?[]:[s,...(s.children||[]).flatMap(walk)];}
const all=walk(board),text=(name,parent)=>{const found=all.find(s=>s.type==='text'&&s.name===name&&(!parent||s.parent.name===parent));if(!found)throw Error('Missing '+parent+'/'+name);return found.characters;};
const paragraphs=text('Subtitle','Hero copy').split(/\n\s*\n/).map(t=>t.replace(/\s+/g,' ').trim());
if(paragraphs.length!==2)throw Error('Review hero paragraph mapping');
return {
  source:{fileId:penpot.currentFile.id,pageId:penpot.currentPage.id,boardId:board.id},
  heroIntroLines:text('Subtitle','Hero copy').split(/\n\s*\n/)[0].split('\n'),
  copy:{eyebrow:text('Eyebrow','Hero copy'),title:text('Title','Hero copy'),intro:paragraphs[0],repository:paragraphs[1],releasesHeading:text('Description','Releases header'),releaseBody:text('Body','Release content'),releaseStatus:text('Status','Release card'),releasePlaceholder:text('Card body','Release card'),guidesHeading:text('Description','Guides header'),footerProject:text('Project note','Footer'),footerPage:text('Preview note','Footer')},
  guides:board.children.filter(s=>!s.hidden&&s.name.startsWith('Guide / ')).map(s=>({title:text('Title',s.name),description:text('Description',s.name)})),
  websiteComponents:board.children.filter(s=>!s.hidden&&s.isComponentHead()).map(s=>({name:s.name,componentId:s.component()?.id,x:s.x-board.x,y:s.y-board.y,width:s.width,height:s.height}))
};
