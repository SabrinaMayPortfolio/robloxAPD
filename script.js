// Minimal progressive enhancement: lightbox, missing-image placeholders, phase nav, clip pause.
(() => {
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Missing images become labeled placeholder boxes.
  const toPlaceholder = (img) => {
    if (img.dataset.failed) return;
    img.dataset.failed = '1';
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', 'Missing image: ' + img.alt);
    const label = document.createElement('span');
    label.className = 'ph-label';
    label.textContent = 'Image missing';
    const what = document.createElement('span');
    what.textContent = img.alt;
    const path = document.createElement('code');
    path.textContent = img.getAttribute('src');
    ph.append(label, what, path);
    const host = img.closest('.zoom') || img.closest('.crop') || img;
    const clipBtn = img.closest('.frame, .clip')?.querySelector('.clip-toggle');
    if (clipBtn) clipBtn.remove();
    host.replaceWith(ph);
  };
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) toPlaceholder(img);
    else img.addEventListener('error', () => toPlaceholder(img), { once: true });
  });

  // Lightbox (native dialog: focus is trapped and Escape closes).
  const dialog = document.getElementById('lightbox');
  if (dialog) {
    const big = dialog.querySelector('img');
    const cap = dialog.querySelector('.lightbox-caption');
    let trigger = null;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-zoom]');
      if (!btn) return;
      const img = btn.querySelector('img');
      if (!img) return;
      trigger = btn;
      big.src = img.dataset.anim || img.currentSrc || img.src;
      big.alt = img.alt;
      const fc = btn.closest('figure')?.querySelector('figcaption');
      cap.textContent = fc ? fc.textContent.replace(/\s+/g, ' ').trim() : img.alt;
      dialog.showModal();
      dialog.querySelector('.lightbox-close').focus();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.classList.contains('lightbox-stage') || e.target.closest('.lightbox-close')) dialog.close();
    });
    dialog.addEventListener('close', () => {
      big.removeAttribute('src');
      if (trigger) trigger.focus();
    });
  }

  // Animated clips: Pause swaps the animated webp for its still frame. Starts paused for reduced motion.
  document.querySelectorAll('.clip').forEach((frame) => {
    const img = frame.querySelector('img');
    const btn = frame.querySelector('.clip-toggle');
    if (!img || !btn || !img.dataset.still) return;
    const source = frame.querySelector('picture source');
    const anim = img.getAttribute('src');
    const still = img.dataset.still;
    let paused = false;
    const set = (p) => {
      paused = p;
      const src = p ? still : anim;
      if (source) source.srcset = src;
      img.src = src;
      btn.textContent = p ? 'Play' : 'Pause';
    };
    btn.addEventListener('click', () => set(!paused));
    set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  });

  // Videos: fall back to the poster still when the browser can't play them; paused for reduced motion.
  const toStill = (v) => {
    if (!v.isConnected || !v.poster) return;
    const img = document.createElement('img');
    img.src = v.poster;
    img.alt = v.getAttribute('aria-label') || '';
    img.decoding = 'async';
    img.className = 'video-still';
    v.closest('.clip')?.querySelector('.clip-toggle')?.remove();
    v.replaceWith(img);
  };
  document.querySelectorAll('video').forEach((v) => {
    const type = v.dataset.type;
    if (type && !v.canPlayType(type)) { toStill(v); return; }
    v.addEventListener('error', () => toStill(v));
    if (v.error || v.networkState === 3) { toStill(v); return; }
    if (reduceMotion.matches) { v.removeAttribute('autoplay'); v.pause(); }
  });
  window.addEventListener('load', () => {
    document.querySelectorAll('video').forEach((v) => { if (v.error || v.networkState === 3) toStill(v); });
  });
  document.querySelectorAll('.clip').forEach((frame) => {
    const v = frame.querySelector('video');
    const btn = frame.querySelector('.clip-toggle');
    if (!v || !btn) return;
    const sync = () => { btn.textContent = v.paused ? 'Play' : 'Pause'; };
    btn.textContent = reduceMotion.matches ? 'Play' : 'Pause';
    btn.addEventListener('click', () => { if (v.paused) v.play().catch(() => toStill(v)); else v.pause(); });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
  });

  // Live prototype frames: load the iframe when scrolled into view. Reduced motion and small screens keep the poster.
  const lives = document.querySelectorAll('.live[data-src]');
  if (lives.length) {
    const fit = (el) => { const f = el.querySelector('iframe'); if (f) f.style.transform = 'scale(' + el.clientWidth / 1440 + ')'; };
    const ro = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => fit(e.target))) : null;
    const load = (el) => {
      if (el.querySelector('iframe') || reduceMotion.matches || window.innerWidth < 700) return;
      const f = document.createElement('iframe');
      f.title = 'Waypoint live prototype';
      if (el.classList.contains('live--deco')) { f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); }
      f.addEventListener('load', () => el.classList.add('is-loaded'));
      f.src = el.dataset.src;
      el.prepend(f);
      fit(el);
      if (ro) ro.observe(el);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } }), { rootMargin: '200px 0px' });
      lives.forEach((el) => io.observe(el));
    } else lives.forEach(load);
  }

  // Landing nav: highlight the section currently in view.
  const heroBar = document.querySelector('.site-bar--over-hero');
  if (heroBar) {
    const navLinks = [...heroBar.querySelectorAll('.site-nav a[href^="#"]')];
    const targets = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;
    const spy = () => {
      ticking = false;
      const line = heroBar.getBoundingClientRect().bottom + window.innerHeight * 0.25;
      let id = null;
      targets.forEach((t) => { if (t.getBoundingClientRect().top <= line) id = t.id; });
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    window.addEventListener('resize', spy);
    spy();
  }

  // Why Roblox zoom: nodes fade in once, in sequence. Skipped for reduced motion.
  const reach = document.querySelector('.reach');
  if (reach && 'IntersectionObserver' in window && !reduceMotion.matches) {
    reach.classList.add('is-pending');
    const ro = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { reach.classList.remove('is-pending'); ro.disconnect(); }
    }, { threshold: 0.25 });
    ro.observe(reach);
  }

  // Process timeline: markers appear one by one down the spine. Skipped for reduced motion.
  const tl2 = document.querySelector('.tl2');
  if (tl2 && 'IntersectionObserver' in window && !reduceMotion.matches) {
    tl2.classList.add('is-pending');
    const to = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { tl2.classList.remove('is-pending'); to.disconnect(); }
    }, { threshold: 0.15 });
    to.observe(tl2);
  }

  // Floating nav over the sky: firmer glass once the page scrolls.
  const bar = document.querySelector('.site-bar--over-hero');
  if (bar) {
    const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Ground parallax: the baseplate rises slightly faster than the scroll. Off for reduced motion.
  const ground = document.querySelector('[data-parallax]');
  if (ground && !reduceMotion.matches) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const rise = Math.min(window.scrollY * 0.12, 100);
      ground.style.setProperty('--rise', rise.toFixed(1) + 'px');
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // Phase nav: highlight current section, compact toggle on small screens.
  const nav = document.querySelector('.phase-nav');
  if (nav) {
    const links = [...nav.querySelectorAll('.phase-list a')];
    const current = nav.querySelector('.phase-current');
    const toggle = nav.querySelector('.phase-toggle');
    const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const setActive = (id) => {
      links.forEach((a) => {
        const on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) {
          a.setAttribute('aria-current', 'location');
          if (current) current.textContent = a.textContent.replace(/\s+/g, ' ').trim();
        } else a.removeAttribute('aria-current');
      });
    };
    // Active section = the last one whose top has passed a line just below the sticky bar
    // (kept below scroll-padding-top so a clicked section always becomes active).
    let navTick = false;
    const pick = () => {
      navTick = false;
      if (!sections.length) return;
      const line = Math.min(window.innerHeight * 0.25, 170);
      let current = sections[0];
      sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
      setActive(current.id);
    };
    const queue = () => { if (!navTick) { navTick = true; requestAnimationFrame(pick); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    pick();

    const close = () => { nav.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
    toggle?.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); toggle?.focus(); }
    });
  }
})();
