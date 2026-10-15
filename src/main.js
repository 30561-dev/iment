'use strict';

/* ── Visibility guard ─────────────────────────────────────── */
document.body.style.opacity = '0';
var _bodyFallback = setTimeout(function() {
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';
}, 2500);

/* Graceful degradation if GSAP failed to load */
if (typeof gsap === 'undefined') {
  clearTimeout(_bodyFallback);
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';
  window.gsap = {
    registerPlugin: function() {},
    to: function() {},
    from: function() {},
    fromTo: function() {},
    set: function() {},
    timeline: function() {
      var t = { from: function() { return t; }, defaults: function() { return t; } };
      return t;
    },
    ticker: { add: function() {} },
  };
  window.ScrollTrigger = { create: function() {}, refresh: function() {} };
}

gsap.registerPlugin(ScrollTrigger);

var NO_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ── Theme toggle ─────────────────────────────────────────── */
(function() {
  var toggle = document.getElementById('theme-toggle');
  var root   = document.documentElement;
  var KEY    = 'iment-tech-theme';

  if (localStorage.getItem(KEY) === 'light') {
    root.setAttribute('data-theme', 'light');
    toggle.setAttribute('aria-label', 'Alternar para tema escuro');
  }

  toggle.addEventListener('click', function() {
    root.classList.add('theme-transitioning');
    var isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem(KEY, 'dark');
      toggle.setAttribute('aria-label', 'Alternar para tema claro');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem(KEY, 'light');
      toggle.setAttribute('aria-label', 'Alternar para tema escuro');
    }
    setTimeout(function() { root.classList.remove('theme-transitioning'); }, 350);
  });
})();

/* ── Page reveal ──────────────────────────────────────────── */
gsap.to('body', {
  opacity: 1, duration: 0.5, ease: 'none',
  onComplete: function() { clearTimeout(_bodyFallback); },
});

/* ── Nav scroll ───────────────────────────────────────────── */
var nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top -28',
  onEnter:     function() { nav.classList.add('scrolled'); },
  onLeaveBack: function() { nav.classList.remove('scrolled'); },
});

/* ── Mobile nav ───────────────────────────────────────────── */
var burger    = document.getElementById('burger');
var mobileNav = document.getElementById('mobile-nav');
burger.addEventListener('click', function() {
  var open = mobileNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileNav.querySelectorAll('a').forEach(function(a) {
  a.addEventListener('click', function() {
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active nav links ─────────────────────────────────────── */
document.querySelectorAll('section[id]').forEach(function(s) {
  ScrollTrigger.create({
    trigger: s,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter:     function() { setActive(s.id); },
    onEnterBack: function() { setActive(s.id); },
  });
});
function setActive(id) {
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.removeAttribute('aria-current');
    if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'page');
  });
}

/* ── ScrollTrigger: refresh on font load + resize ────────── */
document.fonts.ready.then(function() { ScrollTrigger.refresh(); });
var _resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function() { ScrollTrigger.refresh(); }, 250);
});

/* ── Build H1 with mask lines ────────────────────────────── */
(function() {
  var h1 = document.querySelector('#hero h1');
  var lines = ['Transformamos ideias', 'em ecossistemas', 'digitais.'];
  h1.innerHTML = lines.map(function(l) {
    return '<div class="h1-line"><span>' + l + '</span></div>';
  }).join('');
})();

