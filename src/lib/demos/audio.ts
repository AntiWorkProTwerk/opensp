import {action, choose, circle, line, path, rect, text} from './types.ts';
import type {Demo, Mark, Values} from './types.ts';

const clamp = (value:number, low:number, high:number) => Math.max(low, Math.min(high, value));
const value = (values:Values, key:string, fallback:number) => Number.isFinite(values[key]) ? values[key] : fallback;
const option = (values:Values, key:string, fallback:number, max:number) => Math.round(clamp(value(values,key,fallback),0,max));
const phase = (progress:number) => clamp(Number.isFinite(progress) ? progress : 1,0,1);
const inkText = (id:string, label:string, x:number, y:number, w:number, size:number, inverse=false):Mark =>
  ({...text(id,label,x,y,w,size),fill:inverse?'Paper':'Ink'});

const findingAudio:Demo = {
  slug:'finding-audio',
  title:'A busy stream can repeat itself',
  prompt:'Compare neighboring values, then compare matching positions. Drop a word to see why the error counter matters.',
  caption:'Invented four-position frames. These values are not captured samples or named physical channels.',
  fallback:'The repeated frame [0, 7, 7, 0] produces four adjacent changes but zero same-position changes. A changed error count makes the shifted comparison invalid.',
  initial:{comparison:0,loss:0},
  controls:[choose('comparison','Compare',['Neighboring values','Matching positions']),choose('loss','Capture alignment',['Stable','Drop one word'])],
  frame(values, progress) {
    const matching=option(values,'comparison',0,1)===1;
    const lost=option(values,'loss',0,1)===1;
    const p=phase(progress);
    const before=[0,7,7,0];
    const after=lost?[7,7,0,0]:before;
    const stream=[...before,...after];
    const count=matching?before.filter((n,i)=>n!==after[i]).length:stream.slice(1).filter((n,i)=>n!==stream[i]).length;
    const rejected=matching&&lost;
    const active=Math.min(matching?3:6,Math.floor(p*(matching?4:7)));
    const marks:Mark[]=[
      text('method',matching?'MATCHING POSITIONS':'NEIGHBORING VALUES',24,12,430,14),
      text('first-label','First frame',24,43,210,16),
      text('second-label',lost?'Next frame / one word lost':'Next frame',24,143,420,16),
    ];
    for(let i=0;i<8;i++) {
      const row=Math.floor(i/4),col=i%4,x=24+col*108,y=74+row*100;
      const selected=matching?col===active:i===active||i===active+1;
      marks.push(rect(`cell-${i}`,x,y,90,52,selected?'Ink':'Surface'));
      marks.push(inkText(`sample-${i}`,String(stream[i]),x+35,y+9,45,24,selected));
      marks.push(text(`position-${i}`,String(col),x+3,y+53,80,10));
    }
    for(let i=0;i<4;i++) {
      const x=69+i*108;
      marks.push({...path(`matching-link-${i}`,`M${x} 126V174`),opacity:matching?(i===active?1:.25):0});
    }
    for(let i=0;i<7;i++) {
      const col=i%4,row=Math.floor(i/4),x=114+col*108,y=100+row*100;
      const d=col===3?'M438 100H464V158H12V200H24':`M${x} ${y}H${x+18}`;
      marks.push({...path(`neighbor-link-${i}`,d),opacity:matching?0:(i===active?1:.25)});
    }
    marks.push(line('result-rule',24,249,432));
    marks.push(text('result',rejected?'Comparison rejected':`${count} ${matching?'same-position':'adjacent'} changes`,24,261,432,24));
    marks.push(text('error-note',lost?'Error count: 0 to 1 / alignment is uncertain':'Error count: 0 to 0 / the frame repeats',24,299,432,12));
    return {marks,readout:rejected
      ?'Comparison rejected: the error count changed from 0 to 1, so matching software positions may no longer align.'
      :`${count} ${matching?'same-position':'adjacent'} changes. ${lost?'A word was lost; neighboring differences cannot establish signal content.':matching?'Both frames contain exactly the same values.':'The counter rises although the complete frame repeats unchanged.'}`};
  },
};

