/*
  Animierter "Beams"-Hintergrund fürs Admin-Panel (Startseite + Login),
  in den Grüntönen des Logos. Plain-JS-Port der BeamsBackground-Komponente
  (Canvas, ohne React/motion).

  - läuft nur, wenn kein Editor offen ist (spart Akku am Handy)
  - prefers-reduced-motion: ein stehendes Bild statt Animation
*/
(function () {
  var canvas = document.createElement('canvas');
  canvas.className = 'mg-beams';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BEAMS = 30;
  var beams = [];
  var w = 0;
  var hgt = 0;
  var frame = 0;

  // Logo-Grün liegt bei ca. 90–110° Farbton
  function hue() {
    return 88 + Math.random() * 30;
  }

  function createBeam() {
    return {
      x: Math.random() * w * 1.5 - w * 0.25,
      y: Math.random() * hgt * 1.5 - hgt * 0.25,
      width: 30 + Math.random() * 60,
      length: hgt * 2.5,
      angle: -35 + Math.random() * 10,
      speed: 0.6 + Math.random() * 1.2,
      opacity: 0.12 + Math.random() * 0.16,
      hue: hue(),
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  function resetBeam(beam, index) {
    var column = index % 3;
    var spacing = w / 3;
    beam.y = hgt + 100;
    beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
    beam.width = 100 + Math.random() * 100;
    beam.speed = 0.5 + Math.random() * 0.4;
    beam.hue = 88 + (index * 30) / BEAMS;
    beam.opacity = 0.2 + Math.random() * 0.1;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    hgt = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = hgt * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    beams = [];
    for (var i = 0; i < BEAMS; i++) beams.push(createBeam());
    if (reduceMotion) draw();
  }

  function drawBeam(beam) {
    ctx.save();
    ctx.translate(beam.x, beam.y);
    ctx.rotate((beam.angle * Math.PI) / 180);
    var o = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);
    var c = 'hsla(' + beam.hue + ', 62%, 48%, ';
    var g = ctx.createLinearGradient(0, 0, 0, beam.length);
    g.addColorStop(0, c + '0)');
    g.addColorStop(0.1, c + o * 0.5 + ')');
    g.addColorStop(0.4, c + o + ')');
    g.addColorStop(0.6, c + o + ')');
    g.addColorStop(0.9, c + o * 0.5 + ')');
    g.addColorStop(1, c + '0)');
    ctx.fillStyle = g;
    ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, hgt);
    ctx.filter = 'blur(35px)';
    for (var i = 0; i < beams.length; i++) drawBeam(beams[i]);
  }

  // Im Editor (…/entries/…) ist der Hintergrund verdeckt -> Animation pausieren
  function visible() {
    return !/\/entries\//.test(location.hash) && document.visibilityState !== 'hidden';
  }

  function animate() {
    frame = requestAnimationFrame(animate);
    if (!visible()) return;
    for (var i = 0; i < beams.length; i++) {
      var b = beams[i];
      b.y -= b.speed;
      b.pulse += b.pulseSpeed;
      if (b.y + b.length < -100) resetBeam(b, i);
    }
    draw();
  }

  resize();
  window.addEventListener('resize', resize);
  if (reduceMotion) draw();
  else animate();
})();
