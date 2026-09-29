// Load after first-guide.js. Each operation edits one main, section or layout.
// Browser playback is implemented separately; native figures are final-state posters.
if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const d=storage.guide,scenes=__SCENES__;
if(!d)throw Error('Load first-guide.js first');
const a=d.motion={};
const main=n=>d.c[n].mainInstance();
const child=(b,n)=>b.children.find(s=>s.name===n);
const text=(b,n,value,x,y,w,h,style='Caption',color='Ink')=>{
 let t=child(b,n);if(!t)t=d.txt(b,n,value,x,y,w,h,style,color);
 t.characters=value;t.applyTypography(d.type[style]);t.lineHeight=d.type[style].lineHeight;t.hidden=false;
 return d.put(t,b,x,y,w,h);
};
const rect=(b,n,x,y,w,h,color='Line')=>{let s=child(b,n)||d.rect(b,n,x,y,w,h,color);s.hidden=false;return d.put(s,b,x,y,w,h);};
const instance=(name,b,label)=>child(b,label)||d.inst(name,b,0,0,label);
const hideOld=b=>b.children.filter(s=>s.name.startsWith('Control / ')).forEach(s=>s.hidden=true);
const fittedText=(b,n,value,x,y,w,size,style='Caption',color='Ink')=>{
 const leading=style==='Code'?1.65:1.6;
 const measureWidth=['Code','Label','Navigation'].includes(style)?w*.51/.62:w;
 const t=text(b,n,value,x,y,w,d.height(value,measureWidth,size,leading),style,color);t.fontSize=String(size);t.lineHeight=String(leading);return t;
};
a.prepare=()=>{
 if(penpot.currentPage.name!=='Guide components')throw Error('Open Guide components');
 d.make('Animation timeline',6200,0,448,44,b=>{
  const p=penpot.createPath();p.name='Play arrow';p.d='M 0 0 L 10 7 L 0 14 Z';p.fills=[d.colors.Ink.asFill()];p.strokes=[];d.put(p,b,17,15);
  d.rect(b,'Timeline line',56,21.5,286,1,'Ink');
  const dot=penpot.createEllipse();dot.name='Seek handle';dot.fills=[d.colors.Paper.asFill()];dot.strokes=[{...d.colors.Ink.asStroke(),strokeWidth:1}];d.put(dot,b,336,16,12,12);
  d.txt(b,'Playback time','0:10 / 0:10',360,14,88,22,'Label','Muted').fontSize='11';
 });
 d.make('Reader checkpoint',6200,120,760,360,b=>{
  d.rect(b,'Rule',0,0,760,1);
  d.txt(b,'Checkpoint heading','Follow the reasoning',0,24,760,32,'Intro');
  d.txt(b,'Steps','1. Identify the inputs.\n\n2. Compare the evidence.',0,76,760,100);
  d.txt(b,'Command','python menu-title-check.py',0,190,760,44,'Code');
  d.txt(b,'Download','Download the offline example',0,250,760,30,'Caption');
  d.txt(b,'Checkpoint note','Keep observations separate from assumptions.',0,296,760,64,'Caption','Muted');
 });
 const old=d.c['Figure control'];if(old)old.path='OpenSP / Archive';
 const intro=main('Article introduction');d.find(intro,'Description').characters=d.article.description;
 return {timeline:d.c['Animation timeline'].id,checkpoint:d.c['Reader checkpoint'].id};
};
a.timeline=(b,mode,x,y,w)=>{
 const t=instance('Animation timeline',b,'Animation timeline');d.put(t,b,x,y,w,44);
 d.put(d.find(t,'Play arrow'),t,17,15,10,14);
 d.put(d.find(t,'Timeline line'),t,56,21.5,w-162,1);
 d.put(d.find(t,'Seek handle'),t,w-112,16,12,12);
 const clock=d.find(t,'Playback time');clock.characters=`0:${scenes[mode].duration} / 0:${scenes[mode].duration}`;clock.fontSize=w<400?'10':'11';d.put(clock,t,w-88,14,88,22);
 return t;
};
a.checkpoint=(b,section,w)=>{
 const size=18;
 d.put(d.find(b,'Rule'),b,0,0,w,1);
 fittedText(b,'Checkpoint heading','Follow the reasoning',0,24,w,20,'Intro');
 const steps=fittedText(b,'Steps',section.steps.map((s,i)=>`${i+1}. ${s}`).join('\n\n'),0,72,w,size,'Body');let y=72+steps.height+24;
 const command=d.find(b,'Command');command.hidden=!section.command;
 if(section.command){const t=fittedText(b,'Command',section.command,0,y,w,13,'Code');y+=t.height+24;}
 const link=d.find(b,'Download');link.hidden=!section.download;
 if(section.download){d.put(link,b,0,y,w,28);y+=48;}
 const note=fittedText(b,'Checkpoint note',section.checkpoint,0,y,w,16,'Caption','Muted');
 b.resize(w,y+note.height);return b.height;
};
a.figure=(b,kind,m=false)=>{
 const w=m?342:992;hideOld(b);
 if(kind==='files'){
  for(let i=0;i<2;i++){
   const y=i*(m?140:100);d.put(d.find(b,'Row rule '+i),b,0,y,w,1);
   d.put(d.find(b,'File '+i),b,0,y+22,m?w:440,30);
   text(b,'File note '+i,i?'2,652,672 bytes. Readable strings and ARM instructions.':'2,359,296 bytes. Opaque body; role still under investigation.',m?0:460,y+(m?62:22),m?w:510,64);
  }
  const y=m?294:220;d.put(d.find(b,'Preservation note'),b,0,y,w,48);
  text(b,'Hash disclosure','Our v5.52 SHA-256 record +',0,y+64,w,30,'Navigation');b.resize(w,y+106);
 }
 if(kind==='memory'){
  for(const s of b.children)if(/^(Cell|Flow)/.test(s.name))s.hidden=true;
  text(b,'Source heading','STORED REPRESENTATION',0,0,m?240:360,24,'Label','Muted').hidden=m;
  text(b,'Result heading','RUNTIME RESULT',m?0:600,0,m?240:360,24,'Label','Muted').hidden=m;
  const rows=[['41 42 43 44','Copy','41 42 43 44'],['A × 4','Expand','41 41 41 41'],['No payload','Zero-fill','00 00 00 00']];
  rows.forEach(([source,op,result],i)=>{const y=(m?0:44)+i*(m?112:92);rect(b,'Region rule '+i,0,y,w,1);fittedText(b,'Stored '+i,source,0,y+20,m?232:360,m?18:20,'Code');text(b,'Operation '+i,op,m?262:430,y+20,80,28,'Label','Muted');rect(b,'Direction '+i,m?262:430,y+62,70,1);fittedText(b,'Result '+i,result,m?0:600,y+(m?60:20),m?232:360,m?18:20,'Code');});
  const y=m?354:338;a.timeline(b,'memory',0,y,w);const status=fittedText(b,'Motion status',scenes.memory.steps.at(-1),0,y+60,w,13,'Label','Muted');b.resize(w,y+60+status.height+16);
 }
 if(kind==='code'){
  b.clipContent=true;const inset=m?16:24,inner=w-inset*2;
  d.put(d.find(b,'Code label'),b,inset,20,inner,28);
  const labels=['String: UTILITY MENU','Reference: aUtilityMenu','Consumer: title drawing call'];
  labels.forEach((label,i)=>{text(b,'Reference trace '+i,label,inset+(m?0:i*320),64+(m?i*48:0),m?inner:296,28,'Label');rect(b,'Reference rule '+i,inset+(m?0:i*320),96+(m?i*48:0),m?inner:296,1,'Ink');});
  const y=m?230:132,code=d.find(b,'Code');code.characters=d.article.code.join('\n');code.fontSize=m?'13':'14';d.put(code,b,inset,y,944,252);
  d.put(d.find(b,'Title reference highlight'),b,8,y+(m?64:69),w-16,25);
  const explanation=fittedText(b,'Code explanation','The title reference is passed to a drawing call. The familiar SYSTEM label below helps identify the menu.',inset,y+266,inner,15,'Caption','Muted');
  const ty=y+266+explanation.height+24;a.timeline(b,'code',inset,ty,inner);
  const status=fittedText(b,'Motion status',scenes.code.steps.at(-1),inset,ty+60,inner,13,'Label','Muted');const h=ty+60+status.height+24;d.find(b,'Code surface').resize(w,h);b.resize(w,h);
 }
 if(kind==='comparison'){
  for(const [i,name]of ['Before','After'].entries()){
   const x=m?0:i*528,y=m?i*150:0;d.put(d.find(b,name+' label'),b,x,y,m?w:464,28);d.put(d.find(b,'OLED '+name),b,x,y+38,m?w:464,m?96:116);const title=d.find(b,'OLED '+name+' title');title.fontSize=m?'24':'28';d.put(title,b,x+20,y+(m?66:76),m?302:424,40);
  }
  const start=m?310:190;
  for(let i=0;i<2;i++){
   const y=start+i*(m?96:90),v=i?'CUSTOM MENU!':'UTILITY MENU';
   text(b,'Characters label '+i,i?'After':'Before',0,y,w,24,'Label','Muted');
   const value=[...v].map(c=>c===' '?'·':c).join('  ')+'  NUL';text(b,'Characters '+i,value,0,y+28,w,28,'Code').fontSize=m?'12':'16';
   text(b,'ASCII '+i,[...v].map(c=>c.charCodeAt(0).toString(16).toUpperCase()).join(' ')+' 00',0,y+58,w,24,'Code','Muted').fontSize=m?'12':'14';
  }
  d.find(b,'Change note').hidden=true;const y=start+(m?206:190);a.timeline(b,'comparison',0,y,w);
  const status=fittedText(b,'Motion status',scenes.comparison.steps.at(-1),0,y+60,w,13,'Label','Muted');b.resize(w,y+60+status.height+16);
 }
 if(kind==='verification'){
  text(b,'Table caption','MENU-DRAWING CASES / RECORDED CPU RESULTS',0,0,w,m?48:28,'Label','Muted');
  const start=m?66:48,row=m?112:96;
  for(let i=0;i<3;i++){const s=d.find(b,'Header '+i);s.fontSize=m?'11':'12';d.put(s,b,i===0?0:(m?142:400)+(i-1)*(m?102:280),start,i===0?(m?136:380):(m?96:260),28);}
  for(let i=0;i<6;i++){d.put(d.find(b,'Selection '+i),b,0,row+i*52,m?136:380,28);for(let col=1;col<3;col++)d.put(d.find(b,`Pass ${i} ${col}`),b,(m?142:400)+(col-1)*(m?102:280),row+i*52,m?96:260,28);d.put(d.find(b,'Table rule '+i),b,0,row+36+i*52,w,1);}
  const y=row+336;a.timeline(b,'verification',0,y,w);const status=fittedText(b,'Motion status',scenes.verification.steps.at(-1),0,y+60,w,13,'Label','Muted');d.put(d.find(b,'Test scope'),b,0,y+status.height+88,w,28);b.resize(w,y+status.height+128);
 }
 if(kind==='hero'){
  const x=m?0:496,width=m?342:448;
  text(b,'Scope','The menu check after the candidate was installed.',x,m?526:330,width,m?80:90,m?'Body mobile':'Intro');
  a.timeline(b,'instrument',x,m?622:426,width);
  const status=fittedText(b,'Replay status',scenes.instrument.steps.at(-1),x,m?688:486,width,13,'Label','Muted');
  const ry=(m?688:486)+status.height+24;text(b,'Reconstruction label','TITLE-ONLY RECONSTRUCTION\nILLUSTRATIVE TIMING / NO DEVICE CONNECTION',x,ry,width,52,'Label','Muted');b.resize(w,Math.max(m?818:626,ry+76));
 }
 return {kind,m,width:b.width,height:b.height};
};
a.mainFigure=kind=>a.figure(main(({files:'Update files',memory:'Runtime map',code:'IDA excerpt',comparison:'Menu title comparison',verification:'Menu verification',hero:'First change instrument'})[kind]),kind);
a.section=(b,i,m=false)=>{
 const section=d.article.sections[i],w=m?342:992,pw=m?342:760;
 const h=d.find(b,'Article heading'),heading=d.find(h,'Heading');heading.characters=section.title;d.textFit(heading,m?342:950,m?'Heading mobile':'Heading');h.resize(w,heading.height);d.put(h,b,0,0);let y=h.height+24;
 for(let j=0;j<section.paragraphs.length;j++){const p=d.find(b,'Paragraph '+j),t=d.find(p,'Paragraph');t.characters=section.paragraphs[j];d.textFit(t,pw,m?'Body mobile':'Body');p.resize(pw,t.height);d.put(t,p,0,0);d.put(p,b,0,y);y+=p.height+24;}
 let cp=child(b,'Reader checkpoint');if(!cp){if(b.id!==main('Section / '+section.id).id)throw Error('Checkpoint must be inserted into section main');cp=instance('Reader checkpoint',b,'Reader checkpoint');}
 d.put(cp,b,0,y+8);a.checkpoint(cp,section,pw);y+=cp.height+48;
 const f=d.find(b,'Figure');d.put(f,b,0,y);a.figure(f,section.figure,m);y+=f.height+16;
 const cap=d.find(b,'Figure caption'),ct=d.find(cap,'Caption');ct.characters=section.caption;d.textFit(ct,m?342:880,'Caption');d.put(ct,cap,0,0);cap.resize(w,ct.height);d.put(cap,b,0,y);b.resize(w,y+cap.height+8);
 return {section:section.id,height:b.height};
};
a.mainSection=i=>a.section(main('Section / '+d.article.sections[i].id),i);
a.begin=id=>{
 const b=penpot.root.children.find(s=>s.id===id);if(!b||!b.name.startsWith('First change /'))throw Error('Guide layout only');
 a.board=b;a.mobile=b.name.includes('Mobile');const m=a.mobile,w=m?342:992,x=m?24:384;
 const intro=d.find(b,'Article introduction'),desc=d.find(intro,'Description');desc.characters=d.article.description;d.textFit(desc,m?342:860,m?'Body mobile':'Intro');d.put(desc,intro,0,m?136:152);
 const period=d.find(intro,'Period');d.put(period,intro,0,(m?136:152)+desc.height+28,m?342:940,28);intro.resize(w,period.y-intro.y+32);
 const hero=d.find(b,'First change instrument');d.put(hero,b,x,intro.y-b.y+intro.height+40);a.figure(hero,'hero',m);
 a.y=hero.y-b.y+hero.height+(m?64:80);return {board:b.name,y:a.y};
};
a.layoutSection=i=>{
 const b=a.board,s=d.article.sections[i],r=b.children.find(c=>c.isComponentHead()&&c.component()?.name===s.id);if(!r)throw Error('Missing linked section '+s.id);
 d.put(r,b,a.mobile?24:384,a.y);a.section(r,i,a.mobile);r.name=s.title;a.y+=r.height+(a.mobile?64:80);return {section:s.id,y:a.y};
};
a.finish=()=>{
 const b=a.board,m=a.mobile,e=d.find(b,'Evidence footer');d.put(e,b,m?24:384,a.y);a.y+=e.height+56;
 const footer=d.find(b,'Footer');d.put(footer,b,m?24:64,a.y);b.resize(m?390:1440,a.y+footer.height+32);
 const lightIds=new Set(['Paper','Ink','Muted','Line','Surface'].map(n=>d.colors[n].id));
 d.queue=b.name.includes('Dark')?[b,...d.visible(b)].filter(s=>s.fills?.some(f=>lightIds.has(f.fillColorRefId))||s.strokes?.some(f=>lightIds.has(f.strokeColorRefId))):[];
 return {board:b.name,height:b.height,darkQueue:d.queue.length};
};
a.organize=()=>{
 if(penpot.currentPage.name!=='Guide components')throw Error('Guide components only');
 let y=0;for(const name of ['Update files','Runtime map','IDA excerpt','Experiment scope','Menu title comparison','Menu verification','Hardware observation']){const b=main(name);b.x=1400;b.y=y;y+=b.height+120;}
 y=0;for(const s of d.article.sections){const b=main('Section / '+s.id);b.x=3000;b.y=y;y+=b.height+120;}
 for(const [name,x,y]of [['First change instrument',4400,0],['Evidence footer',4400,820],['Menu title screen',4400,1400],['Figure control',7600,0]]){const b=main(name);b.x=x;b.y=y;}
 return {organized:true};
};
a.verify=id=>{
 const b=penpot.root.children.find(s=>s.id===id),visible=d.visible(b);
 const overflow=visible.filter(s=>s.type==='text').filter(s=>{const q=s.textBounds;return q&&(q.x<s.x-2||q.y<s.y-2||q.x+q.width>s.x+s.width+2||q.y+q.height>s.y+s.height+2);}).map(s=>s.name);
 return {board:b.name,overflow,timelines:visible.filter(s=>s.isComponentHead()&&s.component()?.name==='Animation timeline').length,checkpoints:visible.filter(s=>s.isComponentHead()&&s.component()?.name==='Reader checkpoint').length};
};
return {loaded:true};
