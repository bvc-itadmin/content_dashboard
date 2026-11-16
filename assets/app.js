/* Shared by every screen after sign-in: checks the sign-in, fills the name, hides what a person may not use, wires the menu. */
(function () {
  'use strict';

  var PAGES = {
    'home': 'home_dashboard',
    'add-content': 'add_edit_content',
    'manage-content': 'manage_content',
    'manage-photos': 'manage_photos',
    'settings-admin': 'settings_admin'
  };
  var HAS_PHONE_VERSION = { home_dashboard: 1, add_edit_content: 1, manage_content: 1 };

  function small() { return window.matchMedia('(max-width: 1023px)').matches; }
  function pageUrl(folder) {
    var f = (small() && HAS_PHONE_VERSION[folder]) ? folder + '_mobile' : folder;
    return '/' + f + '/code.html';
  }
  function currentFolder() {
    var m = location.pathname.match(/^\/([a-z_]+?)(?:_mobile)?\/code\.html$/);
    return m ? m[1] : '';
  }

  // Phone-sized window gets the phone layout, and the other way round.
  var here = currentFolder();
  if (HAS_PHONE_VERSION[here]) {
    var onMobile = /_mobile\//.test(location.pathname);
    if (small() !== onMobile) { location.replace(pageUrl(here)); return; }
  }

  function api(method, url, body) {
    return fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'bvc-dashboard' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401) { location.href = '/'; }
        return { ok: r.ok, status: r.status, data: d };
      });
    });
  }
  window.bvcApi = api;
  window.bvcPageUrl = pageUrl;

  function signOut() {
    api('POST', '/api/logout').then(function () { location.href = '/'; });
  }

  function replaceText(root, from, to) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf(from) > -1) n.nodeValue = n.nodeValue.split(from).join(to);
    }
  }

  function wire(me) {
    if (me.role !== 'admin') {
      document.querySelectorAll('[data-admin-only]').forEach(function (el) { el.remove(); });
      if (here === 'settings_admin') { location.replace(pageUrl('home_dashboard')); return; }
    }
    replaceText(document.body, 'Your Name', me.name);

    document.querySelectorAll('a[data-path]').forEach(function (a) {
      var key = a.getAttribute('data-path');
      if (key === 'login') {
        a.addEventListener('click', function (e) { e.preventDefault(); signOut(); });
      } else if (PAGES[key]) {
        a.setAttribute('href', pageUrl(PAGES[key]));
      }
    });
    document.querySelectorAll('button').forEach(function (b) {
      var t = (b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var l = (b.getAttribute('aria-label') || '').toLowerCase();
      if (t === 'log out' || t === 'logout' || l.indexOf('log out') > -1 || l.indexOf('logout') > -1) {
        b.addEventListener('click', function (e) { e.preventDefault(); signOut(); });
      }
    });
    document.documentElement.setAttribute('data-ready', '1');
    document.dispatchEvent(new CustomEvent('bvc:ready', { detail: me }));
  }

  api('GET', '/api/me').then(function (r) { if (r.ok) wire(r.data); });
})();