const audioStream:Demo = {
  slug:'audio-stream',
  title:'Put the interrupt between the reads',
  prompt:'Change the read order. Keep the genuine-timeout and rollover cases to check what the correction must preserve.',
  caption:'An invented eight-bit timer with a 20-tick timeout threshold. Animation speed is not device timing.',
  fallback:'Racing reads produce (100 - 101) modulo 256 = 255. Ordered reads produce 3; a real gap produces 41; rollover produces 9. Only ages greater than 20 time out.',
  initial:{order:0,scenario:0},
  controls:[choose('order','Read order',['Current clock first','Latest block first']),choose('scenario','Timing case',['Interrupt between reads','No interrupt','Genuine timeout','Timer rollover'])],
  frame(values, progress) {
    const corrected=option(values,'order',0,1)===1;
    const scenario=option(values,'scenario',0,3);
    const p=phase(progress);
    const [now,last]=scenario===0?(corrected?[102,99]:[100,101]):scenario===1?[100,99]:scenario===2?[140,99]:[3,250];
    const age=(now-last+256)%256;
    const timeout=age>20;
    const first=corrected?`Last = ${last}`:`Now = ${now}`;
    const second=corrected?`Now = ${now}`:`Last = ${last}`;
    const points=scenario!==0?[[172,62],[308,62]]:p<.5?[[96,139],[8,139],[8,190],[149,190]]:[[331,190],[384,190],[384,139]];
    const travel=(scenario!==0?p:p<.5?p*2:(p-.5)*2)*(points.length-1);
    const segment=Math.min(points.length-2,Math.floor(travel)),fraction=travel-segment;
    const cursor=points[segment].map((v,i)=>v+(points[segment+1][i]-v)*fraction);
    const angle=age/256*Math.PI*2-Math.PI/2;
    const handX=414+25*Math.cos(angle),handY=263+25*Math.sin(angle);
    const marks:Mark[]=[
      text('thread-label','Foreground reads',24,13,430,16),
      line('thread-line',24,101,432),
      rect('first-read',24,67,144,68,'Surface'),
      text('first-name',corrected?'Read latest block':'Read current clock',34,73,132,12),
      text('first-value',first,34,95,130,19),
      rect('second-read',312,67,144,68,'Surface'),
      text('second-name',corrected?'Read current clock':'Read latest block',322,73,132,12),
      text('second-value',second,322,95,128,19),
      text('interrupt-label','Block-completion interrupt',24,145,430,13),
      line('interrupt-lane',24,190,432),
      rect('interrupt-event',154,173,172,34,scenario===0?'Ink':'Surface'),
      inkText('interrupt-text',scenario===0?'Latest block = 101':'No intervening update',164,179,160,12,scenario===0),
      {...path('interleave-path','M96 135V139H8V190H154M326 190H384V135'),opacity:scenario===0?1:0},
      circle('execution-cursor',cursor[0]-5,cursor[1]-5,10),
      text('calculation',`${now} - ${last} = ${age}`,24,232,314,26),
      text('result',timeout?'TIMEOUT / age > 20':'CONTINUE / age <= 20',24,274,318,16),
      {...circle('timer-ring',381,230,66,'Paper'),stroke:'Line'},
      text('timer-label','8-bit wrap',368,299,102,12),
      path('timer-hand',`M414 263L${handX.toFixed(2)} ${handY.toFixed(2)}`),
      circle('timer-center',411,260,6),
      text('timer-zero','0',409,212,30,11),
    ];
    const cause=scenario===0&&!corrected?'The interrupt supplied a newer last-block time than the already-read current clock.':scenario===0?'The first read retains the older last-block timestamp; the current clock is read afterward.':scenario===2?'The true gap still exceeds the threshold.':scenario===3?'Unsigned wrap preserves the nine-tick interval across rollover.':'The clock and latest-block readings remain in order.';
    return {marks,readout:`Elapsed: ${age} ticks. ${timeout?'Timeout':'Continue'}. ${cause} These are teaching values, not the R40 snapshot.`};
  },
};

