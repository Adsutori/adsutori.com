(function () {
  function getDotPoints(svg) {
    const svgRect = svg.getBoundingClientRect();

    return Array.from(document.querySelectorAll('.process__node .process__dot-num'))
      .map(dot => {
        const rect = dot.getBoundingClientRect();

        return {
          x: rect.left + rect.width / 2 - svgRect.left,
          y: rect.top + rect.height / 2 - svgRect.top,
        };
      });
  }

  function buildWavePath(points) {
    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      const distance = to.x - from.x;
      const lift = i % 2 === 0 ? -18 : 18;
      const dip = i % 2 === 0 ? 18 : -18;

      d += ` C ${from.x + distance * 0.28} ${from.y + lift}, ${from.x + distance * 0.38} ${from.y + lift}, ${from.x + distance * 0.5} ${from.y}`;
      d += ` C ${from.x + distance * 0.62} ${from.y + dip}, ${from.x + distance * 0.72} ${from.y + dip}, ${to.x} ${to.y}`;
    }

    return d;
  }

  function drawWave() {
    const svg = document.querySelector('.process__svg');
    const path = document.getElementById('slalomPath');
    const timeline = document.querySelector('.process__timeline');

    if (!svg || !path || !timeline || window.matchMedia('(max-width: 860px)').matches) {
      if (path) path.removeAttribute('d');
      return;
    }

    const points = getDotPoints(svg);
    path.setAttribute('d', buildWavePath(points));

    requestAnimationFrame(() => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = timeline.classList.contains('is-drawn') ? '0' : `${length}`;
      path.style.transition = 'stroke-dashoffset 1.35s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  function initDrawObserver() {
    const timeline = document.querySelector('.process__timeline');
    const path = document.getElementById('slalomPath');
    if (!timeline || !path) return;

    const revealLine = () => {
      timeline.classList.add('is-drawn');
      path.style.strokeDashoffset = '0';
    };

    const rect = timeline.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      revealLine();
      return;
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealLine();
          obs.disconnect();
        }
      });
    }, { threshold: 0.15 });

    obs.observe(timeline);
  }

  function initNodeObserver() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.process__node').forEach(node => obs.observe(node));
  }

  function initHover() {
    document.querySelectorAll('.process__node').forEach(node => {
      const dot = node.querySelector('.process__dot-num');
      if (!dot) return;

      node.addEventListener('mouseenter', () => {
        dot.style.background = 'var(--accent, #7B6EF6)';
        dot.style.color = '#fff';
      });

      node.addEventListener('mouseleave', () => {
        if (!node.classList.contains('is-active')) {
          dot.style.background = '';
          dot.style.color = '';
        }
      });
    });
  }

  function init() {
    requestAnimationFrame(() => {
      drawWave();
      initDrawObserver();
      initNodeObserver();
      initHover();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawWave, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