/* ══════════════════════════════════════════════════════════ */
/* Motion-guarded animations                                  */
/* ══════════════════════════════════════════════════════════ */
if (!NO_MOTION) {

  /* ── Scroll progress bar ──────────────────────────────── */
  gsap.to('#progress-bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });

  /* ── Hero cursor glow (desktop only) ─────────────────── */
  if (isHoverDevice) {
    var heroEl = document.getElementById('hero');
    var glowEl = document.getElementById('cursor-glow');
    heroEl.addEventListener('mousemove', function(e) {
      document.body.classList.add('hero-hover');
      gsap.to(glowEl, { left: e.clientX, top: e.clientY, duration: 0.5, ease: 'power2.out' });
    });
    heroEl.addEventListener('mouseleave', function() {
      document.body.classList.remove('hero-hover');
    });
  }

  /* ── Hero entrance ────────────────────────────────────── */
  var heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  heroTl
    .from('.hero-tag', { opacity: 0, y: -14, duration: 0.6, delay: 0.2 })
    .from('.h1-line > span', {
      y: '108%', opacity: 0.3,
      stagger: 0.13, duration: 1,
    }, '-=0.3')
    .from('#hero p.sub', { opacity: 0, y: 20, duration: 0.75 }, '-=0.55')
    .from('.hero-actions .btn-magnetic-wrap', {
      opacity: 0, y: 12, scale: 0.97,
      stagger: 0.1, duration: 0.65,
    }, '-=0.5')
    .from('.eco-visual', { opacity: 0, duration: 1.2 }, '-=1.2');

  /* ── Orbital ecosystem animation ─────────────────────── */
  var _ecoVis  = document.querySelector('.eco-visual');
  var CENTER_X = (_ecoVis ? _ecoVis.offsetWidth  : 440) / 2;
  var CENTER_Y = (_ecoVis ? _ecoVis.offsetHeight : 440) / 2;
  var ORBIT_R  = Math.round(CENTER_X * 0.795);
  var nodes    = [
    document.getElementById('node-0'),
    document.getElementById('node-1'),
    document.getElementById('node-2'),
  ];
  var OFFSETS = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  var linesSvg = document.getElementById('eco-lines');
  var lineEls  = nodes.map(function(_, i) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'oklch(0.55 0.22 248 / 0.15)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '4 6');
    linesSvg.appendChild(line);
    return line;
  });

  gsap.ticker.add(function(time) {
    nodes.forEach(function(node, i) {
      var angle = time * 0.25 + OFFSETS[i];
      var nx = CENTER_X + Math.cos(angle) * ORBIT_R;
      var ny = CENTER_Y + Math.sin(angle) * ORBIT_R;
      gsap.set(node, { x: nx - CENTER_X, y: ny - CENTER_Y });
      lineEls[i].setAttribute('x1', CENTER_X);
      lineEls[i].setAttribute('y1', CENTER_Y);
      lineEls[i].setAttribute('x2', nx);
      lineEls[i].setAttribute('y2', ny);
    });
    gsap.set('.eco-ring-1', { rotation: time * 8 });
    gsap.set('.eco-ring-2', { rotation: -(time * 5) });
  });

  gsap.to('#eco-glow', {
    scale: 1.4, opacity: 0,
    duration: 2.2, repeat: -1, ease: 'power2.out',
  });

  /* ── Manifesto ────────────────────────────────────────── */
  gsap.from('.manifesto-statement', {
    scale: 0.96, opacity: 0, filter: 'blur(6px)',
    duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
  });
  gsap.from('.manifesto-sub', {
    opacity: 0, y: 20, duration: 0.8,
    delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 70%' },
  });
  gsap.from('.manifesto-side .label, .manifesto-side .side-line', {
    opacity: 0, x: -18,
    stagger: 0.15, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#manifesto', start: 'top 72%' },
  });

  /* ── Ecossistema: entrance animations ────────────────── */
  gsap.from('.eco-section-head', {
    y: 28, opacity: 0, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#ecossistema', start: 'top 78%' },
  });
  gsap.from('.eco-item', {
    y: 30, opacity: 0,
    stagger: 0.12, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#ecossistema', start: 'top 72%' },
  });

  /* ── Integramente ─────────────────────────────────────── */
  gsap.from('.integ-label, .integ-content h2', {
    y: 36, opacity: 0,
    stagger: 0.1, duration: 0.85, ease: 'power3.out',
    scrollTrigger: { trigger: '#integramente', start: 'top 72%' },
  });
  gsap.from('.integ-content p, .integ-quote', {
    y: 24, opacity: 0,
    stagger: 0.11, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#integramente', start: 'top 65%' },
  });
  gsap.from('.phone-wrap', {
    y: 80, opacity: 0, scale: 0.96,
    duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#integramente', start: 'top 68%' },
  });
  gsap.from('.ph-card', {
    x: 24, opacity: 0,
    stagger: 0.12, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: '#integramente', start: 'top 56%' },
  });
  document.querySelectorAll('.ph-prog-fill').forEach(function(bar) {
    var pct = parseFloat(bar.dataset.width) / 100;
    gsap.to(bar, {
      scaleX: pct, duration: 1.5, ease: 'power2.out', delay: 0.3,
      scrollTrigger: { trigger: '#integramente', start: 'top 54%', toggleActions: 'play none none none' },
    });
  });

  /* ── Parceria ─────────────────────────────────────────── */
  gsap.from('.parceria-head', {
    y: 32, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#parceria', start: 'top 76%' },
  });
  gsap.from('.reason', {
    y: 36, opacity: 0,
    stagger: 0.14, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.reasons-grid', start: 'top 78%' },
  });
  document.querySelectorAll('.reason-num').forEach(function(el, i) {
    var t = parseInt(el.dataset.target, 10);
    var c = { val: 0 };
    gsap.to(c, {
      val: t, duration: 1.4, delay: i * 0.14, ease: 'power2.out',
      onUpdate: function() { el.textContent = String(Math.round(c.val)).padStart(2, '0'); },
      scrollTrigger: { trigger: '.reasons-grid', start: 'top 78%', toggleActions: 'play none none none' },
    });
  });

  /* ── FAQ ──────────────────────────────────────────────── */
  gsap.from('.faq-inner h2', {
    y: 28, opacity: 0, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#faq', start: 'top 78%' },
  });
  gsap.from('.faq-item', {
    y: 18, opacity: 0,
    stagger: 0.09, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: '#faq', start: 'top 74%' },
  });

  /* ── CTA final ────────────────────────────────────────── */
  gsap.from('#contato h2', {
    y: 50, opacity: 0, scale: 0.97, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });
  gsap.from('#contato p', {
    y: 28, opacity: 0, duration: 0.8,
    delay: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });
  gsap.from('#contato .btn-magnetic-wrap', {
    scale: 0.9, opacity: 0, duration: 0.75,
    delay: 0.22, ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '#contato', start: 'top 72%' },
  });

} /* end !NO_MOTION */

