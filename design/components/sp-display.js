/* Framework-independent, progressively enhanced pixel-frame player. */
(() => {
  if (customElements.get('sp-display')) return;
  class SPDisplay extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.frame = 0;
      this.elapsed = 0;
      this.last = null;
      this.timer = null;
      this.visible = false;
      this.loaded = false;
      this.failed = false;
      delete this.dataset.ready;
      this.image = this.querySelector('[data-frames]');
      this.button = this.querySelector('button');
      if (this.button) this.button.hidden = true;
      this.motion = matchMedia('(prefers-reduced-motion: reduce)');
      this.wanted = this.hasAttribute('autoplay') && !this.motion.matches;
      this.width = Number(this.getAttribute('frame-width'));
      this.height = Number(this.getAttribute('frame-height'));
      this.count = Number(this.getAttribute('frames'));
      this.columns = Number(this.getAttribute('columns'));
      this.ms = Number(this.getAttribute('frame-ms'));
      try {
        this.durations = this.hasAttribute('durations') ? JSON.parse(this.getAttribute('durations')) : Array(this.count).fill(this.ms);
        if (!this.image || !this.button || ![this.width, this.height, this.count, this.columns].every(v => Number.isInteger(v) && v > 0)
          || this.count > 4096 || this.durations.length !== this.count || !this.durations.every(v => Number.isFinite(v) && v >= 16)) throw new Error('Invalid screen sequence');
      } catch {
        this.failed = true;
        this.dataset.state = 'error';
        this.controller.abort();
        return;
      }
      this.duration = this.durations.reduce((sum, value) => sum + value, 0);
      this.button.addEventListener('click', () => this.wanted ? this.pause() : this.play(), options);
      document.addEventListener('visibilitychange', () => this.sync(), options);
      this.motion.addEventListener('change', () => { this.pause(); }, options);
      this.observer = new IntersectionObserver(entries => {
        this.visible = entries[0].isIntersecting;
        this.sync();
      });
      this.observer.observe(this);
      this.preload = new Image();
      this.preload.onload = () => {
        if (!this.isConnected) return;
        this.loaded = true;
        this.button.hidden = false;
        this.dataset.ready = 'true';
        this.seek(0);
        this.sync();
      };
      this.preload.onerror = () => { this.failed = true; this.dataset.state = 'error'; this.button.hidden = true; };
      this.preload.src = this.image.getAttribute('href');
      this.sync();
    }
    disconnectedCallback() {
      this.stop();
      this.observer?.disconnect();
      this.controller?.abort();
      if (this.preload) this.preload.onload = this.preload.onerror = null;
      this.controller = null;
    }
    stop() { clearTimeout(this.timer); this.timer = null; this.last = null; }
    play() { this.wanted = true; this.sync(); }
    pause() { this.wanted = false; this.sync(); }
    seek(frame) {
      if (!Number.isInteger(frame) || frame < 0 || frame >= this.count) throw new RangeError('Frame outside sequence');
      this.elapsed = this.durations.slice(0, frame).reduce((sum, value) => sum + value, 0);
      this.last = null;
      this.draw(frame);
    }
    draw(frame) {
      this.frame = frame;
      this.image.setAttribute('x', -(frame % this.columns) * this.width);
      this.image.setAttribute('y', -Math.floor(frame / this.columns) * this.height);
      this.dataset.frame = String(frame);
    }
    sync() {
      this.stop();
      const running = this.loaded && this.visible && !document.hidden && this.wanted;
      this.dataset.state = this.failed ? 'error' : running ? 'playing' : this.wanted ? 'suspended' : 'paused';
      if (this.button) {
        this.button.setAttribute('aria-label', this.wanted ? 'Pause SP screen animation' : 'Play SP screen animation');
        this.button.title = this.wanted ? 'Pause animation' : 'Play animation';
      }
      if (running) this.tick();
    }
    tick() {
      const now = performance.now();
      if (this.last !== null) this.elapsed += now - this.last;
      this.last = now;
      if (!this.hasAttribute('loop') && this.elapsed >= this.duration) {
        this.draw(this.count - 1);
        this.elapsed = 0;
        this.pause();
        return;
      }
      this.elapsed %= this.duration;
      let remaining = this.elapsed, frame = 0;
      while (frame < this.count - 1 && remaining >= this.durations[frame]) remaining -= this.durations[frame++];
      if (frame !== this.frame) this.draw(frame);
      this.timer = setTimeout(() => this.tick(), Math.max(1, this.durations[frame] - remaining));
    }
  }
  customElements.define('sp-display', SPDisplay);
})();
