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

  // 지금 보고 있는 섹션을 상단 메뉴에 표시
  var links = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var secs = Array.prototype.filter.call(document.querySelectorAll('main section[id]'), function (s) { return links[s.id]; });
  var current = null;
  function markNav() {
    var line = 90, found = null;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) found = s.id; });
    // 맨 아래까지 내리면 마지막 섹션
    if (secs.length && innerHeight + scrollY >= document.documentElement.scrollHeight - 2) found = secs[secs.length - 1].id;
    if (found === current) return;
    if (current && links[current]) { links[current].classList.remove('on'); links[current].removeAttribute('aria-current'); }
    current = found;
    if (!current) return;
    var a = links[current];
    a.classList.add('on');
    a.setAttribute('aria-current', 'true');
    var box = a.parentNode;
    var left = a.offsetLeft - box.offsetLeft;
    if (left < box.scrollLeft || left + a.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: left - 16, behavior: 'smooth' });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; markNav(); });
  }, { passive: true });
  markNav();

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
  var survey = [
    { name: '밸런스', c: 'var(--s1)', v: [2.8, 3.0, 3.4] },
    { name: '다양성', c: 'var(--s3)', v: [null, 3.4, 3.6] },
    { name: '재미', c: 'var(--s2)', v: [3.5, 4.1, 4.0] }
  ];
  function drawSurvey(g, xs, endX, showVals) {
    var sy = function (v) { return 185 - (v - 2.5) * 100; };
    survey.forEach(function (s) {
      var pts = [];
      s.v.forEach(function (v, i) { if (v != null) pts.push([xs[i], sy(v), v, i]); });
      el('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: s.c, 'stroke-width': 2 }, g);
      pts.forEach(function (p, k) {
        el('title', {}, el('circle', { cx: p[0], cy: p[1], r: 5, fill: s.c, stroke: 'var(--surface)', 'stroke-width': 2 }, g), s.name + ' M' + (p[3] + 1) + ' ' + p[2].toFixed(1));
        if (showVals && k < pts.length - 1) el('text', { x: p[0], y: p[1] - 11, 'text-anchor': 'middle', 'class': 'ti' }, g, p[2].toFixed(1));
      });
      var last = pts[pts.length - 1];
      el('text', { x: endX, y: last[1] + 4, 'class': 'ti' }, g, s.name + ' ' + last[2].toFixed(1));
    });
  }
  var slope = document.getElementById('slope');
  if (slope) drawSurvey(slope, [56, 146, 236], 248, false);
  // 일정 + 설문 한 그래프 (10/6 = 0일, x = 60 + 일 × 10.4, 점수 2.5~4.5 → y 200~20)
  var tl = document.getElementById('timeline');
  if (tl) {
    var dx = function (d) { return 60 + d * 10.4; };
    var vy = function (v) { return 200 - (v - 2.5) * 90; };
    [['M1 개발', 0, 17, '10/6 ~ 10/22'], ['M2 개발', 20, 31, '10/26 ~ 11/5'], ['M3 폴리싱', 34, 45, '11/9 ~ 11/19']].forEach(function (b) {
      el('title', {}, el('rect', { x: dx(b[1]), y: 20, width: dx(b[2]) - dx(b[1]), height: 180, rx: 4, fill: 'var(--surface-2)' }, tl), b[0] + ' ' + b[3]);
      el('text', { x: dx(b[1]) + 8, y: 36, 'class': 't' }, tl, b[0]);
    });
    [3.0, 3.5, 4.0].forEach(function (v) {
      el('line', { x1: 60, y1: vy(v), x2: 560, y2: vy(v), 'class': 'gl' }, tl);
      el('text', { x: 50, y: vy(v) + 4, 'text-anchor': 'end', 'class': 't' }, tl, v.toFixed(1));
    });
    el('line', { x1: 60, y1: 200, x2: 560, y2: 200, 'class': 'ax' }, tl);
    [[17, '10/23'], [31, '11/6'], [44, '11/19'], [48, '11/23']].forEach(function (t) {
      var x = dx(t[0]);
      el('title', {}, el('rect', { x: x - 5, y: 195, width: 10, height: 10, fill: 'var(--muted)', stroke: 'var(--surface)', 'stroke-width': 2, transform: 'rotate(45 ' + x + ' 200)' }, tl), '플레이테스트 ' + t[1]);
      el('text', { x: x, y: 224, 'text-anchor': 'middle', 'class': 't' }, tl, t[1]);
    });
    el('text', { x: 60, y: 224, 'text-anchor': 'middle', 'class': 't' }, tl, '10/6');
    var days = [17, 31, 48];
    survey.forEach(function (s) {
      var pts = [];
      s.v.forEach(function (v, i) { if (v != null) pts.push([dx(days[i]), vy(v), v, i]); });
      el('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: s.c, 'stroke-width': 2 }, tl);
      pts.forEach(function (p) {
        el('title', {}, el('circle', { cx: p[0], cy: p[1], r: 5, fill: s.c, stroke: 'var(--surface)', 'stroke-width': 2 }, tl), s.name + ' M' + (p[3] + 1) + ' ' + p[2].toFixed(1));
      });
      var last = pts[pts.length - 1];
      el('text', { x: last[0] + 12, y: last[1] + 4, 'class': 'ti' }, tl, s.name + ' ' + last[2].toFixed(1));
    });
  }

  // 명중 계수
  var hit = document.getElementById('hit');
  if (hit) {
    [['즉발', 1.0], ['투사체', 0.8], ['지연, 장판, 돌진', 0.6], ['설치', 0.4]].forEach(function (h, i) {
      var y = 14 + i * 36;
      el('text', { x: 96, y: y + 16, 'text-anchor': 'end', 'class': 't' }, hit, h[0]);
      el('title', {}, el('rect', { x: 104, y: y, width: h[1] * 180, height: 22, rx: 4, fill: 'var(--s1)', 'fill-opacity': (0.45 + h[1] * 0.55).toFixed(2) }, hit), h[0] + ' ' + h[1].toFixed(1));
      el('text', { x: 104 + h[1] * 180 + 8, y: y + 16, 'class': 'ti' }, hit, h[1].toFixed(1));
    });
  }

  // 음량 와플
  document.querySelectorAll('.waffle').forEach(function (w) {
    var off = +w.dataset.off;
    for (var k = 0; k < 32; k++) { var c = document.createElement('i'); if (k >= 32 - off) c.className = 'off'; w.appendChild(c); }
  });
})();
