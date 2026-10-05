/* TEA globe arcs: draws gold arcs between study languages on a canvas
   with id="tea-globe" sitting on top of images/tea/globe-base.png and
   under images/tea/globe-languages.png. Container must be square.
   Static arcs under prefers-reduced-motion. Pauses when offscreen. */
(function () {
  var cv = document.getElementById("tea-globe");
  if (!cv) return;
  var R = 4, D = 14.5, H = 1080, CX = 1500, CY = 540, BX = 1020, BY = 90, BW = 900, CYC = 12, LW = 2.5;
  var F = (H / 2) / Math.tan(20 * Math.PI / 180);
  function ll(a, o, r) { var p = (90 - a) * Math.PI / 180, t = (o + 180) * Math.PI / 180; return [-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dt(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cr(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function sc(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function nm(a) { return sc(a, 1 / Math.sqrt(dt(a, a))); }
  var C = ll(40, 55, D), f = nm(sc(C, -1)), rt = nm(cr(f, [0, 1, 0])), up = cr(rt, f);
  function pj(P) {
    var v = sub(P, C), z = dt(v, f), L = Math.sqrt(dt(v, v)), n = sc(v, 1 / L), b = dt(C, n), c = dt(C, C) - R * R, q = b * b - c, o = false;
    if (q > 0) { var t1 = -b - Math.sqrt(q); if (t1 > 0 && t1 < L - 1e-4) o = true; }
    return [CX + F * dt(v, rt) / z - BX, CY - F * dt(v, up) / z - BY, o];
  }
  var N = { English: [51.51, -0.13], Mandarin: [39.90, 116.41], Cantonese: [22.32, 114.17], Korean: [37.57, 126.98], Hindi: [28.61, 77.21], Urdu: [31.52, 74.36], Punjabi: [31.63, 74.87], Burmese: [16.87, 96.20], Macedonian: [41.99, 21.43], Serbian: [44.79, 20.45], Croatian: [45.81, 15.98], Hungarian: [47.50, 19.04], Persian: [35.69, 51.39], Italian: [41.90, 12.50] };
  var S = [["English","Mandarin"],["Hindi","Urdu"],["English","Macedonian"],["Mandarin","Cantonese"],["English","Persian"],["Serbian","Croatian"],["English","Korean"],["Persian","Hindi"],["English","Burmese"],["Croatian","Macedonian"],["English","Punjabi"],["English","Hungarian"],["Urdu","Punjabi"],["English","Italian"],["Serbian","Macedonian"],["English","Hindi"]];
  var A = S.map(function (p, k) {
    var a = ll(N[p[0]][0], N[p[0]][1], R * 1.012), b = ll(N[p[1]][0], N[p[1]][1], R * 1.012), ab = sub(a, b), d = Math.sqrt(dt(ab, ab));
    var m = sc(nm(sc([a[0] + b[0], a[1] + b[1], a[2] + b[2]], .5)), R + d * 0.28), pts = [];
    for (var i = 0; i < 64; i++) { var t = i / 63, u = 1 - t; pts.push(pj([u*u*a[0] + 2*u*t*m[0] + t*t*b[0], u*u*a[1] + 2*u*t*m[1] + t*t*b[1], u*u*a[2] + 2*u*t*m[2] + t*t*b[2]])); }
    return { p: pts, s: k * 0.75, l: 2.6 + ((k * 0.618034) % 1) * 1.6 };
  });
  var g = cv.getContext("2d"), k = 1;
  function size() { var r = window.devicePixelRatio || 1, w = Math.max(1, Math.round(cv.clientWidth * r)), h = Math.max(1, Math.round(cv.clientHeight * r)); if (cv.width !== w) cv.width = w; if (cv.height !== h) cv.height = h; k = w / BW; }
  function arc(p, fr, op) {
    var n = fr * 63, last = Math.floor(n), e = n - last, on = false;
    g.strokeStyle = "rgba(245,200,66," + op.toFixed(3) + ")"; g.beginPath();
    for (var i = 0; i <= last; i++) { var q = p[i]; if (q[2]) { on = false; continue; } if (on) g.lineTo(q[0], q[1]); else { g.moveTo(q[0], q[1]); on = true; } }
    if (last < 63 && e > 0 && on) { var a = p[last], b = p[last + 1]; if (!b[2]) g.lineTo(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e); }
    g.stroke();
  }
  function prep() { size(); g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); g.setTransform(k,0,0,k,0,0); g.lineWidth = LW; g.lineCap = "round"; g.lineJoin = "round"; }
  function frame(T) { prep(); for (var j = 0; j < A.length; j++) { var r = A[j], age = ((T - r.s) % CYC + CYC) % CYC; if (age >= r.l) continue; var x = age / r.l, fr = Math.min(1, x / 0.55), op = x < 0.15 ? x / 0.15 * 0.8 : (x > 0.7 ? (1 - x) / 0.3 * 0.8 : 0.8); arc(r.p, fr, op); } }
  function still() { prep(); for (var j = 0; j < A.length; j++) arc(A[j].p, 1, 0.6); }
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if (mq && mq.matches) { still(); window.addEventListener("resize", still); return; }
  var visible = true, raf = null;
  function loop(ms) { if (!visible) { raf = null; return; } frame((ms / 1000) % CYC); raf = requestAnimationFrame(loop); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
  }
  raf = requestAnimationFrame(loop);
})();
