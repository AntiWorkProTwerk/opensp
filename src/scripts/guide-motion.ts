class GuideMotion extends HTMLElement {
  private timer:number|undefined;
  private step=0;
  private paused=false;
  private replay:HTMLButtonElement|null=null;
  private pauseButton:HTMLButtonElement|null=null;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private observer:IntersectionObserver|undefined;
  connectedCallback(){
    if(this.dataset.ready)return;
    this.dataset.ready='true';
    this.querySelectorAll<HTMLElement>('.figure-controls,[data-highlight]').forEach(el=>el.hidden=false);
    this.replay=this.querySelector('[data-replay]');this.pauseButton=this.querySelector('[data-pause]');
    this.replay?.addEventListener('click',()=>this.start());
    this.pauseButton?.addEventListener('click',()=>{if(this.paused)this.resume();else this.pause();});
    this.querySelector<HTMLButtonElement>('[data-highlight]')?.addEventListener('click',event=>{const b=event.currentTarget as HTMLButtonElement;const active=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(active));b.textContent=active?'Title reference highlighted':'Highlight title reference';this.classList.toggle('hide-highlight',!active);});
    this.reduced.addEventListener('change',this.onMotionChange);
    document.addEventListener('visibilitychange',this.onVisibility);
    this.observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&this.dataset.playing==='true')this.pause();});this.observer.observe(this);
  }
  disconnectedCallback(){clearTimeout(this.timer);this.observer?.disconnect();this.reduced.removeEventListener('change',this.onMotionChange);document.removeEventListener('visibilitychange',this.onVisibility);}
  private onMotionChange=()=>{if(this.reduced.matches)this.pause();};
  private onVisibility=()=>{if(document.hidden)this.pause();};
  private status(text:string){const out=this.querySelector('.motion-status');if(out)out.textContent=text;}
  private start(){clearTimeout(this.timer);this.step=0;this.paused=false;this.dataset.playing='true';this.replay!.textContent=this.dataset.mode==='instrument'?'Replay menu check':this.dataset.mode==='memory'?'Follow the bytes':'Replay the change';if(this.pauseButton){this.pauseButton.hidden=this.reduced.matches;this.pauseButton.textContent='Pause';}if(this.reduced.matches){this.step=this.length()-1;this.render();this.complete();}else this.tick();}
  private length(){return this.dataset.mode==='comparison'?13:4;}
  private tick(){this.render();if(this.step>=this.length()-1){this.complete();return;}this.timer=window.setTimeout(()=>{this.step++;this.tick();},this.dataset.mode==='comparison'?110:750);}
  private complete(){this.dataset.playing='false';if(this.pauseButton)this.pauseButton.hidden=true;}
  private pause(){if(this.dataset.playing!=='true')return;clearTimeout(this.timer);this.paused=true;this.dataset.playing='paused';if(this.pauseButton)this.pauseButton.textContent='Resume';}
  private resume(){this.paused=false;this.dataset.playing='true';if(this.pauseButton)this.pauseButton.textContent='Pause';this.tick();}
  private render(){
    const mode=this.dataset.mode;
    if(mode==='memory'){this.querySelectorAll<HTMLElement>('[data-stage]').forEach((el,i)=>el.toggleAttribute('data-active',this.step===3||i===this.step));this.status(['The update file holds the stored bytes.','Startup copies, decompresses and clears regions.','The program can now refer to code and data at their runtime locations.','The same bytes need the right locations.'][this.step]);}
    if(mode==='comparison'){this.querySelectorAll<HTMLElement>('[data-character]').forEach((el,i)=>el.toggleAttribute('data-changed',i<this.step));this.status(this.step===12?'12 title bytes changed. The terminator and image size stay unchanged.':`${this.step} of 12 title bytes highlighted.`);}
    if(mode==='instrument'){const screen=this.querySelector('[data-menu-screen] text');if(screen)screen.textContent=this.step<3?'UTILITY MENU':'CUSTOM MENU!';const pads=this.querySelectorAll('[data-component="Pad - idle"]');pads[12]?.classList.toggle('demo-active',this.step===2);const shifts=this.querySelectorAll('[data-part]');shifts.forEach(el=>{if(el.getAttribute('data-part')?.toLowerCase()==='shift')el.classList.toggle('demo-active',this.step===1||this.step===2);});this.status(['The original menu title.','Hold SHIFT.','Press pad 13 to open Utility.','CUSTOM MENU! The reported result, reconstructed here.'][this.step]);}
  }
}
if(!customElements.get('guide-motion'))customElements.define('guide-motion',GuideMotion);