/* ══════════════════════════════════════════════════════════ */
/* Ecossistema: hover (desktop) + tap (touch) — sempre ativo  */
/* ══════════════════════════════════════════════════════════ */
(function() {
  var ecoItems = document.querySelectorAll('.eco-item');

  /* Desktop hover — only when screen is wider than the mobile breakpoint */
  if (isHoverDevice && window.innerWidth > 960) {
    document.querySelectorAll('.eco-item-desc').forEach(function(d) {
      gsap.set(d, { opacity: 0, y: NO_MOTION ? 0 : 4 });
    });
    if (!NO_MOTION) {
      document.querySelectorAll('.eco-item-arrow').forEach(function(a) {
        gsap.set(a, { opacity: 0 });
      });
    }

    ecoItems.forEach(function(item) {
      var desc  = item.querySelector('.eco-item-desc');
      var arrow = item.querySelector('.eco-item-arrow');
      var title = item.querySelector('.eco-item-title');
      var naturalColor = window.getComputedStyle(title).color;

      item.addEventListener('mouseenter', function() {
        if (desc)  gsap.to(desc,  { opacity: 1, y: 0, duration: NO_MOTION ? 0 : 0.28, ease: 'power2.out' });
        if (arrow && !NO_MOTION) gsap.to(arrow, { opacity: 1, duration: 0.25, ease: 'power2.out' });
        ecoItems.forEach(function(other) {
          if (other !== item) gsap.to(other, { opacity: 0.3, duration: NO_MOTION ? 0 : 0.22 });
        });
        gsap.to(title, { color: 'oklch(0.64 0.22 248)', duration: NO_MOTION ? 0 : 0.2 });
      });

      item.addEventListener('mouseleave', function() {
        if (desc)  gsap.to(desc,  { opacity: 0, y: NO_MOTION ? 0 : 4, duration: NO_MOTION ? 0 : 0.2 });
        if (arrow && !NO_MOTION) gsap.to(arrow, { opacity: 0, duration: 0.2 });
        ecoItems.forEach(function(other) { gsap.to(other, { opacity: 1, duration: NO_MOTION ? 0 : 0.25 }); });
        gsap.to(title, {
          color: naturalColor,
          duration: NO_MOTION ? 0 : 0.2,
          ease: 'power2.out',
          onComplete: function() { gsap.set(title, { clearProps: 'color' }); },
        });
      });
    });
  }

  /* Mobile tap — always registered; acts only when in mobile layout */
  ecoItems.forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth > 960) return;
      var wasExpanded = item.classList.contains('expanded');
      ecoItems.forEach(function(i) { i.classList.remove('expanded'); });
      if (!wasExpanded) { item.classList.add('expanded'); }
    });
  });
})();

/* ══════════════════════════════════════════════════════════ */
/* FAQ Accordion — sempre ativo                               */
/* ══════════════════════════════════════════════════════════ */
document.querySelectorAll('.faq-q').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var item   = btn.closest('.faq-item');
    var body   = item.querySelector('.faq-body');
    var toggle = item.querySelector('.faq-toggle');
    var wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(function(o) {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      if (!NO_MOTION) {
        gsap.to(o.querySelector('.faq-body'),   { height: 0, duration: 0.35, ease: 'power3.inOut' });
        gsap.to(o.querySelector('.faq-toggle'), { rotation: 0, duration: 0.3 });
      } else {
        o.querySelector('.faq-body').style.height = '0';
      }
    });

    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      if (!NO_MOTION) {
        gsap.set(body, { height: 'auto' });
        var h = body.offsetHeight;
        gsap.fromTo(body, { height: 0 }, { height: h, duration: 0.44, ease: 'power3.out' });
        gsap.to(toggle, { rotation: 45, duration: 0.35, ease: 'power3.out' });
      } else {
        body.style.height = 'auto';
      }
    }
  });
});
