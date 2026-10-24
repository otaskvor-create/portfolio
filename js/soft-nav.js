/* ============================================================
   SOFT NAVIGATION  (page-to-page without a document reload)

   Why: when a new page is loaded, the browser forgets where the mouse
   is until it physically moves, and in the meantime it draws the OS
   arrow on top of the custom cursor. A page script cannot hide or
   refresh that. The only reliable fix is to not load a new document:
   the next page is fetched, its content is swapped into the current
   document, and its scripts are run again. The pointer is never lost,
   so the native cursor stays hidden.

   Safe by design:
   - only for mouse devices (hover + fine pointer) over http(s);
     touch devices and file:// behave exactly as before
   - ANY problem (network, parsing, a script error) falls back to a
     normal page load of the same URL
   - set ENABLED = false below to switch the whole thing off

   Must be loaded BEFORE main.js: it records the document / window
   listeners that the page scripts add so that they can be removed
   before the next page's scripts register theirs again.
   ============================================================ */
(function () {
  var ENABLED = true;

  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!ENABLED || !fine || !/^https?:$/.test(location.protocol) ||
      !window.fetch || !window.DOMParser || !window.Promise ||
      !window.history || !history.pushState || !window.EventTarget) return;
  if (window.__softNav) return;

  var nativeAdd = EventTarget.prototype.addEventListener;
  var nativeRemove = EventTarget.prototype.removeEventListener;

  /* ---------- Track document / window listeners of the page scripts ---------- */
  var tracked = [];
  var running = false;     // true while the next page's scripts are executing
  var pendingReady = [];   // DOMContentLoaded / load listeners added during that run

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if ((this === document || this === window || !this) && listener && !listener.__softNavKeep) {
      var target = this || window;
      tracked.push({ t: target, type: type, l: listener, o: options });
      if (running && (type === 'DOMContentLoaded' || type === 'load')) {
        pendingReady.push({ t: target, type: type, l: listener });
      }
    }
    return nativeAdd.apply(this, arguments);
  };

  /* ---------- Track observers and intervals (so the old page's ones can be stopped) ---------- */
  var observers = [];
  ['IntersectionObserver', 'MutationObserver', 'ResizeObserver'].forEach(function (name) {
    var Native = window[name];
    if (!Native) return;
    var Tracked = function (cb, opts) { var o = new Native(cb, opts); observers.push(o); return o; };
    Tracked.prototype = Native.prototype;
    window[name] = Tracked;
  });

  var intervals = [];
  var nativeSetInterval = window.setInterval;
  window.setInterval = function () {
    var id = nativeSetInterval.apply(window, arguments);
    intervals.push(id);
    return id;
  };

  function teardown() {
    tracked.forEach(function (r) { try { nativeRemove.call(r.t, r.type, r.l, r.o); } catch (e) {} });
    tracked = [];
    observers.forEach(function (o) { try { o.disconnect(); } catch (e) {} });
    observers = [];
    intervals.forEach(function (id) { clearInterval(id); });
    intervals = [];
  }

  /* ---------- Loading the next page ---------- */
  var SKIP_SCRIPT = /(^|\/)(soft-nav|cursor)\.js(\?|$)/;

  function fetchText(url, ctrl) {
    return fetch(url, { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res;
    });
  }

  function load(url) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);

    return fetchText(url, ctrl).then(function (res) {
      var type = res.headers.get('content-type') || '';
      if (type.indexOf('text/html') === -1) throw new Error('not an HTML page');
      return res.text();
    }).then(function (html) {
      clearTimeout(timer);
      var doc = new DOMParser().parseFromString(html, 'text/html');
      if (!doc.body) throw new Error('page has no body');

      var pageUrl = new URL(url, location.href);
      var jobs = [];
      [].slice.call(doc.querySelectorAll('script')).forEach(function (s) {
        var type = (s.getAttribute('type') || '').toLowerCase();
        if (type && !/javascript|ecmascript/.test(type)) {
          if (type === 'module') throw new Error('module scripts are not supported');
          return;                                    // json, templates, ...
        }
        var src = s.getAttribute('src');
        if (src) {
          var abs = new URL(src, pageUrl).href;
          if (SKIP_SCRIPT.test(abs)) return;
          jobs.push(fetchText(abs).then(function (r) { return r.text(); }).then(function (code) {
            return code + '\n//# sourceURL=' + abs;
          }));
        } else {
          jobs.push(Promise.resolve(s.textContent));
        }
      });

      return Promise.all(jobs).then(function (codes) { return { doc: doc, codes: codes }; });
    });
  }

  /* ---------- Swapping the content ---------- */
  function syncHead(doc) {
    var head = document.head;

    // <title> and the description are replaced as elements, because
    // case-i18n.js reads their data-en / data-cs attributes.
    ['title', 'meta[name="description"]'].forEach(function (sel) {
      var next = doc.head.querySelector(sel), old = head.querySelector(sel);
      if (!next) return;
      var copy = document.importNode(next, true);
      if (old) old.replaceWith(copy); else head.appendChild(copy);
    });

    // Page specific <style> blocks: add the new ones, then drop the old ones.
    var oldStyles = [].slice.call(head.querySelectorAll('style'));
    [].slice.call(doc.head.querySelectorAll('style')).forEach(function (s) {
      head.appendChild(document.importNode(s, true));
    });
    oldStyles.forEach(function (s) { s.remove(); });

    // Stylesheets that the current page does not have yet.
    var have = {};
    [].slice.call(head.querySelectorAll('link[rel~="stylesheet"]')).forEach(function (l) { have[l.href] = true; });
    [].slice.call(doc.head.querySelectorAll('link[rel~="stylesheet"]')).forEach(function (l) {
      var href = new URL(l.getAttribute('href'), location.href).href;   // location is already the new page
      if (have[href]) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      head.appendChild(link);
    });
  }

  function runScripts(codes) {
    pendingReady = [];
    running = true;
    try {
      // One shared function scope for all scripts of the page, in order,
      // exactly like the top level of separate <script> tags shares globals.
      (new Function(codes.join('\n;\n')))();
    } finally {
      running = false;
    }
    // The page is already loaded, so DOMContentLoaded / load will not fire again by themselves.
    var ready = pendingReady;
    pendingReady = [];
    setTimeout(function () {
      ready.forEach(function (r) {
        var ev = new Event(r.type);
        try { typeof r.l === 'function' ? r.l.call(r.t, ev) : r.l.handleEvent(ev); } catch (e) { console.error(e); }
      });
    }, 0);
  }

  var currentPath = location.pathname;
  var busy = false;
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  function swap(url, page, opts) {
    var u = new URL(url, location.href);

    if (opts.push) {
      try { history.replaceState(Object.assign({}, history.state, { y: window.scrollY }), ''); } catch (e) {}
      history.pushState({ softNav: true }, '', u.href);     // before inserting, so relative URLs resolve against the new page
    }
    currentPath = u.pathname;

    teardown();
    syncHead(page.doc);
    document.documentElement.lang = page.doc.documentElement.lang || document.documentElement.lang;

    var body = document.body;
    body.className = page.doc.body.className;
    body.style.overflow = '';
    [].slice.call(page.doc.body.querySelectorAll('script')).forEach(function (s) { s.remove(); });
    body.innerHTML = page.doc.body.innerHTML;

    window.scrollTo({ top: opts.y || 0, left: 0, behavior: 'instant' });

    runScripts(page.codes);

    if (u.hash && opts.push) {
      var el = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (el) el.scrollIntoView();
    }
    window.dispatchEvent(new Event('softnav:done'));
  }

  function navigate(url, opts) {
    if (busy) return;
    busy = true;

    var body = document.body;
    var started = Date.now();
    body.style.transition = 'opacity 0.22s ease';       // same fade-out as the normal page change
    body.style.opacity = '0';

    load(url).then(function (page) {
      var wait = Math.max(0, 210 - (Date.now() - started));
      return new Promise(function (resolve) { setTimeout(resolve, wait); }).then(function () { return page; });
    }).then(function (page) {
      swap(url, page, opts);
      busy = false;
    }).catch(function (err) {
      console.warn('[soft-nav] normal page load instead:', err);
      location.href = url;
    });
  }

  /* ---------- Hooks (registered with the native method: not tracked, never removed) ---------- */
  nativeAdd.call(document, 'click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var tgt = a.getAttribute('target');
    if ((tgt && tgt !== '_self') || a.hasAttribute('download')) return;
    if (!/^https?:$/.test(a.protocol) || a.origin !== location.origin) return;
    if (a.pathname === location.pathname) return;                     // same page / only a #hash
    if (!/\.html?$/i.test(a.pathname) && a.pathname.slice(-1) !== '/') return;   // pdf, images, ...

    e.preventDefault();
    e.stopPropagation();           // main.js would otherwise start its own (hard) navigation
    navigate(a.href, { push: true });
  }, true);

  nativeAdd.call(window, 'popstate', function (e) {
    if (location.pathname === currentPath) return;                    // #hash or ?lang change
    navigate(location.href, { push: false, y: e.state && e.state.y });
  });

  window.__softNav = { navigate: function (url) { navigate(new URL(url, location.href).href, { push: true }); } };
})();
