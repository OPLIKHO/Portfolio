(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(pointer: fine)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    if (!reduceMotion) initParticleNetwork();
    if (!reduceMotion && finePointer) {
      initCustomCursor();
      initTiltCards();
    }
    initTypewriter();
    initBootSequence();
  });

  /* ---------------------------------------------------------
     Particle network — connective "data grid" backdrop
     --------------------------------------------------------- */
  function initParticleNetwork() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticles() {
      var count = Math.min(70, Math.max(24, Math.floor((w * h) / 26000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.4 + 0.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      var linkDist = 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = 'rgba(0, 229, 255,' + (0.16 * (1 - dist / linkDist)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < particles.length; k++) {
        var pt = particles[k];
        ctx.fillStyle = 'rgba(143, 163, 196, 0.7)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    resize();
    makeParticles();
    requestAnimationFrame(step);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        makeParticles();
      }, 200);
    });
  }

  /* ---------------------------------------------------------
     Custom glowing cursor (desktop, fine-pointer only)
     --------------------------------------------------------- */
  function initCustomCursor() {
    document.documentElement.classList.add('has-fine-cursor');

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    var ringX = mouseX, ringY = mouseY;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    });

    document.addEventListener('mousedown', function () { document.body.classList.add('cursor-active'); });
    document.addEventListener('mouseup', function () { document.body.classList.remove('cursor-active'); });

    document.querySelectorAll('a, button, .work-card, .console-node').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-active'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-active'); });
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);
  }

  /* ---------------------------------------------------------
     3D tilt for the holo ID card
     --------------------------------------------------------- */
  function initTiltCards() {
    document.querySelectorAll('.id-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--ry', (px * 14) + 'deg');
        card.style.setProperty('--rx', (-py * 14) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------------------------------------------------
     Typewriter for elements with [data-type]
     --------------------------------------------------------- */
  function initTypewriter() {
    document.querySelectorAll('[data-type]').forEach(function (el) {
      var full = el.getAttribute('data-type');
      if (!full) return;

      if (reduceMotion) {
        el.textContent = full;
        return;
      }

      el.textContent = '';
      var cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      cursor.textContent = '\u00A0';
      el.parentNode.insertBefore(cursor, el.nextSibling);

      var i = 0;
      var speed = 22;
      (function typeNext() {
        if (i <= full.length) {
          el.textContent = full.slice(0, i);
          i++;
          setTimeout(typeNext, speed);
        } else {
          setTimeout(function () { cursor.style.display = 'none'; }, 1200);
        }
      })();
    });
  }

  /* ---------------------------------------------------------
     Boot sequence overlay (index.html only, once per session)
     --------------------------------------------------------- */
  function initBootSequence() {
    var overlay = document.getElementById('boot-overlay');
    if (!overlay) return;

    if (reduceMotion || sessionStorage.getItem('portfolioBootShown') === '1') {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
      return;
    }

    var lines = [
      'PORTFOLIO OS v2.100.4 — BOOTING',
      'LOADING IDENTITY MODULE ...... OK',
      'CALIBRATING HOLO-DISPLAY ...... OK',
      'ESTABLISHING SECURE LINK ...... OK',
      'ACCESS GRANTED — WELCOME'
    ];

    var container = document.createElement('div');
    overlay.innerHTML = '';
    overlay.appendChild(container);

    var i = 0;
    function nextLine() {
      if (i >= lines.length) {
        setTimeout(function () {
          overlay.classList.add('hidden');
          overlay.setAttribute('aria-hidden', 'true');
          sessionStorage.setItem('portfolioBootShown', '1');
        }, 500);
        return;
      }
      var div = document.createElement('div');
      div.className = 'boot-line' + (lines[i].indexOf('OK') > -1 || lines[i].indexOf('GRANTED') > -1 ? ' ok' : '');
      div.textContent = lines[i];
      container.appendChild(div);
      i++;
      setTimeout(nextLine, 360);
    }
    setTimeout(nextLine, 200);
  }
})();
