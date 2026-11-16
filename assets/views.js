/* The working screens. Each page has <div id="bvc-view" data-view="..."> and this script fills it with real data from the website. */
(function () {
  'use strict';

  var root = document.getElementById('bvc-view');
  if (!root) return;
  var VIEW = root.getAttribute('data-view');
  var api = function () { return window.bvcApi.apply(null, arguments); };
  var url = function (f) { return window.bvcPageUrl(f); };
  var Q = new URLSearchParams(location.search);

  var TYPES = [
    { id: 'post', name: 'Blog', icon: 'article', blurb: 'An article for the blog page' },
    { id: 'bvc_event', name: 'Event', icon: 'event', blurb: 'A seminar, workshop or webinar' },
    { id: 'bvc_broadcast', name: 'News', icon: 'campaign', blurb: 'A notice or announcement' },
    { id: 'bvc_insight', name: 'Insight', icon: 'menu_book', blurb: 'A technical briefing or advisory' }
  ];
  var typeName = function (id) { var t = TYPES.filter(function (x) { return x.id === id; })[0]; return t ? t.name : id; };
  var typeIcon = function (id) { var t = TYPES.filter(function (x) { return x.id === id; })[0]; return t ? t.icon : 'article'; };

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function when(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function pill(status) {
    if (status === 'publish') return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-label-sm"><span class="w-2 h-2 rounded-full bg-[#16a34a]"></span>Online</span>';
    if (status === 'trash') return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-label-sm">Deleted</span>';
    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fef9c3] text-[#854d0e] text-xs font-label-sm">Draft</span>';
  }
  function typePill(id) { return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-label-sm">' + esc(typeName(id)) + '</span>'; }
  var btn = 'min-h-[44px] px-space-md py-space-xs rounded-lg font-label-lg text-label-lg inline-flex items-center justify-center gap-1.5 transition-colors ';
  var BTN = {
    primary: btn + 'bg-primary-container text-on-primary hover:bg-primary',
    plain: btn + 'bg-surface-container text-primary hover:bg-surface-container-high border border-outline-variant',
    danger: btn + 'bg-surface-container text-error hover:bg-error-container border border-outline-variant'
  };
  var CARD = 'bg-surface-container-lowest rounded-xl border border-outline-variant';
  var INPUT = 'w-full min-h-[48px] px-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-body text-body border border-outline-variant focus:border-primary-container focus:outline-none';
  var PADDED = /px-gutter-mobile/.test(root.parentElement.className); // phone pages already have side padding
  function wrap(inner) { return '<div class="w-full max-w-[1200px] mx-auto ' + (PADDED ? 'px-0' : 'px-gutter-mobile md:px-margin') + ' py-space-lg flex flex-col gap-space-lg">' + inner + '</div>'; }
  function loading() { root.innerHTML = wrap('<p class="font-body text-on-surface-variant">Loading…</p>'); }

  function toast(msg, bad) {
    var t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.className = 'fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-8 z-[100] max-w-[92vw] px-space-lg py-space-sm rounded-lg shadow-lg font-label-lg text-label-lg ' + (bad ? 'bg-error text-on-error' : 'bg-primary text-on-primary');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3800);
  }
  function modal(html, onclose) {
    var o = document.createElement('div');
    o.className = 'fixed inset-0 z-[90] bg-inverse-surface/50 flex items-center justify-center p-space-md overflow-y-auto';
    o.innerHTML = '<div role="dialog" aria-modal="true" class="' + CARD + ' shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-space-lg">' + html + '</div>';
    function close() { o.remove(); if (onclose) onclose(); }
    o.addEventListener('click', function (e) { if (e.target === o) close(); });
    document.body.appendChild(o);
    return { el: o.firstChild, close: close };
  }
  function ask(message, okLabel, danger) {
    return new Promise(function (resolve) {
      var m = modal('<p class="font-body text-body text-on-surface mb-space-lg">' + esc(message) + '</p><div class="flex justify-end gap-space-sm"><button type="button" data-no class="' + BTN.plain + '">Cancel</button><button type="button" data-yes class="' + (danger ? BTN.danger : BTN.primary) + '">' + esc(okLabel) + '</button></div>');
      m.el.querySelector('[data-no]').onclick = function () { m.close(); resolve(false); };
      m.el.querySelector('[data-yes]').onclick = function () { m.close(); resolve(true); };
    });
  }
  function fail(r, fallback) { toast((r.data && r.data.message) || fallback || 'Something went wrong.', true); }

  /* ---------- photos: shrink in the browser, then upload ---------- */
  function shrink(file) {
    return createImageBitmap(file).then(function (bmp) {
      var s = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
      var w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(bmp, 0, 0, w, h);
      return new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.82); });
    }).then(function (blob) {
      return blob.arrayBuffer().then(function (buf) {
        var b = new Uint8Array(buf), bin = '';
        for (var i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
        return { name: file.name.replace(/\.[^.]+$/, '') + '.jpg', data: btoa(bin) };
      });
    });
  }
  function uploadPhoto(file) {
    if (!/^image\//.test(file.type)) { toast('Please choose a photo.', true); return Promise.resolve(null); }
    return shrink(file).then(function (p) { return api('POST', '/api/media', { name: p.name, data: p.data }); }).then(function (r) {
      if (!r.ok) { fail(r, 'The photo could not be uploaded.'); return null; }
      return r.data;
    }).catch(function () { toast('That photo could not be read.', true); return null; });
  }
  function pickPhoto(onPick) {
    var m = modal('<div class="flex items-center justify-between mb-space-md"><h3 class="font-headline-sm text-headline-sm text-primary">Choose a photo</h3><button type="button" data-x aria-label="Close" class="w-11 h-11 rounded-lg hover:bg-surface-container"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div class="flex flex-wrap gap-space-sm mb-space-md"><label class="' + BTN.primary + ' cursor-pointer"><span class="material-symbols-outlined text-[20px]">photo_camera</span>Take a photo<input type="file" accept="image/*" capture="environment" class="sr-only" data-file></label>' +
      '<label class="' + BTN.plain + ' cursor-pointer"><span class="material-symbols-outlined text-[20px]">upload</span>Upload from this device<input type="file" accept="image/*" class="sr-only" data-file></label></div>' +
      '<div data-grid class="grid grid-cols-2 sm:grid-cols-3 gap-space-sm"><p class="col-span-full text-on-surface-variant">Loading…</p></div>');
    m.el.querySelector('[data-x]').onclick = m.close;
    function pick(p) { m.close(); onPick(p); }
    function load() {
      api('GET', '/api/media').then(function (r) {
        var g = m.el.querySelector('[data-grid]');
        if (!r.ok) { g.innerHTML = '<p class="col-span-full text-error">Could not load photos.</p>'; return; }
        g.innerHTML = r.data.items.map(function (p) {
          return '<button type="button" data-id="' + p.id + '" class="rounded-lg overflow-hidden border border-outline-variant hover:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container"><img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + '" class="w-full h-28 object-cover" loading="lazy"></button>';
        }).join('') || '<p class="col-span-full text-on-surface-variant">No photos yet. Upload the first one above.</p>';
        g.querySelectorAll('button').forEach(function (b) {
          b.onclick = function () { var id = Number(b.getAttribute('data-id')); pick(r.data.items.filter(function (p) { return p.id === id; })[0]); };
        });
      });
    }
    m.el.querySelectorAll('[data-file]').forEach(function (inp) {
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        toast('Uploading…');
        uploadPhoto(f).then(function (p) { if (p) pick(p); });
      };
    });
    load();
  }

  /* ---------- Home ---------- */
  function home(me) {
    loading();
    api('GET', '/api/overview').then(function (r) {
      if (!r.ok) { root.innerHTML = wrap('<p class="text-error">Could not load. Please refresh.</p>'); return; }
      var c = r.data.counts, h = new Date().getHours();
      var hello = h < 12 ? 'Good morning' : (h < 17 ? 'Good afternoon' : 'Good evening');
      var stat = function (n, label, tone) { return '<div class="' + CARD + ' p-space-md flex flex-col gap-1"><span class="font-display text-display-mobile md:text-display ' + tone + '">' + n + '</span><span class="font-label-sm text-label-sm text-on-surface-variant">' + label + '</span></div>'; };
      var quick = TYPES.map(function (t) {
        return '<a href="' + url('add_edit_content') + '?type=' + t.id + '" class="' + CARD + ' p-space-md hover:border-primary-container transition-colors flex items-center gap-space-md min-h-[72px]"><span class="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined">' + t.icon + '</span></span><span class="flex flex-col"><span class="font-body-semibold text-body-semibold text-primary">Add ' + t.name + '</span><span class="font-label-sm text-label-sm text-on-surface-variant">' + t.blurb + '</span></span></a>';
      }).join('');
      var recent = r.data.recent.map(function (i) { return itemRow(i, false); }).join('') || '<p class="p-space-lg text-on-surface-variant">Nothing yet. Add the first item above.</p>';
      root.innerHTML = wrap(
        '<div><h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">' + hello + ', ' + esc(me.name.split(' ')[0]) + '.</h1><p class="font-body text-on-surface-variant mt-1">What would you like to publish on bvcglobal.com today?</p></div>' +
        '<div class="grid grid-cols-3 gap-space-sm">' + stat(c.online, 'Online', 'text-primary') + stat(c.drafts, 'Drafts', 'text-secondary') + stat(c.total, 'Total', 'text-on-surface') + '</div>' +
        '<div><h2 class="font-headline-sm text-headline-sm text-primary mb-space-sm">Add something new</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">' + quick + '</div></div>' +
        '<div class="flex flex-wrap gap-space-sm"><a class="' + BTN.plain + '" href="' + url('manage_content') + '"><span class="material-symbols-outlined text-[20px]">view_list</span>Manage content</a><a class="' + BTN.plain + '" href="' + url('manage_photos') + '"><span class="material-symbols-outlined text-[20px]">photo_library</span>Photos</a></div>' +
        '<div class="' + CARD + ' overflow-hidden"><div class="p-space-md border-b border-outline-variant"><h2 class="font-headline-sm text-headline-sm text-primary">Recently updated</h2></div><div data-list>' + recent + '</div></div>');
      bindRows(root, function () { home(me); });
    });
  }

  /* one row of content (used on Home and in Manage Content) */
  function itemRow(i, withActions) {
    var thumb = i.image ? '<img src="' + esc(i.image) + '" alt="" class="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy">' : '<span class="w-14 h-14 rounded-lg bg-surface-container text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined">' + typeIcon(i.type) + '</span></span>';
    var edit = '<a class="' + BTN.plain + '" href="' + url('add_edit_content') + '?id=' + i.id + '"><span class="material-symbols-outlined text-[18px]">edit</span>Edit</a>';
    var view = i.link ? '<a class="' + BTN.plain + '" href="' + esc(i.link) + '" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[18px]">open_in_new</span>View</a>' : '';
    var more = '';
    if (withActions) {
      if (i.status === 'trash') more = '<button type="button" class="' + BTN.plain + '" data-act="draft" data-id="' + i.id + '">Restore</button>';
      else more = (i.status === 'publish' ? '<button type="button" class="' + BTN.plain + '" data-act="draft" data-id="' + i.id + '">Take offline</button>' : '<button type="button" class="' + BTN.primary + '" data-act="publish" data-id="' + i.id + '">Publish</button>') +
        '<button type="button" class="' + BTN.danger + '" data-act="trash" data-id="' + i.id + '" data-title="' + esc(i.title) + '"><span class="material-symbols-outlined text-[18px]">delete</span>Delete</button>';
    }
    return '<div class="p-space-md border-b border-outline-variant last:border-0 flex flex-col md:flex-row md:items-center gap-space-sm" data-row="' + i.id + '">' +
      '<div class="flex items-center gap-space-md min-w-0 flex-1">' + thumb + '<div class="min-w-0"><div class="flex flex-wrap items-center gap-1.5 mb-1">' + typePill(i.type) + pill(i.status) + '<span class="font-label-sm text-[12px] text-outline">' + esc(when(i.modified)) + '</span></div>' +
      '<div class="font-body-semibold text-body-semibold text-on-surface truncate">' + esc(i.title || '(no headline)') + '</div></div></div>' +
      '<div class="flex flex-wrap gap-space-xs md:justify-end">' + edit + view + more + '</div></div>';
  }
  function bindRows(scope, refresh) {
    scope.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute('data-act'), id = b.getAttribute('data-id');
        var go = function () {
          b.disabled = true;
          api('POST', '/api/item?id=' + id, { status: act }).then(function (r) {
            if (!r.ok) { b.disabled = false; return fail(r); }
            toast(act === 'trash' ? 'Deleted.' : (act === 'publish' ? 'Published.' : 'Done.'));
            refresh();
          });
        };
        if (act === 'trash') ask('Delete "' + (b.getAttribute('data-title') || 'this item') + '"? It leaves the website now.', 'Delete', true).then(function (y) { if (y) go(); });
        else go();
      };
    });
  }

  /* ---------- Manage Content ---------- */
  function manage() {
    var st = { type: '', status: '', q: '', page: 1 }, timer;
    var tabs = [['', 'All'], ['publish', 'Online'], ['draft', 'Drafts'], ['trash', 'Deleted']];
    root.innerHTML = wrap(
      '<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Manage content</h1>' +
      '<div class="' + CARD + ' p-space-md flex flex-col gap-space-sm"><div class="flex flex-col md:flex-row gap-space-sm">' +
      '<input data-q type="search" placeholder="Search by headline" aria-label="Search" class="' + INPUT + ' md:flex-1">' +
      '<select data-type aria-label="Type" class="' + INPUT + ' md:w-56"><option value="">All types</option>' + TYPES.map(function (t) { return '<option value="' + t.id + '">' + t.name + '</option>'; }).join('') + '</select></div>' +
      '<div class="flex flex-wrap gap-space-xs" data-tabs></div></div>' +
      '<div class="' + CARD + ' overflow-hidden"><div data-list></div><div class="p-space-md text-center" data-more></div></div>');
    var list = root.querySelector('[data-list]'), more = root.querySelector('[data-more]'), tabBox = root.querySelector('[data-tabs]');
    function drawTabs() {
      tabBox.innerHTML = tabs.map(function (t) {
        var on = st.status === t[0];
        return '<button type="button" data-s="' + t[0] + '" class="px-3 py-1.5 rounded-lg font-label-sm text-label-sm min-h-[40px] ' + (on ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface') + '">' + t[1] + '</button>';
      }).join('');
      tabBox.querySelectorAll('button').forEach(function (b) { b.onclick = function () { st.status = b.getAttribute('data-s'); st.page = 1; drawTabs(); load(false); }; });
    }
    function load(append) {
      if (!append) list.innerHTML = '<p class="p-space-lg text-on-surface-variant">Loading…</p>';
      var qs = '?page=' + st.page + (st.type ? '&type=' + st.type : '') + (st.status ? '&status=' + st.status : '') + (st.q ? '&q=' + encodeURIComponent(st.q) : '');
      api('GET', '/api/items' + qs).then(function (r) {
        if (!r.ok) { list.innerHTML = '<p class="p-space-lg text-error">Could not load.</p>'; return; }
        var html = r.data.items.map(function (i) { return itemRow(i, true); }).join('');
        if (append) list.insertAdjacentHTML('beforeend', html); else list.innerHTML = html || '<p class="p-space-lg text-on-surface-variant">Nothing found.</p>';
        more.innerHTML = st.page < r.data.pages ? '<button type="button" class="' + BTN.plain + '" data-more-btn>Show more</button>' : '<span class="font-label-sm text-on-surface-variant">' + r.data.total + ' item' + (r.data.total === 1 ? '' : 's') + '</span>';
        var mb = more.querySelector('[data-more-btn]'); if (mb) mb.onclick = function () { st.page++; load(true); };
        bindRows(list, function () { st.page = 1; load(false); });
      });
    }
    root.querySelector('[data-q]').oninput = function (e) { clearTimeout(timer); var v = e.target.value; timer = setTimeout(function () { st.q = v.trim(); st.page = 1; load(false); }, 350); };
    root.querySelector('[data-type]').onchange = function (e) { st.type = e.target.value; st.page = 1; load(false); };
    drawTabs(); load(false);
  }

  /* ---------- Add / Edit ---------- */
  function addEdit() {
    var id = Number(Q.get('id')) || 0;
    var state = { id: id, type: Q.get('type') || 'post', image_id: 0, image: '', status: 'draft', link: '' };
    if (!TYPES.some(function (t) { return t.id === state.type; })) state.type = 'post';
    loading();
    var start = id ? api('GET', '/api/item?id=' + id) : Promise.resolve({ ok: true, data: null });
    start.then(function (r) {
      if (!r.ok) { root.innerHTML = wrap('<p class="text-error">That item could not be opened.</p><a class="' + BTN.plain + '" href="' + url('manage_content') + '">Back to Manage content</a>'); return; }
      var it = r.data;
      if (it) { state.type = it.type; state.image_id = it.image_id || 0; state.image = it.image || ''; state.status = it.status; state.link = it.link || ''; }
      draw(it);
    });

    function field(label, inner, hint) { return '<div class="flex flex-col gap-1"><label class="font-body-semibold text-body-semibold text-on-surface">' + label + '</label>' + inner + (hint ? '<span class="font-label-sm text-[12px] text-on-surface-variant">' + hint + '</span>' : '') + '</div>'; }
    function extra(it) {
      var m = (it && it.meta) || {}, v = function (k) { return esc(m[k] || ''); };
      if (state.type === 'bvc_event') return '<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">' +
        field('Event date', '<input type="date" data-m="bvc_event_date" value="' + v('bvc_event_date') + '" class="' + INPUT + '">') +
        field('Time', '<input type="text" data-m="bvc_event_time" value="' + v('bvc_event_time') + '" placeholder="10:30 AM - 1:00 PM" class="' + INPUT + '">') +
        field('Venue', '<input type="text" data-m="bvc_event_venue" value="' + v('bvc_event_venue') + '" class="' + INPUT + '">') +
        field('Registration link (optional)', '<input type="url" data-m="bvc_event_url" value="' + v('bvc_event_url') + '" placeholder="https://" class="' + INPUT + '">') + '</div>';
      if (state.type === 'bvc_broadcast') return '<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">' +
        field('Show until (optional)', '<input type="date" data-m="bvc_expiry_date" value="' + v('bvc_expiry_date') + '" class="' + INPUT + '">', 'After this date the notice moves off the front of the News page.') +
        field('Button text (optional)', '<input type="text" data-m="bvc_cta_text" value="' + v('bvc_cta_text') + '" class="' + INPUT + '">') +
        field('Button link (optional)', '<input type="url" data-m="bvc_cta_url" value="' + v('bvc_cta_url') + '" placeholder="https://" class="' + INPUT + '">') + '</div>';
      return '';
    }
    function autop(html) {
      if (!html) return '';
      if (/<(p|h[1-6]|ul|ol|div|figure|blockquote|table)\b/i.test(html)) return html;
      return html.split(/\n\s*\n/).map(function (p) { return p.trim() ? '<p>' + p.trim().replace(/\n/g, '<br>') + '</p>' : ''; }).join('');
    }
    function tool(cmd, label, icon, arg) { return '<button type="button" data-cmd="' + cmd + '"' + (arg ? ' data-arg="' + arg + '"' : '') + ' aria-label="' + label + '" title="' + label + '" class="w-11 h-11 rounded-lg hover:bg-surface-container-high text-on-surface flex items-center justify-center font-body-semibold">' + icon + '</button>'; }

    function draw(it) {
      var isNew = !state.id;
      root.innerHTML = wrap(
        '<div class="flex flex-wrap items-center justify-between gap-space-sm"><h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">' + (isNew ? 'Add' : 'Edit') + ' <span data-typename>' + esc(typeName(state.type)) + '</span></h1>' + (state.link ? '<a class="' + BTN.plain + '" href="' + esc(state.link) + '" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[18px]">open_in_new</span>View on site</a>' : '') + '</div>' +
        '<div class="' + CARD + ' p-space-lg flex flex-col gap-space-lg">' +
        (isNew ? field('What are you adding?', '<select data-type class="' + INPUT + '">' + TYPES.map(function (t) { return '<option value="' + t.id + '"' + (t.id === state.type ? ' selected' : '') + '>' + t.name + ' - ' + t.blurb + '</option>'; }).join('') + '</select>') : '') +
        field('Headline', '<input type="text" data-title maxlength="200" value="' + esc(it ? it.title : '') + '" placeholder="Write a clear headline" class="' + INPUT + '">') +
        '<div data-extra>' + extra(it) + '</div>' +
        field('Cover photo', '<div class="flex flex-wrap items-center gap-space-md"><div data-cover class="w-40 h-28 rounded-lg bg-surface-container border border-outline-variant overflow-hidden flex items-center justify-center text-outline">' + (state.image ? '<img src="' + esc(state.image) + '" alt="" class="w-full h-full object-cover">' : '<span class="material-symbols-outlined text-[32px]">image</span>') + '</div><div class="flex flex-col gap-space-xs"><button type="button" data-pick class="' + BTN.plain + '"><span class="material-symbols-outlined text-[20px]">add_a_photo</span>Choose or take a photo</button><button type="button" data-nocover class="font-label-sm text-label-sm text-error text-left' + (state.image ? '' : ' hidden') + '">Remove photo</button></div></div>', 'Shown at the top of the page and in lists. If you add a photo inside the text, it can be used automatically.') +
        field('Text', '<div class="rounded-lg border border-outline-variant overflow-hidden"><div class="flex flex-wrap gap-0.5 p-1 bg-surface-container-low border-b border-outline-variant" data-tools>' +
          tool('bold', 'Bold', '<b>B</b>') + tool('italic', 'Italic', '<i>I</i>') + tool('formatBlock', 'Heading', 'H2', 'h2') + tool('formatBlock', 'Sub-heading', 'H3', 'h3') + tool('formatBlock', 'Normal text', 'Aa', 'p') +
          tool('insertUnorderedList', 'Bullet list', '<span class="material-symbols-outlined text-[20px]">format_list_bulleted</span>') + tool('insertOrderedList', 'Numbered list', '<span class="material-symbols-outlined text-[20px]">format_list_numbered</span>') +
          tool('link', 'Add link', '<span class="material-symbols-outlined text-[20px]">link</span>') + tool('photo', 'Put a photo in the text', '<span class="material-symbols-outlined text-[20px]">image</span>') +
          tool('undo', 'Undo', '<span class="material-symbols-outlined text-[20px]">undo</span>') + tool('redo', 'Redo', '<span class="material-symbols-outlined text-[20px]">redo</span>') +
          '</div><div data-body contenteditable="true" role="textbox" aria-multiline="true" aria-label="Text" class="min-h-[280px] max-h-[60vh] overflow-y-auto p-space-md font-body-lg text-body-lg text-on-surface focus:outline-none [&_h2]:font-headline-md [&_h2]:text-headline-md [&_h2]:text-primary [&_h2]:mt-4 [&_h3]:font-title [&_h3]:text-title [&_h3]:text-primary [&_h3]:mt-3 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg">' + autop(it ? it.content : '') + '</div></div>') +
        field('Short summary (optional)', '<textarea data-summary rows="3" maxlength="400" class="' + INPUT + ' py-2">' + esc(it ? it.summary : '') + '</textarea>', 'Used under the headline in lists. Leave empty and the first lines of the text are used.') +
        '<div class="flex flex-wrap gap-space-sm pt-space-sm border-t border-outline-variant">' +
        '<button type="button" data-save="draft" class="' + BTN.plain + '"><span class="material-symbols-outlined text-[20px]">save</span>Save draft</button>' +
        '<button type="button" data-save="publish" class="' + BTN.primary + '"><span class="material-symbols-outlined text-[20px]">cloud_upload</span>' + (state.status === 'publish' ? 'Update on website' : 'Publish to website') + '</button>' +
        (isNew ? '' : '<button type="button" data-del class="' + BTN.danger + ' md:ml-auto"><span class="material-symbols-outlined text-[20px]">delete</span>Delete</button>') +
        '</div></div>');

      var body = root.querySelector('[data-body]'), saved = null;
      var typeSel = root.querySelector('[data-type]');
      if (typeSel) typeSel.onchange = function () {
        state.type = typeSel.value; root.querySelector('[data-extra]').innerHTML = extra(null); root.querySelector('[data-typename]').textContent = typeName(state.type);
      };
      function setCover(p) {
        state.image_id = p ? p.id : 0; state.image = p ? p.thumb : '';
        root.querySelector('[data-cover]').innerHTML = state.image ? '<img src="' + esc(state.image) + '" alt="" class="w-full h-full object-cover">' : '<span class="material-symbols-outlined text-[32px]">image</span>';
        root.querySelector('[data-nocover]').classList.toggle('hidden', !state.image);
      }
      root.querySelector('[data-pick]').onclick = function () { pickPhoto(setCover); };
      root.querySelector('[data-nocover]').onclick = function () { setCover(null); };

      root.querySelectorAll('[data-cmd]').forEach(function (b) {
        b.onmousedown = function (e) { e.preventDefault(); }; // keep the cursor in the text
        b.onclick = function () {
          var cmd = b.getAttribute('data-cmd'), arg = b.getAttribute('data-arg');
          body.focus();
          if (cmd === 'link') {
            var u = window.prompt('Paste the link (starting with https://)');
            if (u && /^(https?:\/\/|mailto:|tel:)/i.test(u.trim())) document.execCommand('createLink', false, u.trim());
            else if (u) toast('The link must start with https://', true);
          } else if (cmd === 'photo') {
            var sel = window.getSelection(), rng = sel.rangeCount ? sel.getRangeAt(0) : null;
            pickPhoto(function (p) {
              body.focus();
              if (rng) { sel.removeAllRanges(); sel.addRange(rng); }
              document.execCommand('insertHTML', false, '<p><img src="' + esc(p.url) + '" class="wp-image-' + p.id + '" alt=""></p>');
            });
          } else document.execCommand(cmd, false, arg ? '<' + arg + '>' : null);
        };
      });
      body.addEventListener('paste', function (e) { // plain text only: no stray fonts or colours from Word or websites
        e.preventDefault();
        var t = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertHTML', false, t.split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join(''));
      });

      root.querySelectorAll('[data-save]').forEach(function (b) {
        b.onclick = function () {
          var title = root.querySelector('[data-title]').value.trim();
          if (!title) { toast('Please write a headline first.', true); root.querySelector('[data-title]').focus(); return; }
          var meta = {}; root.querySelectorAll('[data-m]').forEach(function (i) { meta[i.getAttribute('data-m')] = i.value.trim(); });
          var want = b.getAttribute('data-save');
          root.querySelectorAll('[data-save]').forEach(function (x) { x.disabled = true; });
          api('POST', '/api/items', { id: state.id || undefined, type: state.type, title: title, content: body.innerHTML, summary: root.querySelector('[data-summary]').value.trim(), status: want, image_id: state.image_id || 0, meta: meta }).then(function (r) {
            root.querySelectorAll('[data-save]').forEach(function (x) { x.disabled = false; });
            if (!r.ok) return fail(r, 'Could not save.');
            toast(want === 'publish' ? 'Published on the website.' : 'Saved as a draft.');
            if (!state.id) location.replace(url('add_edit_content') + '?id=' + r.data.id);
            else { state.status = r.data.status; state.link = r.data.link; draw(r.data); }
          });
        };
      });
      var del = root.querySelector('[data-del]');
      if (del) del.onclick = function () {
        ask('Delete this item? It leaves the website now.', 'Delete', true).then(function (y) {
          if (!y) return;
          api('POST', '/api/item?id=' + state.id, { status: 'trash' }).then(function (r) { if (r.ok) { toast('Deleted.'); location.href = url('manage_content'); } else fail(r); });
        });
      };
    }
  }

  /* ---------- Photos ---------- */
  function photos() {
    root.innerHTML = wrap(
      '<div class="flex flex-wrap items-center justify-between gap-space-sm"><h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Photos</h1><div class="flex flex-wrap gap-space-sm">' +
      '<label class="' + BTN.primary + ' cursor-pointer"><span class="material-symbols-outlined text-[20px]">photo_camera</span>Take a photo<input type="file" accept="image/*" capture="environment" class="sr-only" data-file></label>' +
      '<label class="' + BTN.plain + ' cursor-pointer"><span class="material-symbols-outlined text-[20px]">upload</span>Upload photos<input type="file" accept="image/*" multiple class="sr-only" data-file></label></div></div>' +
      '<p class="font-body text-on-surface-variant">Photos are made web-ready (up to 1920 pixels wide) before they are sent to the website.</p>' +
      '<div data-grid class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-space-md"></div><div class="text-center" data-more></div>' + (matchMedia('(max-width: 1023px)').matches ? '<a class="' + BTN.plain + ' self-start" href="' + url('home_dashboard') + '"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back to Home</a>' : ''));
    var grid = root.querySelector('[data-grid]'), more = root.querySelector('[data-more]'), page = 1;
    function card(p) { return '<a href="' + esc(p.url) + '" target="_blank" rel="noopener" class="' + CARD + ' overflow-hidden block hover:border-primary-container"><img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + '" class="w-full h-32 object-cover" loading="lazy"><div class="p-2 font-label-sm text-[12px] text-on-surface-variant truncate">' + esc(p.title) + '</div></a>'; }
    function load(reset) {
      api('GET', '/api/media?page=' + page).then(function (r) {
        if (!r.ok) { grid.innerHTML = '<p class="text-error col-span-full">Could not load photos.</p>'; return; }
        var html = r.data.items.map(card).join('');
        if (reset) grid.innerHTML = html || '<p class="col-span-full text-on-surface-variant">No photos yet.</p>'; else grid.insertAdjacentHTML('beforeend', html);
        more.innerHTML = page < r.data.pages ? '<button type="button" class="' + BTN.plain + '">Show more</button>' : '';
        var b = more.querySelector('button'); if (b) b.onclick = function () { page++; load(false); };
      });
    }
    root.querySelectorAll('[data-file]').forEach(function (inp) {
      inp.onchange = function () {
        var files = Array.prototype.slice.call(inp.files); inp.value = '';
        if (!files.length) return;
        toast('Uploading ' + files.length + ' photo' + (files.length > 1 ? 's' : '') + '…');
        files.reduce(function (chain, f) { return chain.then(function () { return uploadPhoto(f); }); }, Promise.resolve()).then(function () { toast('Done.'); page = 1; load(true); });
      };
    });
    load(true);
  }

  /* ---------- Profile (admin only) ---------- */
  function profile(me) {
    loading();
    api('GET', '/api/users').then(function (r) {
      if (!r.ok) { root.innerHTML = wrap('<p class="text-error">' + esc((r.data && r.data.message) || 'Could not load.') + '</p>'); return; }
      var rows = r.data.users.map(function (u) {
        var self = u.email.toLowerCase() === (me.email || '').toLowerCase();
        return '<div class="p-space-md border-b border-outline-variant last:border-0 flex flex-col md:flex-row md:items-center gap-space-sm"><div class="flex-1 min-w-0"><div class="font-body-semibold text-body-semibold text-on-surface">' + esc(u.name) + (self ? ' <span class="font-label-sm text-[12px] text-outline">(you)</span>' : '') + '</div><div class="font-label-sm text-label-sm text-on-surface-variant truncate">' + esc(u.email) + '</div></div>' +
          '<span class="inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-label-sm ' + (u.role === 'admin' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-fixed text-primary') + '">' + (u.role === 'admin' ? 'Admin' : 'User') + '</span>' +
          '<span class="font-label-sm text-[12px] text-outline md:w-44">' + (u.active ? 'Last active ' + esc(when(new Date(u.active * 1000).toISOString())) : 'Not signed in yet') + '</span>' +
          (self ? '<span class="md:w-24"></span>' : '<button type="button" data-remove="' + u.id + '" data-name="' + esc(u.name) + '" class="' + BTN.danger + ' md:w-24">Remove</button>') + '</div>';
      }).join('');
      root.innerHTML = wrap(
        '<div class="flex flex-wrap items-center justify-between gap-space-sm"><div><h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Profile &amp; logins</h1><p class="font-body text-on-surface-variant mt-1">Only an admin can see this page. Add a login for each person who publishes.</p></div><button type="button" data-add class="' + BTN.primary + '"><span class="material-symbols-outlined text-[20px]">person_add</span>Add login</button></div>' +
        '<div class="' + CARD + ' overflow-hidden">' + rows + '</div>' +
        (matchMedia('(max-width: 1023px)').matches ? '<a class="' + BTN.plain + ' self-start" href="' + url('home_dashboard') + '"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back to Home</a>' : ''));
      root.querySelectorAll('[data-remove]').forEach(function (b) {
        b.onclick = function () {
          ask('Remove the login for ' + b.getAttribute('data-name') + '? They can no longer sign in. Anything they wrote stays on the website.', 'Remove', true).then(function (y) {
            if (!y) return;
            api('POST', '/api/users?remove=' + b.getAttribute('data-remove'), {}).then(function (x) { if (x.ok) { toast('Login removed.'); profile(me); } else fail(x); });
          });
        };
      });
      root.querySelector('[data-add]').onclick = function () {
        var m = modal('<h3 class="font-headline-sm text-headline-sm text-primary mb-space-md">Add login</h3><form data-f class="flex flex-col gap-space-md">' +
          field2('Name', '<input name="name" required maxlength="120" class="' + INPUT + '">') +
          field2('Email', '<input name="email" type="email" required class="' + INPUT + '" placeholder="name@bvcglobal.com">') +
          field2('Can this person add logins?', '<select name="role" class="' + INPUT + '"><option value="user">No - can add and edit content</option><option value="admin">Yes - Admin</option></select>') +
          field2('Password (optional)', '<input name="password" type="text" autocomplete="off" class="' + INPUT + '" placeholder="Leave empty and one is made for you">') +
          '<div class="flex justify-end gap-space-sm"><button type="button" data-no class="' + BTN.plain + '">Cancel</button><button type="submit" class="' + BTN.primary + '">Create login</button></div></form>');
        m.el.querySelector('[data-no]').onclick = m.close;
        m.el.querySelector('[data-f]').onsubmit = function (e) {
          e.preventDefault();
          var f = e.target, d = {}; ['name', 'email', 'role', 'password'].forEach(function (k) { d[k] = f.elements[k].value.trim(); });
          f.querySelector('[type=submit]').disabled = true;
          api('POST', '/api/users', d).then(function (x) {
            if (!x.ok) { f.querySelector('[type=submit]').disabled = false; return fail(x, 'Could not create the login.'); }
            m.close();
            var done = modal('<h3 class="font-headline-sm text-headline-sm text-primary mb-space-sm">Login created</h3><p class="font-body text-on-surface mb-space-md">Give these details to ' + esc(x.data.name) + '. The password is shown only now.</p><div class="' + CARD + ' p-space-md font-mono text-body break-all mb-space-md"><div>Email: ' + esc(x.data.email) + '</div><div>Password: <b>' + esc(x.data.temporary_password) + '</b></div></div><div class="flex justify-end"><button type="button" data-ok class="' + BTN.primary + '">Done</button></div>', function () { profile(me); });
            done.el.querySelector('[data-ok]').onclick = done.close;
          });
        };
      };
    });
  }
  function field2(label, inner) { return '<label class="flex flex-col gap-1 font-body-semibold text-body-semibold text-on-surface">' + label + inner + '</label>'; }

  /* ---------- go ---------- */
  document.addEventListener('bvc:ready', function (e) {
    var me = e.detail;
    if (VIEW === 'home') home(me);
    else if (VIEW === 'manage') manage();
    else if (VIEW === 'add') addEdit();
    else if (VIEW === 'photos') photos();
    else if (VIEW === 'profile') profile(me);
  });
})();
