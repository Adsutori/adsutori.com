(function () {

  function buildPath() {
    const svg   = document.querySelector('.process__svg');
    const path  = document.getElementById('slalomPath');
    const nodes = document.querySelectorAll('.process__node');
    if (!svg || !path || nodes.length < 2) return;

    const svgRect = svg.getBoundingClientRect();
    const pts = [];

    nodes.forEach(node => {
        const dot = node.querySelector('.process__dot-num');
        if (!dot) return;
        const r = dot.getBoundingClientRect();
        pts.push({
        x: r.left + r.width  / 2 - svgRect.left,
        y: r.top  + r.height / 2 - svgRect.top,
        });
    });

    if (pts.length < 2) return;

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

    for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        const dy = b.y - a.y;

        // Punkty kontrolne — tylko 25% drogi w pionie
        // dzięki temu łuk jest ciaśniejszy i nie wychodzi poza karty
        const cp1x = a.x;
        const cp1y = a.y + dy * 1.65;

        const cp2x = b.x;
        const cp2y = b.y - dy * 2;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},`
        + ` ${cp2x.toFixed(1)} ${cp2y.toFixed(1)},`
        + ` ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }

    path.setAttribute('d', d);

    // Animacja rysowania
    requestAnimationFrame(() => {
        const len = path.getTotalLength();
        if (!len) return;

        path.style.transition       = 'none';
        path.style.strokeDasharray  = len;
        path.style.strokeDashoffset = len;

        requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';

        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
            if (e.isIntersecting) {
                path.style.strokeDashoffset = '0';
                obs.disconnect();
            }
            });
        }, { threshold: 0.1 });

        const slalom = document.querySelector('.process__slalom');
        if (slalom) obs.observe(slalom);
        });
    });
  }


  function initNodeObserver() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-active');
          const dot = e.target.querySelector('.process__dot-num');
          if (dot) {
            dot.style.background = 'var(--accent, #7B6EF6)';
            dot.style.color      = '#fff';
          }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.process__node').forEach(n => obs.observe(n));
  }

  function init() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      buildPath();
      initNodeObserver();
    }));

    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(buildPath, 200);
    });
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);

})();
