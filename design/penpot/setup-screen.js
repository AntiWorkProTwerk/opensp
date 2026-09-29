// Inject __POSTER__ from the verified poster-path.json before execute_code.
// Run once on SP components. Keep native Display/Instrument links intact.
if (penpot.currentFile.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3' || penpot.currentPage.name !== 'SP components') throw Error('Open SP components first');
const poster = __POSTER__;
const lib = penpot.library.local;
if (lib.components.some(c => c.path === 'SP/Screens' && c.name === 'AntiWorkProTwerk R3')) throw Error('Screen main already exists; inspect before updating');
function color(name, value) {
  let c = lib.colors.find(c => c.name === name && c.path === 'SP/Display');
  if (!c) { c = lib.createColor(); c.name = name; c.path = 'SP/Display'; c.color = value; c.opacity = 1; }
  return c;
}
const black = color('OLED black', '#000000'), white = color('OLED pixel', '#ffffff');
const b = penpot.createBoard();
b.name = 'SP / Screens / AntiWorkProTwerk R3'; b.resize(128,64); b.x = 0; b.y = 1040; b.fills = [black.asFill()];
const pixels = penpot.createPath(); pixels.name = 'OLED pixels / R3 frame 00'; pixels.d = poster.d;
const px = pixels.x, py = pixels.y;
b.appendChild(pixels); pixels.x = b.x + px; pixels.y = b.y + py; pixels.fills = [white.asFill()]; pixels.strokes = [];
const screen = lib.createComponent([b]); screen.name = 'AntiWorkProTwerk R3'; screen.path = 'SP/Screens';
const spec = JSON.stringify({id:'antiworkprotwerk-r3',width:128,height:64,frameCount:64,frameMs:50,posterFrame:0,manifest:'design/assets/screens/antiworkprotwerk-r3/manifest.json',preview:'design/studies/home.html',kind:'compiled-renderer-pixel-trace',timing:'preview assumption, not hardware measured',omitted:'stock caption/font/header/surrounding UI'});
screen.setPluginData('screen-sequence',spec); b.setPluginData('screen-sequence',spec);
const display = lib.components.find(c => c.id === 'e630c86e-d742-80d8-8008-b565ebd57582').mainInstance();
for (const child of display.children) if (['OLED heading','OLED value','OLED waveform'].includes(child.name)) child.hidden = true;
const bg = display.children.find(s => s.name === 'OLED background'); bg.fills = [black.asFill()];
const instance = screen.instance(); instance.name = 'OLED content slot / AntiWorkProTwerk R3';
const children = instance.children.map(s => ({s,x:s.x-instance.x,y:s.y-instance.y,w:s.width,h:s.height}));
display.appendChild(instance); instance.resize(110,55); instance.x = display.x + 11; instance.y = display.y + 41.5;
for (const v of children) { v.s.resize(v.w*110/128,v.h*55/64); v.s.x=instance.x+v.x*110/128; v.s.y=instance.y+v.y*55/64; }
instance.setPluginData('screen-sequence',spec);
display.setPluginData('screen-slot',JSON.stringify({content:screen.id,x:11,y:41.5,width:110,height:55,fit:'contain',nativeAspect:'128:64',docs:'docs/sp-display.md'}));
const note = penpot.createText('R3 / AntiWorkProTwerk\n128 × 64 · 64 frames · 50 ms preview timing\nStatic poster here; playback in design/studies/home.html\nOriginal renderer pixels; stock UI and caption omitted.');
note.name = 'Screen sequence / usage and provenance';
note.applyTypography(lib.typographies.find(t=>t.name==='Label'));
note.fontSize='12'; note.lineHeight='1.5'; note.resize(560,90); note.x=0; note.y=1128;
note.fills=[lib.colors.find(c=>c.name==='Ink'&&c.path==='OpenSP').asFill()];
storage.screenComponentId=screen.id;
return {component:screen.id,main:b.id,slot:instance.id,posterPath:pixels.id,black:black.id,white:white.id};
