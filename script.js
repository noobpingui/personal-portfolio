/* ================================================================
   THEME TOGGLE — Vanilla JS, zero dependencies.
   (See bottom of file for particle network + scroll reveal)

   Logic:
   1. On click: flip data-theme attribute on <html>
   2. Persist choice in localStorage
   3. Update aria-label for screen readers
   (OS preference + anti-FOUC are handled by the inline <head> script)
================================================================ */

(function () {
  var root = document.documentElement;
  var btn  = document.getElementById('themeToggle');

  if (!btn) return; // Guard — button must exist

  /* Sync aria-label to the current theme on page load */
  function syncLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  syncLabel();

  btn.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    syncLabel();
  });
}());


/* ================================================================
   PARTICLE NETWORK — Floating dots in the hero canvas.
   Nearby pairs are connected by fading lines.
   Colours mirror the active theme on every frame.
================================================================ */

(function () {
  var canvas = document.getElementById('particles-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx    = canvas.getContext('2d');
  var COUNT  = 55;
  var DIST   = 120;  /* Max px before a line is drawn */
  var parts  = [];

  function dark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r  = Math.random() * 1.5 + 0.8;
  }

  Particle.prototype.step = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
  };

  function init() {
    parts = [];
    for (var i = 0; i < COUNT; i++) parts.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Theme-aware colour channels */
    var d = dark();
    var r = d ? 96  : 0;
    var g = d ? 165 : 112;
    var b = d ? 250 : 243;

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.step();

      /* Dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (d ? 0.45 : 0.3) + ')';
      ctx.fill();

      /* Lines to nearby dots */
      for (var j = i + 1; j < parts.length; j++) {
        var q  = parts[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DIST) {
          var alpha = (1 - dist / DIST) * (d ? 0.3 : 0.18);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', function () {
    resize();
    init();
  });
}());


/* ================================================================
   SCROLL REVEAL — IntersectionObserver fades + slides elements in
   as they enter the viewport. Cards in a row stagger by column.
================================================================ */

(function () {
  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.section__header, .skill-card, .project-card, .about__content, .contact-list'
  );

  /* Stagger cards within each 3-column grid row */
  document.querySelectorAll('.skill-card, .project-card').forEach(function (card, i) {
    card.style.transitionDelay = ((i % 3) * 0.12) + 's';
  });

  /* Add the hidden-state class now that JS is running */
  targets.forEach(function (el) { el.classList.add('reveal'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(function (el) { observer.observe(el); });
}());
