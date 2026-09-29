/*
  Visueller Layout-Editor für die Galerie im Admin-Panel (Decap CMS Custom Widget).

  Oben: Vorschau, die die Website nachbildet – Bilder per Ziehen umsortieren
  (Maus + Touch via SortableJS), antippen und Größe wählen.
  Unten: die normale Decap-Liste zum Hochladen, Beschreiben und Löschen.

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
  var SelectControl = select.control;
  // Decap rendert ein Feld nicht neu, wenn sich ein Nachbarfeld ändert.
  // Das Layout-Dropdown meldet Änderungen deshalb per Event an den Editor.
  var LAYOUT_EVENT = 'mosk-galerie-layout';

  var SIZES = [
    ['normal', 'Normal'],
    ['breit', 'Breit'],
    ['hoch', 'Hoch'],
    ['gross', 'Groß'],
  ];
  var SIZE_LABEL = { normal: 'Normal', breit: 'Breit', hoch: 'Hoch', gross: 'Groß' };

  function effectiveSize(layout, index, chosen) {
    if (layout === 'mosaik') return 'normal';
    if (chosen && SIZE_LABEL[chosen]) return chosen;
    return layout === 'highlight' && index === 0 ? 'gross' : 'normal';
  }

  // Veröffentlichte Bilder live als kleine Vorschau über Netlifys Image CDN laden
  function previewUrl(path) {
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (!local && /^\/gallery\//.test(path)) {
      return '/.netlify/images?url=' + encodeURIComponent(path) + '&w=500&q=70';
    }
    return path;
  }

  var css = [
    '.mg-box{border:1px solid #dfdfe3;border-radius:8px;padding:16px;margin:0 0 20px;background:#fff}',
    '.mg-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:6px}',
    '.mg-title{font-weight:700;font-size:15px;color:#313d3e}',
    '.mg-hint{font-size:13px;color:#798291;margin:0 0 12px;line-height:1.4}',
    '.mg-seg{display:inline-flex;border:1px solid #dfdfe3;border-radius:6px;overflow:hidden}',
    '.mg-seg button,.mg-btn{border:0;background:#fff;padding:6px 12px;font-size:13px;cursor:pointer;color:#313d3e}',
    '.mg-seg button+button{border-left:1px solid #dfdfe3}',
    '.mg-seg button.on{background:#313d3e;color:#fff}',
    '.mg-btn{border:1px solid #dfdfe3;border-radius:6px}',
    '.mg-stage{background:#262626;border-radius:6px;padding:12px;margin:0 auto}',
    '.mg-stage.mobile{max-width:360px}',
    '.mg-wrap{container-type:inline-size}',
    '.mg-grid{--gap:8px;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:var(--gap);grid-auto-flow:row dense;grid-auto-rows:calc((100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols))}',
    '.mg-grid.natural{grid-auto-rows:auto;grid-auto-flow:row;align-items:start}',
    '.mg-tile{position:relative;overflow:hidden;border-radius:4px;cursor:grab;background:#171717;outline:3px solid transparent;outline-offset:-3px;touch-action:manipulation}',
    '.mg-tile img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-drag:none}',
    '.mg-grid.natural .mg-tile img{height:auto}',
    '.mg-tile.sel{outline-color:#22c55e}',
    '.mg-tile--breit{grid-column:span 2}.mg-tile--hoch{grid-row:span 2}.mg-tile--gross{grid-column:span 2;grid-row:span 2}',
    '.mg-badge{position:absolute;left:6px;top:6px;background:rgba(0,0,0,.7);color:#fff;font-size:11px;padding:2px 6px;border-radius:4px}',
    '.mg-num{position:absolute;right:6px;top:6px;background:rgba(0,0,0,.7);color:#fff;font-size:11px;min-width:18px;text-align:center;padding:2px 5px;border-radius:9px}',
    '.mg-ghost{opacity:.35}',
    '.mg-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}',
    '.mg-tools .mg-seg button{padding:8px 14px}',
    '.mg-empty{color:#aaa;font-size:13px;text-align:center;padding:24px}',
    '.mg-sub{font-weight:700;font-size:14px;color:#313d3e;margin:4px 0 8px}',
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var GalerieControl = createClass({
    getInitialState: function () {
      var entry = this.props.entry;
      return {
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
      window.addEventListener(LAYOUT_EVENT, this.onLayout);
      this.initSortable();
      this.resolveUrls();
    },

    componentDidUpdate: function (prevProps, prevState) {
      if (this.gridEl !== this.sortableEl) this.initSortable();
      if (prevProps.value !== this.props.value) this.resolveUrls();
    },

    componentWillUnmount: function () {
      window.removeEventListener(LAYOUT_EVENT, this.onLayout);
      if (this.sortable) this.sortable.destroy();
    },

    items: function () {
      var v = this.props.value;
      return v && v.toArray ? v.toArray() : [];
    },

    layout: function () {
      return this.state.layout;
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
          var res = getAsset(path, self.props.field);
          Promise.resolve(res).then(function (asset) {
            var url = asset ? String(asset) : '';
            if (url.indexOf('blob:') === 0) {
              var urls = Object.assign({}, self.state.urls);
              urls[path] = url;
              self.setState({ urls: urls });
            }
          }).catch(function () {});
        } catch (e) {}
      });
    },

    initSortable: function () {
      if (this.sortable) {
        this.sortable.destroy();
        this.sortable = null;
      }
      this.sortableEl = this.gridEl;
      if (!this.gridEl || !Sortable) return;
      this.sortable = Sortable.create(this.gridEl, {
        animation: 150,
        ghostClass: 'mg-ghost',
        // am Handy kurz gedrückt halten zum Ziehen, sonst scrollt die Seite normal
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

    render: function () {
      var self = this;
      var layout = this.layout();
      var items = this.items();
      var mobile = this.state.mobile;
      var selected = this.state.selected !== null && this.state.selected < items.length ? this.state.selected : null;
      var natural = layout === 'mosaik';
      var hasCustom = items.some(function (item) {
        return item && item.get('groesse');
      });

      var tiles = items.map(function (item, i) {
        var path = item.get('bild');
        var size = effectiveSize(layout, i, item.get('groesse'));
        var src = self.state.urls[path] || previewUrl(path);
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
            src: src,
            alt: item.get('beschreibung') || '',
            loading: 'lazy',
            onError: function (e) {
              if (e.target.src.indexOf('/.netlify/images') !== -1) e.target.src = path;
            },
          }),
          !natural && size !== 'normal' ? h('span', { className: 'mg-badge' }, SIZE_LABEL[size]) : null,
          h('span', { className: 'mg-num' }, String(i + 1)),
        );
      });

      var tools = null;
      if (selected !== null && !natural) {
        var current = effectiveSize(layout, selected, items[selected].get('groesse'));
        tools = h(
          'div',
          { className: 'mg-tools' },
          h('span', { className: 'mg-hint', style: { margin: 0 } }, 'Bild ' + (selected + 1) + ':'),
          h(
            'div',
            { className: 'mg-seg' },
            SIZES.map(function (s) {
              return h(
                'button',
                {
                  key: s[0],
                  type: 'button',
                  className: current === s[0] ? 'on' : '',
                  onClick: function () {
                    self.setSize(selected, s[0]);
                  },
                },
                s[1],
              );
            }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mg-btn',
              onClick: function () {
                self.setState({ selected: null });
              },
            },
            'Fertig',
          ),
        );
      } else if (selected !== null && natural) {
        tools = h(
          'p',
          { className: 'mg-hint', style: { marginTop: 12 } },
          'Im Mosaik behalten Bilder ihr natürliches Format. Für eigene Größen oben das Layout „Raster“ oder „Highlight“ wählen.',
        );
      }

      var hint = natural
        ? 'Bilder per Ziehen umsortieren (am Handy: kurz gedrückt halten). Die Nummern zeigen die Reihenfolge.'
        : 'Bilder per Ziehen umsortieren (am Handy: kurz gedrückt halten). Bild antippen, um die Größe zu ändern. Lücken füllt die Website automatisch.';

      var editor = h(
        'div',
        { className: 'mg-box' },
        h(
          'div',
          { className: 'mg-head' },
          h('span', { className: 'mg-title' }, 'Vorschau – so sieht es auf der Website aus'),
          h(
            'div',
            { className: 'mg-seg' },
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
        ),
        h('p', { className: 'mg-hint' }, hint),
        h(
          'div',
          { className: 'mg-stage' + (mobile ? ' mobile' : '') },
          items.length === 0
            ? h('div', { className: 'mg-empty' }, 'Noch keine Bilder – unten über „Bild hinzufügen“ hochladen.')
            : h(
                'div',
                { className: 'mg-wrap' },
                h(
                  'div',
                  {
                    className: 'mg-grid' + (natural ? ' natural' : ''),
                    // Website: Handy = 2 Spalten (Mosaik: 1), Computer = 3 Spalten
                    style: { '--cols': mobile ? (natural ? 1 : 2) : 3 },
                    ref: function (el) {
                      self.gridEl = el;
                    },
                  },
                  tiles,
                ),
              ),
        ),
        tools,
        hasCustom && !natural
          ? h(
              'div',
              { className: 'mg-tools' },
              h(
                'button',
                { type: 'button', className: 'mg-btn', onClick: self.resetSizes },
                'Alle Größen auf die Vorlage zurücksetzen',
              ),
            )
          : null,
      );

      return h(
        'div',
        null,
        editor,
        h('div', { className: 'mg-sub' }, 'Bilder hochladen, beschreiben, löschen'),
        h(ListControl, this.props),
      );
    },
  });

  var LayoutControl = createClass({
    handleChange: function (value, metadata) {
      this.props.onChange(value, metadata);
      window.dispatchEvent(new CustomEvent(LAYOUT_EVENT, { detail: value }));
    },
    render: function () {
      return h(SelectControl, Object.assign({}, this.props, { onChange: this.handleChange }));
    },
  });

  CMS.registerWidget('galerie', GalerieControl, list.preview);
  CMS.registerWidget('galerie-layout', LayoutControl, select.preview);
})();