const noteName = (midi:number) => `${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][((midi%12)+12)%12]}${Math.floor(midi/12)-1}`;
const pitchCorrection:Demo = {
  slug:'pitch-correction',
  title:'An estimate is not a target note',
  prompt:'Move the estimated input frequency and change the allowed scale. Watch the target and correction ratio change.',
  caption:'Musical selection from an invented pitch estimate. No microphone, detector, shifter or audio output runs here.',
  fallback:'An invented 445 Hz estimate is MIDI note 69.196. C major selects A4 at 440 Hz, giving a pitch ratio of 0.988764. This arithmetic does not establish corrected sound quality.',
  initial:{frequency:445,scale:0},
  controls:[{id:'frequency',label:'Estimated input frequency (Hz)',kind:'range',min:262,max:523,step:1},choose('scale','Allowed notes',['C major','Chromatic'])],
  frame(values, progress) {
    const frequency=clamp(value(values,'frequency',445),262,523);
    const chromatic=option(values,'scale',0,1)===1;
    const p=phase(progress);
    const estimate=69+12*Math.log2(frequency/440);
    const allowed=Array.from({length:25},(_,i)=>48+i).filter(n=>chromatic||[0,2,4,5,7,9,11].includes(n%12));
    const target=allowed.reduce((nearest,n)=>Math.abs(n-estimate)<Math.abs(nearest-estimate)?n:nearest,allowed[0]);
    const targetHz=440*2**((target-69)/12);
    const cents=(target-estimate)*100;
    const y=(midi:number)=>256-(midi-60)*16.5;
    const inputY=y(estimate),targetY=y(target);
    const marks:Mark[]=[
      text('input-heading',`${frequency.toFixed(0)} Hz input`,91,10,174,20),
      text('target-heading',chromatic?'Chromatic target':'C-major target',273,10,190,16),
    ];
    for(let i=0;i<13;i++) {
      const midi=60+i,enabled=chromatic||[0,2,4,5,7,9,11].includes(midi%12);
      marks.push(text(`note-name-${i}`,noteName(midi),24,y(midi)-8,57,12));
      marks.push({...line(`note-line-${i}`,89,y(midi),363),opacity:enabled?1:.18});
      marks.push({...rect(`allowed-note-${i}`,424,y(midi)-4,18,8,enabled?'Ink':'Paper','Line'),opacity:enabled?1:.45});
    }
    marks.push({...path('correction-path',`M153 ${inputY.toFixed(2)}H241V${targetY.toFixed(2)}H${(241+43*p).toFixed(2)}`),stroke:'Ink'});
    marks.push(circle('input-point',147,inputY-6,12));
    marks.push(rect('selected-note',288,targetY-11,122,22,'Ink','Ink'));
    marks.push(inkText('selected-label',`${noteName(target)} / ${targetHz.toFixed(1)}`,295,targetY-9,114,12,true));
    marks.push(line('ratio-rule',24,280,432));
    marks.push(text('ratio',`Ratio ${(targetHz/frequency).toFixed(6)}`,24,289,250,20));
    marks.push(text('cents',`${cents>=0?'+':''}${cents.toFixed(1)} cents`,287,292,175,16));
    return {marks,readout:`Estimate: MIDI ${estimate.toFixed(3)}. Target: ${noteName(target)}, ${targetHz.toFixed(2)} Hz. Correction: ${cents.toFixed(2)} cents; ratio ${(targetHz/frequency).toFixed(6)}. This chooses a note; it does not process sound.`};
  },
};

const synthInitial:Values={patch:0,dirty:1,take:1,pending:0,event:0};
const synthDesign:Demo = {
  slug:'synth-design',
  title:'What survives a patch change?',
  prompt:'Edit, store or initialize the fictional patch. Confirm or cancel, then check the patch name, edited marker and held take.',
  caption:'Interface model only. A retained take is an explicit rule of this exercise, not a demonstrated SP recording or storage feature.',
  fallback:'Cancel preserves the current patch name and edited state. Initialize produces Init, clean. Store produces My patch, clean. All three outcomes retain the model’s phrase-1 take.',
  initial:{...synthInitial},
  controls:[action('edit','Edit patch'),action('store','Store'),action('initialize','Initialize'),action('confirm','Confirm'),action('cancel','Cancel'),action('reset','Reset model')],
  disabled:(values,id)=>(id==='confirm'||id==='cancel')?!values.pending:id==='edit'?!!values.pending:false,
  act(values, actionId) {
    const state={...synthInitial,...values};
    if(actionId==='reset')return {...synthInitial};
    if(actionId==='edit')return state.pending?state:{...state,dirty:1,event:1};
    if(actionId==='store')return {...state,pending:1,event:2};
    if(actionId==='initialize')return {...state,pending:2,event:3};
    if(actionId==='cancel')return state.pending?{...state,pending:0,event:6}:state;
    if(actionId==='confirm'&&state.pending===1)return {...state,patch:1,dirty:0,pending:0,event:4};
    if(actionId==='confirm'&&state.pending===2)return {...state,patch:2,dirty:0,pending:0,event:5};
    return state;
  },
  frame(values, progress) {
    const patch=option(values,'patch',0,2),dirty=option(values,'dirty',1,1)===1;
    const pending=option(values,'pending',0,2),event=option(values,'event',0,6);
    const p=phase(progress);
    const patchName=['Example patch','My patch','Init'][patch];
    const eventText=['Ready to edit','Patch edited','Confirm storage','Confirm initialization','Patch stored','Patch initialized','Action cancelled'][event];
    const status=pending===1?'Store as My patch?':pending===2?'Initialize this patch?':eventText;
    const marks:Mark[]=[
      rect('patch-screen',24,22,282,155,'Paper','Ink'),
      text('screen-title','PATCH / INTERFACE MODEL',40,34,253,12),
      text('patch-name',patchName,40,62,254,27),
      text('patch-status',dirty?'EDITED':'CLEAN',40,105,253,14),
      line('screen-divider',40,137,249),
      text('screen-status',status,40,147,251,12),
      text('state-label','PATCH STATE',330,25,129,12),
      text('state-value',dirty?'Edited':'Clean',330,48,131,23),
      text('confirmation-label','CONFIRMATION',330,103,134,11),
      text('confirmation-state',pending?'Waiting':'None',330,126,133,22),
      text('take-label','HELD TAKE / phrase-1',24,198,432,14),
      rect('take-strip',24,227,432,45,'Surface','Line'),
      text('take-result','The held take stays unchanged.',24,286,432,19),
    ];
    const heights=[8,20,13,29,17,34,12,22,8,28,17,10];
    for(let i=0;i<heights.length;i++) {
      marks.push({...rect(`take-event-${i}`,39+i*34,249-heights[i]/2,8,heights[i],'Ink','Ink'),opacity:i/12<=p?1:.3});
    }
    return {marks,readout:`${status}. Patch: ${patchName}, ${dirty?'edited':'clean'}. Held take: phrase-1, unchanged. ${pending?'Confirm to apply the patch action, or cancel to preserve it.':'This is a fictional interface state, not installed synth behavior.'}`};
  },
};

