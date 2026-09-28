if(penpot.currentPage.name!=='Design system')throw new Error('Open Design system first');
const d=storage.ds;
if(Object.keys(d.components).length)throw new Error('Website components already started');
const sample=penpotUtils.findShape(s=>s.name==='Typography sample',penpot.root);if(sample)sample.remove();
const make=d.make,txt=d.text,r=d.rect,inst=d.instance;
make('Wordmark',0,0,120,40,b=>txt(b,'Brand','opensp',0,0,120,40,'Brand'));
make('Primary links',180,0,222,44,b=>{txt(b,'Releases link','Releases',0,9,100,28,'Navigation');txt(b,'Guides link','Guides',122,9,100,28,'Navigation');});
make('Theme selector',460,0,128,32,b=>txt(b,'Theme label','LIGHT / ○',0,6,128,24,'Label','Ink','right'));
make('Section label',650,0,220,28,b=>txt(b,'Label','01 / RELEASES',0,2,220,24,'Label'));
make('Navigation',0,150,1312,90,b=>{inst(d.components.Wordmark,b,0,22,'Wordmark');inst(d.components['Primary links'],b,545,16,'Primary links');inst(d.components['Theme selector'],b,1184,20,'Theme selector');r(b,'Rule',0,89,1312,1,'Line');});
make('Hero copy',0,330,760,245,b=>{txt(b,'Eyebrow','AN INDEPENDENT SP-404MKII PROJECT',0,0,740,25,'Label');txt(b,'Title','OpenSP',0,39,740,95,'Hero');txt(b,'Subtitle','An open set of firmware and guides\nfor the Sp-404MKII',4,153,740,80,'Intro');});
make('Section header',0,690,1312,100,b=>{r(b,'Rule',0,0,1312,1,'Line');inst(d.components['Section label'],b,0,30,'Numbered label');txt(b,'Description','A record of what changes.',360,26,840,62,'Heading');txt(b,'Disclosure indicator','−',1276,27,36,45,'Heading','Ink','center');});
make('Release card',0,870,952,83,b=>{r(b,'Card surface',0,0,952,83,'Surface');txt(b,'Status','RELEASE INDEX / PREVIEW',24,14,904,24,'Label');txt(b,'Card body','Downloads and verified release details will appear here.',24,44,904,30,'Caption');});
make('Release content',0,1050,952,225,b=>{txt(b,'Body','Builds, release notes, and compatibility information.\nA clear place to see what is ready and what is experimental.',0,0,952,80,'Body');inst(d.components['Release card'],b,0,100,'Release card');});
make('Guide row',0,1360,952,87,b=>{r(b,'Rule',0,0,952,1,'Line');txt(b,'Index','01',0,22,40,25,'Label');txt(b,'Title','Meet the instrument',55,12,830,34,'Intro');txt(b,'Description','A visual map of the surface.',55,48,830,28,'Caption');txt(b,'Link arrow','↗',920,16,32,38,'Intro','Ink','right');});
make('Footer',0,1530,1312,70,b=>{r(b,'Rule',0,0,1312,1,'Line');txt(b,'Project note','OPENSP / INDEPENDENT, COMMUNITY-MINDED',0,25,760,28,'Label');txt(b,'Preview note','HOMEPAGE DESIGN / PREVIEW',970,25,342,28,'Label','Ink','right');});
// A visible type and color reference, using the same asset references as the UI.
const swatches=d.board('Shared colors',1510,0,600,760,'Paper');let y=30;
for(const name of Object.keys(d.colors)){r(swatches,name,30,y,64,38,name,'Line');txt(swatches,name+' label',name,120,y+5,440,28,'Caption');y+=64;}
const typeboard=d.board('Shared typography',1510,860,800,1500,'Paper');y=30;
for(const [name,t]of Object.entries(d.type)){txt(typeboard,name,name+' / OpenSP',30,y,740,Math.max(50,Number(t.fontSize)*1.4),name);y+=Math.max(65,Number(t.fontSize)*1.6);}
return {components:Object.keys(d.components),page:penpot.currentPage.name};
