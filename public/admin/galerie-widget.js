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
  .mg{--g:#6cb430;--g2:#3c8430;--g3:#246c30;--gs:rgba(108,180,48,.14);--ink:#1d2a1f;--mut:#6b7280;--line:#e3e7e1;font-family:inherit}
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
  .mg-side .mg-preset.on{border-color:var(--g);background:rgba(108,180,48,.12)}
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
  .mg-size.on{border-color:var(--g);color:#fff;background:rgba(108,180,48,.12)}
  .mg-ico{display:grid;grid-template-columns:repeat(2,11px);grid-auto-rows:11px;gap:2px}
  .mg-ico i{background:#3a423a;border-radius:2px}
  .mg-ico i.f{background:var(--g)}
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
  .mg-tile:hover::after{box-shadow:inset 0 0 0 2px rgba(108,180,48,.6)}
  .mg-tile.sel::after{box-shadow:inset 0 0 0 4px var(--g)}
  .mg-tile--breit{grid-column:span 2}.mg-tile--hoch{grid-row:span 2}.mg-tile--gross{grid-column:span 2;grid-row:span 2}
  .mg-num{position:absolute;left:8px;top:8px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;font-weight:700;line-height:22px;text-align:center}
  .mg-tile.sel .mg-num{background:var(--g);color:#0d1a0d}
  .mg-badge{position:absolute;right:8px;top:8px;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;font-weight:600}
  .mg-ghost{opacity:.3}
  .mg-chosen{box-shadow:0 12px 30px rgba(0,0,0,.5)}
  .mg-none{color:#9aa39a;text-align:center;padding:40px 10px;font-size:14px}
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
      return h('div', { className: 'mg' }, presetCards(this.props.value || 'mosaik', this.pick));
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
        );
      });

      return h(
        'div',
        { className: 'mg mg-ov', role: 'dialog', 'aria-modal': true, 'aria-label': 'Galerie-Layout bearbeiten' },
        h(
          'div',
          { className: 'mg-top' },
          h('img', { src: '/apple-touch-icon.png', alt: '' }),
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

  CMS.registerWidget('galerie', GalerieControl, list.preview);
  CMS.registerWidget('galerie-layout', LayoutControl, select.preview);
})();