const fictionalTitle='FACTORY PAGE';
const replacementTitle='MY LAB PAGE!';
const titleBytes=(title:string)=>Array.from(title,c=>c.charCodeAt(0));
const firstChange:Demo = {
  slug:'first-change',
  title:'Check the whole record',
  prompt:'Choose a fictional record change. Check its length, fixed terminator position and surrounding bytes at their original offsets.',
  caption:'Fixed, invented in-memory records. This comparison accepts no files and cannot modify or install firmware.',
  fallback:'A twelve-character replacement preserves the record length, terminator position and surrounding bytes. An extra byte changes the length and moves both the terminator and trailing guard, failing all three checks. A changed terminator or surrounding byte fails its own check.',
  initial:{record:0},
  controls:[choose('record','Fictional record',['Same-length text','One extra byte','Changed terminator','Changed surrounding byte'])],
  frame(values, progress) {
    const selected=option(values,'record',0,3),p=phase(progress);
    const before=[0x7E,...titleBytes(fictionalTitle),0,0x55];
    const after=[0x7E,...titleBytes(replacementTitle+(selected===1?'X':'')),selected===2?0xFF:0,selected===3?0x54:0x55];
    const lengthOk=before.length===after.length;
    const terminatorOk=after[13]===0;
    const surroundingsOk=[0,before.length-1].every(offset=>before[offset]===after[offset]);
    const checks=[lengthOk,terminatorOk,surroundingsOk];
    const labels=['Length','Terminator position','Surroundings'];
    const marks:Mark[]=[
      text('record-label','Invented title records / ASCII bytes',24,11,432,16),
      text('before-label',`Before: ${fictionalTitle}`,24,48,432,16),
      text('after-label',`After: ${replacementTitle}${selected===1?'X':''}`,24,129,432,16),
    ];
    for(let row=0;row<2;row++) {
      const bytes=row===0?before:after;
      for(let i=0;i<16;i++) {
        const byte=bytes[i],present=byte!==undefined,x=24+i*27,y=77+row*81;
        const changed=row===1&&byte!==before[i]&&i<=Math.floor(p*16);
        const glyph=!present?'':byte===0?'0':byte===0xFF?'FF':byte===0x20?'.':String.fromCharCode(byte);
        marks.push({...rect(`byte-${row}-${i}`,x,y,25,43,changed?'Ink':'Surface','Line'),opacity:present?1:.18});
        marks.push(inkText(`character-${row}-${i}`,glyph,x+4,y+4,22,13,changed));
        marks.push(inkText(`hex-${row}-${i}`,present?byte.toString(16).toUpperCase().padStart(2,'0'):'',x+4,y+25,22,10,changed));
      }
    }
    marks.push(line('checks-rule',24,224,432));
    for(let i=0;i<3;i++) {
      const x=24+i*144;
      marks.push(text(`check-label-${i}`,labels[i],x,235,141,12));
      marks.push(text(`check-value-${i}`,checks[i]?'Preserved':'Changed',x,258,141,22));
    }
    marks.push(text('scope','Preset comparisons only / no firmware input',24,298,432,12));
    return {marks,readout:`Fictional record: ${before.length} bytes before, ${after.length} after. Length ${lengthOk?'preserved':'changed'}; fixed terminator position ${terminatorOk?'preserved':'changed'}; surrounding bytes at original offsets ${surroundingsOk?'preserved':'changed'}. ${checks.every(Boolean)?'All three checks pass.':'The selected change fails the displayed checks.'}`};
  },
};

export const audioDemos:Demo[]=[findingAudio,audioStream,pitchCorrection,synthDesign,firstChange];
