(function () {
  // 테마 버튼
  var root = document.documentElement;
  var btn = document.getElementById('themeBtn');
  function isDark() { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function sync() { if (btn) btn.textContent = isDark() ? '라이트' : '다크'; }
  sync();
  if (btn) btn.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    sync();
  });

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  // 스킬별 기절량 (0~100 → x 76~316)
  var dumb = document.getElementById('dumb');
  if (dumb) {
    [['얼음화살', 10, 35], ['파이어볼', 25, 55], ['블랙홀', 36, 66], ['메테오', 40, 75], ['시한폭탄', 50, 70]].forEach(function (s, i) {
      var y = 36 + i * 34, x1 = 76 + s[1] * 2.4, x2 = 76 + s[2] * 2.4;
      el('text', { x: 66, y: y + 4, 'text-anchor': 'end', 'class': 't' }, dumb, s[0]);
      el('line', { x1: x1, y1: y, x2: x2, y2: y, stroke: 'var(--before)', 'stroke-width': 2 }, dumb);
      el('title', {}, el('circle', { cx: x1, cy: y, r: 6, fill: 'var(--before)', stroke: 'var(--surface)', 'stroke-width': 2 }, dumb), s[0] + ' M1 ' + s[1]);
      el('title', {}, el('circle', { cx: x2, cy: y, r: 7, fill: 'var(--s1)', stroke: 'var(--surface)', 'stroke-width': 2 }, dumb), s[0] + ' M2 ' + s[2]);
      el('text', { x: x2 + 12, y: y + 4, 'class': 'ti' }, dumb, s[2]);
    });
  }

  // 설문 점수 (2.5~4.0 → y 185~35)
  var slope = document.getElementById('slope');
  if (slope) {
    var xs = [56, 146, 236];
    var sy = function (v) { return 185 - (v - 2.5) * 100; };
    [
      { name: '밸런스', c: 'var(--s1)', v: [2.8, 3.0, 3.4] },
      { name: '다양성', c: 'var(--s3)', v: [null, 3.4, 3.6] },
      { name: '재미', c: 'var(--s2)', v: [3.5, 4.1, 4.0] }
    ].forEach(function (s) {
      var pts = [];
      s.v.forEach(function (v, i) { if (v != null) pts.push([xs[i], sy(v), v, i]); });
      el('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: s.c, 'stroke-width': 2 }, slope);
      pts.forEach(function (p) {
        el('title', {}, el('circle', { cx: p[0], cy: p[1], r: 5, fill: s.c, stroke: 'var(--surface)', 'stroke-width': 2 }, slope), s.name + ' M' + (p[3] + 1) + ' ' + p[2].toFixed(1));
      });
      var last = pts[pts.length - 1];
      el('text', { x: 248, y: last[1] + 4, 'class': 'ti' }, slope, s.name + ' ' + last[2].toFixed(1));
    });
  }

  // 명중 계수
  var hit = document.getElementById('hit');
  if (hit) {
    [['즉발', 1.0], ['투사체', 0.8], ['지연·장판·돌진', 0.6], ['설치', 0.4]].forEach(function (h, i) {
      var y = 14 + i * 36;
      el('text', { x: 96, y: y + 16, 'text-anchor': 'end', 'class': 't' }, hit, h[0]);
      el('title', {}, el('rect', { x: 104, y: y, width: h[1] * 180, height: 22, rx: 4, fill: 'var(--s1)', 'fill-opacity': (0.45 + h[1] * 0.55).toFixed(2) }, hit), h[0] + ' ' + h[1].toFixed(1));
      el('text', { x: 104 + h[1] * 180 + 8, y: y + 16, 'class': 'ti' }, hit, h[1].toFixed(1));
    });
  }

  // 효과음 파형 (설명용 그림)
  var before = [], after = [], i;
  for (i = 0; i < 30; i++) {
    before.push(Math.min(0.95, 0.15 + 0.75 * Math.exp(-Math.pow((i - 5) / 3, 2)) + 0.6 * Math.exp(-Math.pow((i - 14) / 4, 2)) + 0.08 * ((i * 7) % 3)));
  }
  for (i = 0; i < 15; i++) after.push(Math.max(0.12, 0.92 * Math.exp(-i / 4.5)));
  document.querySelectorAll('[data-wave]').forEach(function (n) {
    (n.dataset.wave === 'before' ? before : after).forEach(function (a) {
      var b = document.createElement('i'); b.style.height = Math.round(a * 100) + '%'; n.appendChild(b);
    });
  });

  // 음량 와플
  document.querySelectorAll('.waffle').forEach(function (w) {
    var off = +w.dataset.off;
    for (var k = 0; k < 32; k++) { var c = document.createElement('i'); if (k >= 32 - off) c.className = 'off'; w.appendChild(c); }
  });
})();
