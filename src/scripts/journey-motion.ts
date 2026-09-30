class JourneyMotion extends HTMLElement {
  private frame = 0;
  private progress = 1;
  private previousTime = 0;
  private phase = -1;
  private entered = false;
  private visible = false;
  private intent = false;
  private button: HTMLButtonElement | null = null;
  private seek: HTMLInputElement | null = null;
  private output: HTMLOutputElement | null = null;
  private pixels: SVGImageElement | null = null;
  private trace?: {width: number; height: number; columns: number; count: number; frameMs: number};
  private mediaReady = false;
  private mediaFailed = false;
  private reducedOptIn = false;
  private steps: HTMLElement[] = [];
  private screens: (SVGTextElement | null)[] = [];
  private display: string[][] = [];
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private observer?: IntersectionObserver;
  private events?: AbortController;
  private get duration() { return Math.max(1, Number(this.dataset.duration)); }
  private get label() { return this.dataset.label || 'Guide sequence'; }

  connectedCallback() {
    if (this.events) return;
    this.button = this.querySelector('[data-toggle]');
    this.seek = this.querySelector('[data-seek]');
    this.output = this.querySelector('[data-time]');
    this.pixels = this.querySelector('[data-r3-frames]');
    const trace = this.querySelector<HTMLElement>('[data-r3-width]');
    if (trace) this.trace = {width: Number(trace.dataset.r3Width), height: Number(trace.dataset.r3Height), columns: Number(trace.dataset.r3Columns), count: Number(trace.dataset.r3Count), frameMs: Number(trace.dataset.r3FrameMs)};
    this.steps = [...this.querySelectorAll<HTMLElement>('[data-journey-step]')];
    if (!this.button || !this.seek || !this.steps.length) return;
    if (this.reduced.matches && !this.reducedOptIn) { this.intent = false; this.progress = 1; }
    if (!this.reduced.matches) this.reducedOptIn = false;
    this.display = this.steps.map(step => JSON.parse(step.dataset.display || '[]'));
    this.screens = ['Journey title', 'Journey line 1', 'Journey line 2', 'Journey footer'].map(name => this.querySelector<SVGTextElement>(`[data-menu-screen] [data-part="${name}"] text`));
    this.events = new AbortController();
    const options = {signal: this.events.signal};
    this.querySelector<HTMLElement>('[data-timeline]')!.hidden = false;
    this.dataset.ready = 'true';
    this.dataset.playing = 'false';
    if (this.mediaReady) this.dataset.mediaReady = 'true';
    if (this.mediaFailed) {
      this.intent = false;
      const note = this.querySelector<HTMLElement>('[data-media-error]');
      if (note) note.hidden = false;
    }
    this.button.addEventListener('click', () => {
      this.entered = true;
      this.intent = !this.intent;
      if (this.intent) this.reducedOptIn = this.reduced.matches;
      if (this.intent && this.progress >= 1) this.progress = 0;
      this.sync();
    }, options);
    this.seek.addEventListener('input', () => {
      this.entered = true;
      this.intent = false;
      this.progress = Number(this.seek!.value) / 1000;
      this.stop('paused');
      this.render();
    }, options);
    this.reduced.addEventListener('change', this.motionChanged, options);
    document.addEventListener('visibilitychange', this.visibilityChanged, options);
    this.render();
    this.updateButton();
    if (this.pixels && !this.mediaReady && !this.mediaFailed) {
      const image = new Image();
      image.addEventListener('load', () => {
        this.mediaReady = true;
        if (this.isConnected) { this.dataset.mediaReady = 'true'; this.sync(); }
      }, {once: true});
      image.addEventListener('error', () => {
        this.mediaFailed = true;
        this.intent = false;
        this.progress = 1;
        if (this.isConnected) {
          this.stop('paused');
          this.render();
          const note = this.querySelector<HTMLElement>('[data-media-error]');
          if (note) note.hidden = false;
        }
      }, {once: true});
      image.src = this.pixels.getAttribute('href') || '';
    }
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
        if (this.visible && !this.entered) {
          this.entered = true;
          if (!this.reduced.matches && !this.mediaFailed) { this.progress = 0; this.intent = true; }
        }
        this.sync();
      }, {threshold: [0, .2]});
      this.observer.observe(this);
    } else {
      this.visible = true;
      this.entered = true;
    }
  }

  disconnectedCallback() {
    this.stop('paused');
    this.events?.abort();
    this.events = undefined;
    this.observer?.disconnect();
  }

  private motionChanged = () => {
    this.reducedOptIn = false;
    if (this.reduced.matches) {
      this.intent = false;
      this.progress = 1;
      this.stop('paused');
      this.render();
    }
  };
  private visibilityChanged = () => this.sync();
  private sync() {
    if (this.intent && this.visible && !document.hidden && (!this.trace || this.mediaReady)) this.start();
    else this.stop(this.intent ? 'suspended' : 'paused');
  }
  private start() {
    if (this.frame) return;
    this.dataset.playing = 'true';
    this.previousTime = performance.now();
    this.updateButton();
    this.render();
    this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (now: number) => {
    this.frame = 0;
    const elapsed = Math.max(0, now - this.previousTime);
    this.progress = Math.max(0, Math.min(1, this.progress + elapsed / this.duration));
    this.previousTime = now;
    this.render();
    if (this.progress >= 1) { this.intent = false; this.stop('false'); }
    else this.frame = requestAnimationFrame(this.tick);
  };
  private stop(state: string) {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.dataset.playing = state;
    this.updateButton();
  }
  private updateButton() {
    this.dataset.intent = String(this.intent);
    if (this.button) {
      this.button.disabled = this.mediaFailed;
      this.button.setAttribute('aria-label', this.mediaFailed ? 'Animation unavailable' : `${this.intent ? 'Pause' : 'Play'} ${this.label}`);
    }
  }
  private render() {
    const phase = Math.max(0, Math.min(this.steps.length - 1, Math.floor(this.progress * this.steps.length)));
    this.style.setProperty('--progress', String(this.progress));
    if (this.seek) this.seek.value = String(Math.round(this.progress * 1000));
    const time = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
    const clock = `${time(this.progress * this.duration)} / ${time(this.duration)}`;
    if (this.output && this.output.textContent !== clock) this.output.textContent = clock;
    if (this.trace && this.pixels) {
      const {columns, count, frameMs, width, height} = this.trace;
      const frame = Math.min(count - 1, Math.floor(this.progress * this.duration / frameMs));
      this.pixels.setAttribute('x', String(-(frame % columns) * width));
      this.pixels.setAttribute('y', String(-Math.floor(frame / columns) * height));
      this.dataset.frame = String(frame);
    }
    if (phase === this.phase) return;
    this.phase = phase;
    this.dataset.phase = String(phase);
    this.steps.forEach((step, index) => {
      step.toggleAttribute('data-active', index === phase);
      if (index === phase) step.removeAttribute('aria-hidden');
      else step.setAttribute('aria-hidden', 'true');
    });
    this.screens.forEach((text, index) => { if (text) { const line = text.querySelector('tspan') || text; line.textContent = this.display[phase][index] || ''; } });
    const title = this.steps[phase].querySelector('h3')?.textContent;
    this.seek?.setAttribute('aria-valuetext', `${phase + 1} of ${this.steps.length}: ${title}`);
  }
}

if (!customElements.get('journey-motion')) customElements.define('journey-motion', JourneyMotion);
