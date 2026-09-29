/*
  Galerie-Layout-Editor für das Admin-Panel (Decap CMS Custom Widgets).

  - "galerie-layout": Layout-Vorlage als anklickbare Karten statt Dropdown
  - "galerie": kompakte Übersicht + Vollbild-Editor (Overlay) zum Sortieren
    per Drag & Drop (Maus + Touch, SortableJS) und Größe pro Bild;
    darunter die normale Decap-Liste zum Hochladen/Beschreiben/Löschen.

  Die Layout-Regeln (Vorlagen, Größen, Raster) müssen zu src/data/gallery.ts
  und den .gallery-grid-Styles in src/index.css passen.
*/
(function () {
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;
  var Sortable = window.Sortable;
  var list = CMS.getWidget('list');
  var ListControl = list.control;
  var select = CMS.getWidget('select');

  // Decap rendert ein Feld nicht neu, wenn sich ein Nachbarfeld ändert.
  // Layout-Feld und Galerie-Feld sprechen deshalb über Events miteinander.
  var LAYOUT_CHANGED = 'mosk-galerie-layout';
  var LAYOUT_SET = 'mosk-galerie-layout-set';

  var LAYOUTS = [
    { id: 'mosaik', name: 'Mosaik', desc: 'Natürliche Formate, versetzt' },
    { id: 'raster', name: 'Raster', desc: 'Gleichmäßig, Größen frei wählbar' },
    { id: 'highlight', name: 'Highlight', desc: 'Erstes Bild groß' },
  ];
  var SIZES = [
    { id: 'normal', name: 'Normal' },
    { id: 'breit', name: 'Breit' },
    { id: 'hoch', name: 'Hoch' },
    { id: 'gross', name: 'Groß' },
  ];
  var SIZE_NAME = { normal: 'Normal', breit: 'Breit', hoch: 'Hoch', gross: 'Groß' };

  function effectiveSize(layout, index, chosen) {
    if (layout === 'mosaik') return 'normal';
    if (chosen && SIZE_NAME[chosen]) return chosen;
    return layout === 'highlight' && index === 0 ? 'gross' : 'normal';
  }

  // Eigene Layouts: Muster als Text "gross,normal,breit" (siehe galerie-vorlagen.json)
  var VORLAGEN_URL = '/admin/galerie-vorlagen.json';

  function parsePattern(str) {
    return String(str || '')
      .split(',')
      .map(function (x) {
        return x.trim();
      })
      .filter(function (x) {
        return SIZE_NAME[x];
      });
  }

  function patternMatches(items, pattern) {
    if (!pattern.length || !items.length) return false;
    return items.every(function (item, i) {
      return (item.get('groesse') || 'normal') === pattern[i % pattern.length];
    });
  }

  function layoutName(id) {
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === id) return LAYOUTS[i].name;
    return 'Mosaik';
  }

  // Veröffentlichte Bilder live als kleine Vorschau über Netlifys Image CDN laden
  function previewUrl(path, width) {
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (!local && /^\/gallery\//.test(path)) {
      return '/.netlify/images?url=' + encodeURIComponent(path) + '&w=' + (width || 500) + '&q=70';
    }
    return path;
  }

  /* ---------- Styles (Farben aus dem Logo) ---------- */
  var css = `
  .mg{--g:#55a041;--g2:#4a8a38;--g3:#3e7530;--gs:rgba(85, 160, 65,.14);--ink:#1d2a1f;--mut:#6b7280;--line:#e3e7e1;font-family:inherit}
  .mg *{box-sizing:border-box}
  .mg button{font-family:inherit;cursor:pointer}
  .mg-btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:8px;padding:10px 16px;font-weight:600;font-size:14px;line-height:1}
  .mg-btn--primary{background:var(--g2);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,.2) inset}
  .mg-btn--primary:hover{background:var(--g3)}
  .mg-btn--ghost{background:transparent;color:inherit;border:1px solid currentColor;opacity:.8}
  .mg-btn--ghost:hover{opacity:1}

  /* Vorlagen-Karten */
  .mg-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .mg-preset{display:flex;flex-direction:column;gap:8px;text-align:left;padding:10px;border-radius:10px;border:2px solid var(--line);background:#fff;color:var(--ink);transition:border-color .15s,background .15s}
  .mg-preset:hover{border-color:#b9d9a0}
  .mg-preset.on{border-color:var(--g);background:var(--gs)}
  .mg-preset b{font-size:14px;display:flex;align-items:center;gap:6px}
  .mg-preset small{font-size:12px;color:var(--mut);line-height:1.3}
  .mg-check{width:16px;height:16px;border-radius:50%;background:var(--g);color:#fff;font-size:11px;line-height:16px;text-align:center;margin-left:auto}
  .mg-dia{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:3px;padding:5px;border-radius:6px;background:#262626;height:56px;overflow:hidden}
  .mg-dia i{background:#8a8f88;border-radius:2px}
  .mg-preset.on .mg-dia i{background:var(--g)}

  /* Übersichtskarte im Formular */
  .mg-card{display:flex;flex-wrap:wrap;align-items:center;gap:16px;padding:14px;border:1px solid var(--line);border-radius:12px;background:#fff;margin-bottom:18px}
  .mg-strip{display:flex;gap:4px;flex:0 0 auto}
  .mg-strip img,.mg-strip span{width:46px;height:46px;border-radius:6px;object-fit:cover;background:#262626;display:block}
  .mg-strip span{display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:600}
  .mg-meta{flex:1 1 160px;min-width:0}
  .mg-meta b{display:block;font-size:15px;color:var(--ink)}
  .mg-meta small{color:var(--mut);font-size:13px}
  .mg-sub{font-weight:700;font-size:13px;letter-spacing:.02em;color:var(--ink);margin:6px 0 8px}

  /* Overlay */
  .mg-ov{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;background:#101311;color:#e9ece8}
  .mg-top{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid #232823;background:#141814}
  .mg-top img{width:30px;height:30px}
  .mg-top h2{margin:0;font-size:16px;font-weight:700;color:#fff}
  .mg-top small{display:block;font-size:12px;color:#9aa39a;font-weight:400}
  .mg-top .mg-spacer{flex:1}
  .mg-seg{display:inline-flex;padding:3px;border-radius:9px;background:#1e241e;border:1px solid #2a312a}
  .mg-seg button{border:0;background:transparent;color:#aeb6ad;padding:7px 14px;border-radius:7px;font-size:13px;font-weight:600}
  .mg-seg button.on{background:var(--g2);color:#fff}
  .mg-body{flex:1;min-height:0;display:grid;grid-template-columns:300px minmax(0,1fr)}
  .mg-side{overflow:auto;padding:18px;border-right:1px solid #232823;background:#141814;display:flex;flex-direction:column;gap:22px}
  .mg-side h3{margin:0 0 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8d968c;font-weight:700}
  .mg-side .mg-presets{grid-template-columns:1fr}
  .mg-side .mg-preset{flex-direction:row;align-items:center;background:#1a1f1a;border-color:#2a312a;color:#e9ece8}
  .mg-side .mg-preset:hover{border-color:#4b6b3a}
  .mg-side .mg-preset.on{border-color:var(--g);background:rgba(85, 160, 65,.12)}
  .mg-side .mg-preset small{color:#9aa39a}
  .mg-side .mg-dia{width:72px;flex:0 0 72px;height:54px;background:#0c0e0c}
  .mg-side .mg-dia i{background:#4a524a}
  .mg-side .mg-preset .mg-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
  .mg-panel{border:1px solid #2a312a;border-radius:12px;padding:14px;background:#1a1f1a}
  .mg-empty-note{font-size:13px;color:#9aa39a;line-height:1.45;margin:0}
  .mg-selhead{display:flex;align-items:center;gap:10px;margin-bottom:12px}
  .mg-selhead img{width:44px;height:44px;border-radius:6px;object-fit:cover}
  .mg-selhead b{font-size:14px;color:#fff;display:block}
  .mg-selhead small{font-size:12px;color:#9aa39a}
  .mg-sizes{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .mg-size{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:9px;border:2px solid #2a312a;background:#141814;color:#cfd5ce;font-size:12px;font-weight:600}
  .mg-size:hover{border-color:#4b6b3a}
  .mg-size.on{border-color:var(--g);color:#fff;background:rgba(85, 160, 65,.12)}
  .mg-ico{display:grid;grid-template-columns:repeat(2,11px);grid-auto-rows:11px;gap:2px}
  .mg-ico i{background:#3a423a;border-radius:2px}
  .mg-ico i.f{background:var(--g)}
  .mg-dia.custom{grid-template-rows:none;grid-auto-rows:1fr;grid-auto-flow:row dense;align-content:start}
  .mg-dia.custom i{min-height:0}
  .mg-link{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:13px;font-weight:600;color:var(--g);text-decoration:none;background:none;border:0;padding:0}
  .mg-link:hover{text-decoration:underline}
  .mg-h3row{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
  .mg-h3row h3{margin-bottom:10px}
  .mg-refresh{margin-top:0;font-size:12px;cursor:pointer}
  .mg-formnote{font-size:12px;color:var(--mut);margin:8px 0 0}
  .mg-help{font-size:12px;color:#8d968c;line-height:1.5;margin:0}
  .mg-help b{color:#cfd5ce}
  .mg-stage{overflow:auto;padding:28px;display:flex;justify-content:center;align-items:flex-start;background:radial-gradient(circle at 50% 0,#1b221b,#101311 70%)}
  .mg-frame{width:100%;max-width:980px;background:#262626;border-radius:14px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
  .mg-frame.mobile{max-width:390px;border-radius:28px;padding:16px 12px;border:6px solid #2b2f2b}
  .mg-wrap{container-type:inline-size}
  .mg-grid{--gap:10px;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:var(--gap);grid-auto-flow:row dense;grid-auto-rows:calc((100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols))}
  .mg-grid.natural{grid-auto-rows:auto;grid-auto-flow:row;align-items:start}
  .mg-tile{position:relative;overflow:hidden;border-radius:6px;cursor:grab;background:#171717;touch-action:manipulation}
  .mg-tile:active{cursor:grabbing}
  .mg-tile img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-drag:none}
  .mg-grid.natural .mg-tile img{height:auto}
  .mg-tile::after{content:"";position:absolute;inset:0;border-radius:6px;box-shadow:inset 0 0 0 0 var(--g);transition:box-shadow .12s}
  .mg-tile:hover::after{box-shadow:inset 0 0 0 2px rgba(85, 160, 65,.6)}
  .mg-tile.sel::after{box-shadow:inset 0 0 0 4px var(--g)}
  .mg-tile--breit{grid-column:span 2}.mg-tile--hoch{grid-row:span 2}.mg-tile--gross{grid-column:span 2;grid-row:span 2}
  .mg-num{position:absolute;left:8px;top:8px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;font-weight:700;line-height:22px;text-align:center}
  .mg-tile.sel .mg-num{background:var(--g);color:#0d1a0d}
  .mg-badge{position:absolute;right:8px;top:8px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;font-weight:600}
  .mg-ghost{opacity:.3}
  .mg-chosen{box-shadow:0 12px 30px rgba(0,0,0,.5)}
  .mg-none{color:#9aa39a;text-align:center;padding:40px 10px;font-size:14px}
  .mg-ph{background:linear-gradient(135deg,#4a8a38,#3e7530)}
  .mg-repeat{background:#3a3f3a;cursor:default;opacity:.55}
  .mg-muster{background:#141814;border-radius:12px;padding:14px;color:#e9ece8}
  .mg-mhead{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:12px;font-size:13px;color:#9aa39a}
  .mg-muster .mg-frame{max-width:380px;margin:0 auto;box-shadow:none;padding:12px}
  .mg-muster .mg-frame.mobile{max-width:240px}
  .mg-mtools{max-width:380px;margin:14px auto 0;display:flex;flex-direction:column;gap:12px}
  .mg-mrow{display:flex;flex-wrap:wrap;gap:8px}
  .mg-muster .mg-btn--ghost{color:#e9ece8}
  /* ---------- Übersicht (Startseite nach dem Login) ---------- */
  body.mg-dash [class*="EditorContainer"],body.mg-dash [class*="ControlPaneContainer"],body.mg-dash [class*="ControlContainer"],body.mg-dash [class*="NoPreviewContainer"],body.mg-dash [class*="PreviewPaneContainer"]{background:transparent!important;box-shadow:none!important;border:0!important}
  body.mg-dash [class*="ToolbarSectionMain"],body.mg-dash [class*="ToolbarSectionBackLink"]{visibility:hidden}
  body.mg-dash [class*="ToolbarContainer"]::before{content:"";position:absolute;left:18px;top:50%;width:30px;height:30px;margin-top:-15px;background:url('/favicon-96x96.png') center/contain no-repeat}
  body.mg-dash [class*="ToolbarContainer"]::after{content:"Mosk Unlimited · Verwaltung";position:absolute;left:58px;top:50%;transform:translateY(-50%);color:#e9ece8;font-weight:700;font-size:14px}
  body.mg-dash [class*="ControlContainer"] > [class*="FieldLabel"],body.mg-dash [class*="ControlTopbar"],body.mg-dash label[class*="FieldLabel"]{display:none!important}
  body.mg-dash [class*="ControlPaneContainer"]{max-width:980px;margin:0 auto}
  .mg-dash-wrap{color:#e9ece8;padding:8px 0 40px}
  .mg-dash-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:22px}
  .mg-dash-head h1{margin:0;font-size:30px;font-weight:800;color:#fff;letter-spacing:-.01em}
  .mg-dash-head p{margin:6px 0 0;color:#9aa39a;font-size:14px}
  .mg-dash-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px;align-items:start}
  .mg-glass{background:rgba(20,24,20,.74);border:1px solid rgba(255,255,255,.08);border-radius:16px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.35);padding:18px}
  .mg-glass h2{margin:0 0 4px;font-size:16px;font-weight:700;color:#fff}
  .mg-glass .mg-sub2{margin:0 0 14px;font-size:13px;color:#9aa39a}
  .mg-area{margin-top:14px}
  .mg-area h3{margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8d968c;font-weight:700}
  .mg-row{display:flex;align-items:center;gap:14px;padding:10px;border-radius:12px;text-decoration:none;color:inherit;border:1px solid transparent;transition:background .15s,border-color .15s}
  .mg-row:hover{background:rgba(255,255,255,.04);border-color:rgba(85,160,65,.45)}
  .mg-thumbs{display:flex;gap:3px;flex:0 0 auto}
  .mg-thumbs img,.mg-thumbs span{width:40px;height:40px;border-radius:7px;object-fit:cover;background:#1e241e;display:block}
  .mg-thumbs span{border:1px dashed rgba(255,255,255,.14);background:transparent}
  .mg-rowtxt{flex:1;min-width:0}
  .mg-rowtxt b{display:block;font-size:14px;color:#fff}
  .mg-rowtxt small{display:block;font-size:12px;color:#9aa39a;margin-top:2px}
  .mg-pill{flex:0 0 auto;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;white-space:nowrap}
  .mg-pill.on{background:rgba(85,160,65,.16);color:#8fd17a}
  .mg-pill.off{background:rgba(255,255,255,.06);color:#9aa39a}
  .mg-pill.hid{background:rgba(255,196,0,.12);color:#e8c35a}
  .mg-go{flex:0 0 auto;color:#55a041;font-weight:700;font-size:13px}
  .mg-side2{display:flex;flex-direction:column;gap:16px}
  .mg-soon{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
  .mg-soon .mg-bars{display:flex;align-items:flex-end;gap:5px;height:48px;margin:4px 0 2px}
  .mg-soon .mg-bars i{width:14px;border-radius:3px 3px 0 0;background:rgba(85,160,65,.25)}
  .mg-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 14px}
  .mg-kpi{background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px}
  .mg-kpi b{display:block;font-size:24px;font-weight:800;color:#fff;line-height:1.1;font-variant-numeric:tabular-nums}
  .mg-kpi small{display:block;font-size:11px;color:#9aa39a;margin-top:3px}
  .mg-chart{position:relative;height:84px;display:flex;align-items:flex-end;gap:2px;border-bottom:1px solid rgba(255,255,255,.12);margin-bottom:4px}
  .mg-bar{flex:1;display:flex;align-items:flex-end;height:100%;cursor:default}
  .mg-bar i{display:block;width:100%;min-height:2px;background:#55a041;border-radius:4px 4px 0 0;transition:filter .12s}
  .mg-bar:hover i{filter:brightness(1.25)}
  .mg-bar.zero i{background:rgba(255,255,255,.14)}
  .mg-axis{display:flex;justify-content:space-between;font-size:10px;color:#8d968c;margin-bottom:12px}
  .mg-tip2{position:absolute;bottom:100%;transform:translate(-50%,-6px);background:#0c0f0c;border:1px solid rgba(255,255,255,.12);color:#e9ece8;font-size:11px;padding:4px 7px;border-radius:6px;white-space:nowrap;pointer-events:none}
  .mg-pages{list-style:none;margin:0 0 10px;padding:0;display:flex;flex-direction:column;gap:6px}
  .mg-pages li{font-size:12px;color:#cfd5ce}
  .mg-pages .mg-prow{display:flex;justify-content:space-between;gap:8px;margin-bottom:3px}
  .mg-pages .mg-prow span:last-child{color:#9aa39a;font-variant-numeric:tabular-nums}
  .mg-pages .mg-track{height:3px;border-radius:2px;background:rgba(255,255,255,.07)}
  .mg-pages .mg-track i{display:block;height:100%;border-radius:2px;background:#55a041}
  .mg-h4{margin:0 0 6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8d968c;font-weight:700}
  .mg-note{font-size:11px;color:#8d968c;line-height:1.45;margin:0 0 8px}
  .mg-tag{font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.07);color:#cfd5ce}
  .mg-dlink{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#55a041;text-decoration:none}
  .mg-dlink:hover{text-decoration:underline}
  .mg-tip{font-size:13px;color:#cfd5ce;line-height:1.5;margin:0}
  .mg-stand{font-size:12px;color:#8d968c}
  @media (max-width:820px){.mg-dash-grid{grid-template-columns:1fr}.mg-dash-head h1{font-size:24px}.mg-thumbs img:nth-child(n+3),.mg-thumbs span:nth-child(n+3){display:none}}

  /* Decap erzwingt im Editor 800px Mindestbreite -> am Handy unbenutzbar */
  @media (max-width:820px){
    [class*="EditorContainer"],[class*="ToolbarContainer"]{min-width:0!important}
  }
  @media (max-width:860px){
    .mg-top{flex-wrap:wrap;padding:10px 12px;gap:10px}
    .mg-top .mg-spacer{display:block}
    .mg-top .mg-seg{order:3;width:100%}
    .mg-top .mg-seg button{flex:1}
    .mg-body{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto}
    .mg-stage{padding:14px;order:1}
    .mg-side{order:2;border-right:0;border-top:1px solid #232823;max-height:46vh;padding:14px;gap:16px}
    .mg-side .mg-presets{grid-template-columns:repeat(3,minmax(0,1fr))}
    .mg-side .mg-preset{flex-direction:column;align-items:stretch}
    .mg-side .mg-dia{width:auto;flex:none}
    .mg-side .mg-preset small{display:none}
  }
  `;
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- kleine Bausteine ---------- */

  // Skizze einer Vorlage: 3 Spalten x 4 Zeilen, Kästchen = [colSpan, rowSpan]
  var DIAGRAMS = {
    // spaltenweise gefüllt, unterschiedliche Höhen = versetzt
    mosaik: { column: true, cells: [[1, 2], [1, 2], [1, 1], [1, 3], [1, 3], [1, 1]] },
    raster: { cells: [[1, 2], [1, 2], [1, 2], [1, 2], [1, 2], [1, 2]] },
    highlight: { cells: [[2, 4], [1, 2], [1, 2]] },
  };

  function diagram(id) {
    var d = DIAGRAMS[id];
    return h(
      'div',
      { className: 'mg-dia', style: d.column ? { gridAutoFlow: 'column' } : null },
      d.cells.map(function (c, i) {
        return h('i', { key: i, style: { gridColumn: 'span ' + c[0], gridRow: 'span ' + c[1] } });
      }),
    );
  }

  // Skizze eines eigenen Musters (3 Spalten, Muster wiederholt bis Fläche voll)
  var SPAN = { normal: [1, 1], breit: [2, 1], hoch: [1, 2], gross: [2, 2] };
  function patternDiagram(pattern) {
    var cells = [];
    var area = 0;
    for (var i = 0; area < 9 && pattern.length && i < 24; i++) {
      var sz = pattern[i % pattern.length];
      cells.push(sz);
      area += SPAN[sz][0] * SPAN[sz][1];
    }
    return h(
      'div',
      { className: 'mg-dia custom', style: { gridTemplateRows: 'repeat(3,1fr)' } },
      cells.map(function (sz, i) {
        return h('i', { key: i, style: { gridColumn: 'span ' + SPAN[sz][0], gridRow: 'span ' + SPAN[sz][1] } });
      }),
    );
  }

  function customCards(vorlagen, items, layout, onPick) {
    return h(
      'div',
      { className: 'mg-presets' },
      vorlagen.map(function (v, idx) {
        var pattern = parsePattern(v.muster);
        var on = layout === 'raster' && patternMatches(items, pattern);
        return h(
          'button',
          {
            key: idx,
            type: 'button',
            className: 'mg-preset' + (on ? ' on' : ''),
            onClick: function () {
              onPick(pattern);
            },
          },
          patternDiagram(pattern),
          h(
            'span',
            { className: 'mg-txt' },
            h('b', null, v.name || 'Ohne Namen', on ? h('span', { className: 'mg-check' }, '✓') : null),
            h('small', null, pattern.length + ' Kacheln, wiederholt sich'),
          ),
        );
      }),
    );
  }

  function presetCards(current, onPick) {
    return h(
      'div',
      { className: 'mg-presets', role: 'radiogroup', 'aria-label': 'Layout-Vorlage' },
      LAYOUTS.map(function (l) {
        var on = current === l.id;
        return h(
          'button',
          {
            key: l.id,
            type: 'button',
            role: 'radio',
            'aria-checked': on,
            className: 'mg-preset' + (on ? ' on' : ''),
            onClick: function () {
              onPick(l.id);
            },
          },
          diagram(l.id),
          h(
            'span',
            { className: 'mg-txt' },
            h('b', null, l.name, on ? h('span', { className: 'mg-check' }, '✓') : null),
            h('small', null, l.desc),
          ),
        );
      }),
    );
  }

  // Größen-Symbol: 2x2 Kästchen, belegte grün
  var ICON_FILL = { normal: [0], breit: [0, 1], hoch: [0, 2], gross: [0, 1, 2, 3] };
  function sizeIcon(id) {
    return h(
      'span',
      { className: 'mg-ico' },
      [0, 1, 2, 3].map(function (i) {
        return h('i', { key: i, className: ICON_FILL[id].indexOf(i) !== -1 ? 'f' : '' });
      }),
    );
  }

  /* ---------- Layout-Feld ---------- */

  var LayoutControl = createClass({
    componentDidMount: function () {
      var self = this;
      this.onSet = function (e) {
        self.pick(e.detail);
      };
      window.addEventListener(LAYOUT_SET, this.onSet);
    },
    componentWillUnmount: function () {
      window.removeEventListener(LAYOUT_SET, this.onSet);
    },
    pick: function (id) {
      if (id === this.props.value) return;
      this.props.onChange(id);
      window.dispatchEvent(new CustomEvent(LAYOUT_CHANGED, { detail: id }));
    },
    render: function () {
      return h(
        'div',
        { className: 'mg' },
        presetCards(this.props.value || 'mosaik', this.pick),
        h('p', { className: 'mg-formnote' }, 'Eigene Layouts findest du unter „Layout bearbeiten“.'),
      );
    },
  });

  /* ---------- Galerie-Feld ---------- */

  var GalerieControl = createClass({
    getInitialState: function () {
      var entry = this.props.entry;
      return {
        open: false,
        selected: null,
        mobile: false,
        urls: {},
        vorlagen: [],
        layout: (entry && entry.getIn(['data', 'layout'])) || 'mosaik',
      };
    },

    componentDidMount: function () {
      var self = this;
      this.onLayout = function (e) {
        self.setState({ layout: e.detail || 'mosaik', selected: null });
      };
      this.onKey = function (e) {
        if (e.key === 'Escape' && self.state.open) self.close();
      };
      window.addEventListener(LAYOUT_CHANGED, this.onLayout);
      window.addEventListener('keydown', this.onKey);
      this.resolveUrls();
    },

    componentDidUpdate: function (prevProps) {
      if (this.gridEl !== this.sortableEl) this.initSortable();
      if (prevProps.value !== this.props.value) this.resolveUrls();
    },

    componentWillUnmount: function () {
      window.removeEventListener(LAYOUT_CHANGED, this.onLayout);
      window.removeEventListener('keydown', this.onKey);
      if (this.sortable) this.sortable.destroy();
      document.body.style.overflow = '';
    },

    open: function () {
      document.body.style.overflow = 'hidden';
      // am Handy direkt die Handy-Ansicht zeigen
      this.setState({ open: true, selected: null, mobile: window.innerWidth < 860 });
      this.loadVorlagen();
    },

    loadVorlagen: function () {
      var self = this;
      fetch(VORLAGEN_URL, { cache: 'no-store' })
        .then(function (r) {
          return r.ok ? r.json() : { vorlagen: [] };
        })
        .then(function (data) {
          var all = (data && data.vorlagen) || [];
          self.setState({
            vorlagen: all.filter(function (v) {
              return parsePattern(v.muster).length > 0;
            }),
          });
        })
        .catch(function () {});
    },

    // Eigenes Muster anwenden: Vorlage "Raster" + Größen der Reihe nach setzen
    applyPattern: function (pattern) {
      if (!pattern.length || !this.props.value) return;
      window.dispatchEvent(new CustomEvent(LAYOUT_SET, { detail: 'raster' }));
      this.props.onChange(
        this.props.value.map(function (item, i) {
          return item.set('groesse', pattern[i % pattern.length]);
        }),
      );
      this.setState({ selected: null });
    },

    close: function () {
      document.body.style.overflow = '';
      this.setState({ open: false, selected: null });
    },

    items: function () {
      var v = this.props.value;
      return v && v.toArray ? v.toArray() : [];
    },

    // Frisch hochgeladene, noch nicht veröffentlichte Bilder gibt es nur im
    // Browser (blob:-URL) -> über Decaps getAsset auflösen.
    resolveUrls: function () {
      var self = this;
      var getAsset = this.props.getAsset;
      if (!getAsset) return;
      this.items().forEach(function (item) {
        var path = item && item.get('bild');
        if (!path || self.state.urls[path]) return;
        try {
          Promise.resolve(getAsset(path, self.props.field))
            .then(function (asset) {
              var url = asset ? String(asset) : '';
              if (url.indexOf('blob:') === 0) {
                var urls = Object.assign({}, self.state.urls);
                urls[path] = url;
                self.setState({ urls: urls });
              }
            })
            .catch(function () {});
        } catch (e) {}
      });
    },

    src: function (path, width) {
      return this.state.urls[path] || previewUrl(path, width);
    },

    initSortable: function () {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
      this.sortableEl = this.gridEl;
      if (!this.gridEl || !Sortable) return;
      this.sortable = Sortable.create(this.gridEl, {
        animation: 160,
        ghostClass: 'mg-ghost',
        chosenClass: 'mg-chosen',
        // am Handy kurz gedrückt halten zum Ziehen, sonst scrollt die Vorschau normal
        delay: 200,
        delayOnTouchOnly: true,
        onEnd: this.handleSortEnd,
      });
    },

    handleSortEnd: function (evt) {
      var from = evt.oldIndex;
      var to = evt.newIndex;
      if (from === to || from == null || to == null) return;
      // DOM zurücksetzen, React rendert die neue Reihenfolge selbst
      var parent = evt.from;
      parent.removeChild(evt.item);
      parent.insertBefore(evt.item, parent.children[from] || null);

      var value = this.props.value;
      var moved = value.get(from);
      this.props.onChange(value.delete(from).insert(to, moved));

      var sel = this.state.selected;
      if (sel === from) sel = to;
      else if (sel !== null && from < sel && to >= sel) sel -= 1;
      else if (sel !== null && from > sel && to <= sel) sel += 1;
      this.setState({ selected: sel });
    },

    setSize: function (index, size) {
      this.props.onChange(this.props.value.setIn([index, 'groesse'], size));
    },

    resetSizes: function () {
      this.props.onChange(
        this.props.value.map(function (item) {
          return item.delete('groesse');
        }),
      );
      this.setState({ selected: null });
    },

    pickLayout: function (id) {
      window.dispatchEvent(new CustomEvent(LAYOUT_SET, { detail: id }));
    },

    renderCard: function (items) {
      var self = this;
      var shown = items.slice(0, 5);
      var rest = items.length - shown.length;
      return h(
        'div',
        { className: 'mg-card' },
        h(
          'div',
          { className: 'mg-strip' },
          shown.map(function (item, i) {
            return h('img', { key: i, src: self.src(item.get('bild'), 120), alt: '' });
          }),
          rest > 0 ? h('span', null, '+' + rest) : null,
        ),
        h(
          'div',
          { className: 'mg-meta' },
          h('b', null, items.length + (items.length === 1 ? ' Bild' : ' Bilder')),
          h('small', null, 'Layout: ' + layoutName(this.state.layout)),
        ),
        h(
          'button',
          { type: 'button', className: 'mg-btn mg-btn--primary', onClick: this.open },
          'Layout bearbeiten',
        ),
      );
    },

    renderSelected: function (items, layout) {
      var self = this;
      var sel = this.state.selected;
      if (sel === null || sel >= items.length) {
        return h(
          'div',
          { className: 'mg-panel' },
          h('p', { className: 'mg-empty-note' }, 'Tippe ein Bild in der Vorschau an, um seine Größe zu ändern.'),
        );
      }
      var item = items[sel];
      var current = effectiveSize(layout, sel, item.get('groesse'));
      return h(
        'div',
        { className: 'mg-panel' },
        h(
          'div',
          { className: 'mg-selhead' },
          h('img', { src: this.src(item.get('bild'), 120), alt: '' }),
          h(
            'div',
            null,
            h('b', null, 'Bild ' + (sel + 1)),
            h('small', null, item.get('beschreibung') || 'ohne Beschreibung'),
          ),
        ),
        layout === 'mosaik'
          ? h(
              'p',
              { className: 'mg-empty-note' },
              'Im Mosaik behalten Bilder ihr natürliches Format. Für eigene Größen die Vorlage „Raster“ oder „Highlight“ wählen.',
            )
          : h(
              'div',
              { className: 'mg-sizes' },
              SIZES.map(function (s) {
                return h(
                  'button',
                  {
                    key: s.id,
                    type: 'button',
                    className: 'mg-size' + (current === s.id ? ' on' : ''),
                    'aria-pressed': current === s.id,
                    onClick: function () {
                      self.setSize(sel, s.id);
                    },
                  },
                  sizeIcon(s.id),
                  s.name,
                );
              }),
            ),
      );
    },

    renderOverlay: function (items) {
      var self = this;
      var layout = this.state.layout;
      var mobile = this.state.mobile;
      var natural = layout === 'mosaik';
      var selected = this.state.selected;
      var entry = this.props.entry;
      var title = (entry && entry.getIn(['data', 'title'])) || '';
      var hasCustom = items.some(function (item) {
        return item && item.get('groesse');
      });

      var tiles = items.map(function (item, i) {
        var path = item.get('bild');
        var size = effectiveSize(layout, i, item.get('groesse'));
        return h(
          'div',
          {
            key: path + '-' + i,
            className: 'mg-tile mg-tile--' + size + (selected === i ? ' sel' : ''),
            onClick: function () {
              self.setState({ selected: selected === i ? null : i });
            },
          },
          h('img', {
            src: self.src(path, size === 'normal' ? 500 : 1000),
            alt: item.get('beschreibung') || '',
            onError: function (e) {
              if (e.target.src.indexOf('/.netlify/images') !== -1) e.target.src = path;
            },
          }),
          h('span', { className: 'mg-num' }, String(i + 1)),
          !natural && size !== 'normal' ? h('span', { className: 'mg-badge' }, SIZE_NAME[size]) : null,
          item.get('video') ? h('span', { className: 'mg-badge', style: { right: 'auto', left: 8, top: 'auto', bottom: 8 } }, '▶ Video') : null,
        );
      });

      return h(
        'div',
        { className: 'mg mg-ov', role: 'dialog', 'aria-modal': true, 'aria-label': 'Galerie-Layout bearbeiten' },
        h(
          'div',
          { className: 'mg-top' },
          h('img', { src: '/favicon-96x96.png', alt: '' }),
          h('h2', null, 'Galerie-Layout', h('small', null, title ? 'Kategorie: ' + title : '')),
          h('div', { className: 'mg-spacer' }),
          h(
            'div',
            { className: 'mg-seg', role: 'group', 'aria-label': 'Vorschau' },
            h(
              'button',
              { type: 'button', className: mobile ? '' : 'on', onClick: function () { self.setState({ mobile: false }); } },
              'Computer',
            ),
            h(
              'button',
              { type: 'button', className: mobile ? 'on' : '', onClick: function () { self.setState({ mobile: true }); } },
              'Handy',
            ),
          ),
          h('button', { type: 'button', className: 'mg-btn mg-btn--primary', onClick: this.close }, 'Fertig'),
        ),
        h(
          'div',
          { className: 'mg-body' },
          h(
            'aside',
            { className: 'mg-side' },
            h('section', null, h('h3', null, 'Vorlage'), presetCards(layout, this.pickLayout)),
            h(
              'section',
              null,
              h(
                'div',
                { className: 'mg-h3row' },
                h('h3', null, 'Eigene Layouts'),
                h(
                  'button',
                  { type: 'button', className: 'mg-link mg-refresh', onClick: this.loadVorlagen, title: 'Neu angelegte Layouts laden' },
                  '↻ Aktualisieren',
                ),
              ),
              this.state.vorlagen.length
                ? customCards(this.state.vorlagen, items, layout, this.applyPattern)
                : h('p', { className: 'mg-empty-note' }, 'Noch keine eigenen Layouts.'),
              h(
                'a',
                {
                  className: 'mg-link',
                  href: '/admin/index.html#/collections/layouts/entries/vorlagen',
                  target: '_blank',
                  rel: 'noopener',
                },
                '+ Eigene Layouts anlegen (neuer Tab)',
              ),
            ),
            h('section', null, h('h3', null, 'Ausgewähltes Bild'), this.renderSelected(items, layout)),
            h(
              'section',
              null,
              h(
                'p',
                { className: 'mg-help' },
                h('b', null, 'Verschieben: '),
                'Bild ziehen (am Handy kurz gedrückt halten). ',
                h('b', null, 'Lücken '),
                'füllt die Website automatisch. Änderungen werden erst mit „Veröffentlichen“ live.',
              ),
              hasCustom && !natural
                ? h(
                    'button',
                    { type: 'button', className: 'mg-btn mg-btn--ghost', style: { marginTop: 12 }, onClick: this.resetSizes },
                    'Größen zurücksetzen',
                  )
                : null,
            ),
          ),
          h(
            'div',
            { className: 'mg-stage' },
            h(
              'div',
              { className: 'mg-frame' + (mobile ? ' mobile' : '') },
              items.length === 0
                ? h('div', { className: 'mg-none' }, 'Noch keine Bilder – schließe den Editor und lade unten Bilder hoch.')
                : h(
                    'div',
                    { className: 'mg-wrap' },
                    h(
                      'div',
                      {
                        className: 'mg-grid' + (natural ? ' natural' : ''),
                        // wie die Website: Handy 2 Spalten (Mosaik 1), Computer 3
                        style: { '--cols': mobile ? (natural ? 1 : 2) : 3 },
                        ref: function (el) {
                          self.gridEl = el;
                        },
                      },
                      tiles,
                    ),
                  ),
            ),
          ),
        ),
      );
    },

    render: function () {
      var items = this.items();
      if (!this.state.open) this.gridEl = null;
      return h(
        'div',
        { className: 'mg' },
        this.renderCard(items),
        this.state.open ? this.renderOverlay(items) : null,
        h('div', { className: 'mg-sub' }, 'Bilder hochladen, beschreiben, löschen'),
        h(ListControl, this.props),
      );
    },
  });

  /* ---------- Muster-Editor für eigene Layouts ---------- */

  var DEMO_TILES = 9;

  var MusterControl = createClass({
    getInitialState: function () {
      return { selected: null, mobile: false };
    },

    componentDidMount: function () {
      this.initSortable();
    },

    componentDidUpdate: function () {
      if (this.gridEl !== this.sortableEl) this.initSortable();
    },

    componentWillUnmount: function () {
      if (this.sortable) this.sortable.destroy();
    },

    pattern: function () {
      var p = parsePattern(this.props.value);
      return p.length ? p : ['normal'];
    },

    save: function (pattern) {
      this.props.onChange(pattern.join(','));
    },

    initSortable: function () {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
      this.sortableEl = this.gridEl;
      if (!this.gridEl || !Sortable) return;
      var self = this;
      this.sortable = Sortable.create(this.gridEl, {
        animation: 160,
        ghostClass: 'mg-ghost',
        chosenClass: 'mg-chosen',
        delay: 200,
        delayOnTouchOnly: true,
        // nur echte Muster-Kacheln verschieben, nicht die grauen Wiederholungen
        draggable: '.mg-tile:not(.mg-repeat)',
        onEnd: function (evt) {
          var from = evt.oldDraggableIndex;
          var to = evt.newDraggableIndex;
          if (from === to || from == null || to == null) return;
          var parent = evt.from;
          parent.removeChild(evt.item);
          parent.insertBefore(evt.item, parent.children[evt.oldIndex] || null);
          var p = self.pattern().slice();
          var moved = p.splice(from, 1)[0];
          p.splice(to, 0, moved);
          self.save(p);
          self.setState({ selected: to });
        },
      });
    },

    render: function () {
      var self = this;
      var pattern = this.pattern();
      var sel = this.state.selected !== null && this.state.selected < pattern.length ? this.state.selected : null;
      var mobile = this.state.mobile;
      var total = Math.max(DEMO_TILES, pattern.length);

      var tiles = [];
      for (var i = 0; i < total; i++) {
        var own = i < pattern.length;
        var size = pattern[i % pattern.length];
        tiles.push(
          h(
            'div',
            {
              key: i,
              className:
                'mg-tile mg-ph mg-tile--' + size + (own ? '' : ' mg-repeat') + (own && sel === i ? ' sel' : ''),
              onClick: own
                ? (function (idx) {
                    return function () {
                      self.setState({ selected: sel === idx ? null : idx });
                    };
                  })(i)
                : null,
            },
            h('span', { className: 'mg-num' }, own ? String(i + 1) : '↻'),
            size !== 'normal' ? h('span', { className: 'mg-badge' }, SIZE_NAME[size]) : null,
          ),
        );
      }

      var sizeButtons =
        sel !== null
          ? h(
              'div',
              { className: 'mg-sizes' },
              SIZES.map(function (s) {
                return h(
                  'button',
                  {
                    key: s.id,
                    type: 'button',
                    className: 'mg-size' + (pattern[sel] === s.id ? ' on' : ''),
                    onClick: function () {
                      var p = pattern.slice();
                      p[sel] = s.id;
                      self.save(p);
                    },
                  },
                  sizeIcon(s.id),
                  s.name,
                );
              }),
            )
          : h('p', { className: 'mg-empty-note' }, 'Kachel antippen, um ihre Größe zu wählen. Ziehen zum Umsortieren.');

      var tools = h(
        'div',
        { className: 'mg-mtools' },
        sizeButtons,
        h(
          'div',
          { className: 'mg-mrow' },
          h(
            'button',
            {
              type: 'button',
              className: 'mg-btn mg-btn--primary',
              onClick: function () {
                var p = pattern.concat(['normal']);
                self.save(p);
                self.setState({ selected: p.length - 1 });
              },
            },
            '+ Kachel',
          ),
          sel !== null && pattern.length > 1
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'mg-btn mg-btn--ghost',
                  onClick: function () {
                    var p = pattern.slice();
                    p.splice(sel, 1);
                    self.save(p);
                    self.setState({ selected: null });
                  },
                },
                'Kachel ' + (sel + 1) + ' entfernen',
              )
            : null,
        ),
      );

      return h(
        'div',
        { className: 'mg mg-muster' },
        h(
          'div',
          { className: 'mg-mhead' },
          h('span', null, pattern.length + (pattern.length === 1 ? ' Kachel' : ' Kacheln') + ' · grau = Wiederholung'),
          h(
            'div',
            { className: 'mg-seg' },
            h('button', { type: 'button', className: mobile ? '' : 'on', onClick: function () { self.setState({ mobile: false }); } }, 'Computer'),
            h('button', { type: 'button', className: mobile ? 'on' : '', onClick: function () { self.setState({ mobile: true }); } }, 'Handy'),
          ),
        ),
        h(
          'div',
          { className: 'mg-frame' + (mobile ? ' mobile' : '') },
          h(
            'div',
            { className: 'mg-wrap' },
            h(
              'div',
              {
                className: 'mg-grid',
                style: { '--cols': mobile ? 2 : 3 },
                ref: function (el) {
                  self.gridEl = el;
                },
              },
              tiles,
            ),
          ),
        ),
        tools,
      );
    },
  });

  /* ---------- Übersicht ---------- */

  var DASH = '#/collections/uebersicht/entries/start';

  // Nach dem Login direkt auf die Übersicht statt auf die erste Liste
  function routeDashboard() {
    var hash = location.hash;
    if (hash === '' || hash === '#/' || hash === '#/collections/uebersicht' || hash === '#/collections/uebersicht/') {
      location.replace(DASH);
      return;
    }
    document.body.classList.toggle('mg-dash', hash.indexOf(DASH) === 0);
  }
  window.addEventListener('hashchange', routeDashboard);
  routeDashboard();

  // Decap lädt einen Eintrag nicht neu, wenn man direkt von einem Eintrag in
  // einen anderen springt (Formular zeigt dann alte Daten -> Pflichtfelder
  // "leer"). Deshalb erst kurz über die Liste der Sammlung navigieren.
  function openEntry(e, target) {
    if (e) e.preventDefault();
    var m = target.match(/^#\/collections\/([^/]+)/);
    location.hash = m ? '#/collections/' + m[1] : '#/';
    setTimeout(function () {
      location.hash = target;
    }, 60);
  }

  function formatStand(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('de-BE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  /* ---------- Besucher (Umami, Freigabelink = nur Lesezugriff) ---------- */

  var UMAMI_SHARE_URL = 'https://cloud.umami.is/share/yUQtpyaeeut5coxn';
  var UMAMI_API = 'https://gateway-eu.umami.is/api';
  var UMAMI_SHARE_ID = 'yUQtpyaeeut5coxn';
  var DAY = 864e5;

  // Umami-Freigabe: erst Lesezugang holen, dann Statistik abfragen.
  // (Kennung "x-umami-share-context" wie in Umamis eigener Freigabeseite;
  // ändert Umami das, zeigt die Karte nur den Link zur Statistik.)
  function umami(path, share) {
    return fetch(UMAMI_API + path, {
      headers: { 'x-umami-share-token': share.token, 'x-umami-share-context': '1' },
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function num(v) {
    if (v && typeof v === 'object') v = v.value;
    return typeof v === 'number' ? v : 0;
  }

  function fmt(n) {
    return new Intl.NumberFormat('de-BE').format(n);
  }

  function startOfDay(t) {
    var d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  var BesucherCard = createClass({
    getInitialState: function () {
      return { data: null, error: false, hover: null };
    },

    componentDidMount: function () {
      var self = this;
      var now = Date.now();
      var today = startOfDay(now);
      var from14 = startOfDay(now - 13 * DAY);
      var tz = encodeURIComponent('Europe/Brussels');
      fetch(UMAMI_API + '/share/' + UMAMI_SHARE_ID)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (share) {
          var id = share.websiteId;
          var range = function (from) {
            return 'startAt=' + from + '&endAt=' + now;
          };
          return Promise.all([
            umami('/websites/' + id + '/stats?' + range(today), share),
            umami('/websites/' + id + '/stats?' + range(startOfDay(now - 6 * DAY)), share),
            umami('/websites/' + id + '/stats?' + range(startOfDay(now - 29 * DAY)), share),
            umami('/websites/' + id + '/pageviews?' + range(from14) + '&unit=day&timezone=' + tz, share),
            umami('/websites/' + id + '/metrics?' + range(startOfDay(now - 29 * DAY)) + '&type=path&limit=5', share),
          ]);
        })
        .then(function (res) {
          // Tage ohne Besuch fehlen in der Antwort -> mit 0 auffüllen
          var sessions = (res[3] && (res[3].sessions || res[3].pageviews)) || [];
          var byDay = {};
          sessions.forEach(function (p) {
            byDay[startOfDay(new Date(p.x).getTime())] = (byDay[startOfDay(new Date(p.x).getTime())] || 0) + num(p.y);
          });
          var days = [];
          for (var i = 13; i >= 0; i--) {
            var t = startOfDay(now - i * DAY);
            days.push({ t: t, v: byDay[t] || 0 });
          }
          self.setState({
            data: {
              heute: num(res[0].visitors),
              woche: num(res[1].visitors),
              monat: num(res[2].visitors),
              aufrufe: num(res[2].pageviews),
              days: days,
              pages: Array.isArray(res[4]) ? res[4] : [],
            },
          });
        })
        .catch(function () {
          self.setState({ error: true });
        });
    },

    render: function () {
      var self = this;
      var d = this.state.data;
      var link = h(
        'a',
        { className: 'mg-dlink', href: UMAMI_SHARE_URL, target: '_blank', rel: 'noopener' },
        'Alle Details ansehen ›',
      );

      if (this.state.error) {
        return h(
          'section',
          { className: 'mg-glass' },
          h('h2', null, 'Besucher'),
          h('p', { className: 'mg-sub2' }, 'Die Statistik ist gerade nicht erreichbar.'),
          link,
        );
      }
      if (!d) {
        return h('section', { className: 'mg-glass' }, h('h2', null, 'Besucher'), h('p', { className: 'mg-sub2' }, 'Wird geladen …'));
      }

      var max = Math.max.apply(null, d.days.map(function (x) { return x.v; }).concat([1]));
      var hover = this.state.hover;
      var dayFmt = function (t) {
        return new Date(t).toLocaleDateString('de-BE', { weekday: 'short', day: '2-digit', month: '2-digit' });
      };
      var bars = d.days.map(function (x, i) {
        return h(
          'div',
          {
            key: x.t,
            className: 'mg-bar' + (x.v ? '' : ' zero'),
            onMouseEnter: function () { self.setState({ hover: i }); },
            onMouseLeave: function () { self.setState({ hover: null }); },
            'aria-label': dayFmt(x.t) + ': ' + x.v + ' Besucher',
            role: 'img',
          },
          h('i', { style: { height: Math.max(2, (x.v / max) * 100) + '%' } }),
        );
      });
      var tip =
        hover !== null
          ? h(
              'div',
              { className: 'mg-tip2', style: { left: ((hover + 0.5) / d.days.length) * 100 + '%' } },
              dayFmt(d.days[hover].t) + ' · ' + d.days[hover].v + ' Besucher',
            )
          : null;

      var pageMax = d.pages.reduce(function (m, p) { return Math.max(m, num(p.y)); }, 1);
      var pageName = function (path) {
        var names = { '/': 'Startseite', '/portfolio': 'Galerie', '/services': 'Services', '/services/event': 'Services – Privat', '/services/business': 'Services – Unternehmen', '/about': 'Über mich', '/impressum': 'Impressum', '/datenschutz': 'Datenschutz', '/agb': 'AGB' };
        return names[path] || path;
      };

      return h(
        'section',
        { className: 'mg-glass' },
        h('h2', null, 'Besucher'),
        h(
          'div',
          { className: 'mg-kpis' },
          h('div', { className: 'mg-kpi' }, h('b', null, fmt(d.heute)), h('small', null, 'heute')),
          h('div', { className: 'mg-kpi' }, h('b', null, fmt(d.woche)), h('small', null, '7 Tage')),
          h('div', { className: 'mg-kpi' }, h('b', null, fmt(d.monat)), h('small', null, '30 Tage')),
        ),
        h('div', { className: 'mg-h4' }, 'Besucher pro Tag'),
        h('div', { className: 'mg-chart' }, bars, tip),
        h('div', { className: 'mg-axis' }, h('span', null, dayFmt(d.days[0].t)), h('span', null, 'heute')),
        d.pages.length
          ? h(
              'div',
              null,
              h('div', { className: 'mg-h4' }, 'Meistbesucht (30 Tage)'),
              h(
                'ul',
                { className: 'mg-pages' },
                d.pages.map(function (p) {
                  return h(
                    'li',
                    { key: p.x },
                    h('div', { className: 'mg-prow' }, h('span', null, pageName(p.x)), h('span', null, fmt(num(p.y)))),
                    h('div', { className: 'mg-track' }, h('i', { style: { width: (num(p.y) / pageMax) * 100 + '%' } })),
                  );
                }),
              ),
            )
          : null,
        h('p', { className: 'mg-note' }, fmt(d.aufrufe) + ' Seitenaufrufe in 30 Tagen. Gezählt wird nur, wer im Cookie-Banner zustimmt – die echten Zahlen liegen höher.'),
        link,
      );
    },
  });

  var UebersichtControl = createClass({
    getInitialState: function () {
      return { status: null, error: false, vorlagen: null };
    },

    componentDidMount: function () {
      var self = this;
      routeDashboard();
      fetch('/admin/galerie-status.json', { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        })
        .then(function (d) {
          self.setState({ status: d });
        })
        .catch(function () {
          self.setState({ error: true });
        });
      fetch(VORLAGEN_URL, { cache: 'no-store' })
        .then(function (r) {
          return r.ok ? r.json() : { vorlagen: [] };
        })
        .then(function (d) {
          self.setState({ vorlagen: (d && d.vorlagen) || [] });
        })
        .catch(function () {});
    },

    renderRow: function (k) {
      var thumbs = [];
      for (var i = 0; i < 4; i++) {
        var src = k.vorschau[i];
        thumbs.push(src ? h('img', { key: i, src: previewUrl(src, 120), alt: '' }) : h('span', { key: i }));
      }
      var pill, note;
      if (k.ausgeblendet && k.anzahl > 0) {
        pill = h('span', { className: 'mg-pill hid' }, 'Ausgeblendet');
        note = k.anzahl + ' Inhalte, bewusst versteckt';
      } else if (k.anzahl > 0) {
        pill = h('span', { className: 'mg-pill on' }, 'Online');
        note = k.anzahl + (k.anzahl === 1 ? ' Inhalt' : ' Inhalte') + (k.videos ? ' · davon ' + k.videos + ' Video' + (k.videos === 1 ? '' : 's') : '') + ' · Layout: ' + layoutName(k.layout);
      } else {
        pill = h('span', { className: 'mg-pill off' }, 'Leer');
        note = 'Erscheint automatisch, sobald du etwas hinzufügst';
      }
      return h(
        'a',
        {
          key: k.id,
          className: 'mg-row',
          href: '#/collections/galerie/entries/' + k.id,
          onClick: function (e) {
            openEntry(e, '#/collections/galerie/entries/' + k.id);
          },
        },
        h('div', { className: 'mg-thumbs' }, thumbs),
        h('div', { className: 'mg-rowtxt' }, h('b', null, k.title), h('small', null, note)),
        pill,
        h('span', { className: 'mg-go', 'aria-hidden': true }, '›'),
      );
    },

    render: function () {
      var self = this;
      var st = this.state.status;
      var areas = [];
      if (st) {
        st.kategorien.forEach(function (k) {
          var a = areas.filter(function (x) {
            return x.name === k.bereich;
          })[0];
          if (!a) areas.push((a = { name: k.bereich, items: [] }));
          a.items.push(k);
        });
      }
      var online = st
        ? st.kategorien.filter(function (k) {
            return k.anzahl > 0 && !k.ausgeblendet;
          }).length
        : 0;

      var galerie = h(
        'section',
        { className: 'mg-glass' },
        h('h2', null, 'Galerie'),
        h(
          'p',
          { className: 'mg-sub2' },
          st
            ? online + ' von ' + st.kategorien.length + ' Kategorien sind auf der Website zu sehen. Leere Kategorien bleiben unsichtbar, bis du etwas hinzufügst.'
            : this.state.error
              ? 'Der Galerie-Stand konnte nicht geladen werden. Bitte die Seite neu laden.'
              : 'Wird geladen …',
        ),
        areas.map(function (a) {
          return h('div', { key: a.name, className: 'mg-area' }, h('h3', null, a.name), a.items.map(self.renderRow));
        }),
      );

      var besucher = h(BesucherCard, null);

      var anzahlLayouts = this.state.vorlagen ? this.state.vorlagen.length : null;
      var layouts = h(
        'section',
        { className: 'mg-glass' },
        h('h2', null, 'Eigene Layouts'),
        h(
          'p',
          { className: 'mg-sub2' },
          anzahlLayouts === null ? '…' : anzahlLayouts === 1 ? '1 gespeichertes Layout' : anzahlLayouts + ' gespeicherte Layouts',
        ),
        h(
          'a',
          {
            className: 'mg-dlink',
            href: '#/collections/layouts/entries/vorlagen',
            onClick: function (e) {
              openEntry(e, '#/collections/layouts/entries/vorlagen');
            },
          },
          'Layouts verwalten ›',
        ),
      );

      var tipp = h(
        'section',
        { className: 'mg-glass' },
        h('h2', null, 'Tipp'),
        h(
          'p',
          { className: 'mg-tip' },
          'Sammle deine Änderungen und klicke dann einmal auf „Veröffentlichen“. Jede Veröffentlichung braucht ca. 1–2 Minuten, bis sie live ist.',
        ),
      );

      return h(
        'div',
        { className: 'mg mg-dash-wrap' },
        h(
          'div',
          { className: 'mg-dash-head' },
          h(
            'div',
            null,
            h('h1', null, 'Übersicht'),
            h('p', null, 'Alles für deine Website an einem Ort.'),
          ),
          h(
            'div',
            { style: { textAlign: 'right' } },
            h('a', { className: 'mg-dlink', href: '/', target: '_blank', rel: 'noopener' }, 'Website ansehen ›'),
            st && st.stand ? h('div', { className: 'mg-stand' }, 'Stand der Website: ' + formatStand(st.stand)) : null,
          ),
        ),
        h('div', { className: 'mg-dash-grid' }, galerie, h('div', { className: 'mg-side2' }, besucher, layouts, tipp)),
      );
    },
  });

  CMS.registerWidget('uebersicht', UebersichtControl);
  CMS.registerWidget('galerie', GalerieControl, list.preview);
  CMS.registerWidget('vorlage-muster', MusterControl);
  CMS.registerWidget('galerie-layout', LayoutControl, select.preview);
})();
