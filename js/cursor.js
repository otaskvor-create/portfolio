/* ============================================================
   ADAPTIVE CURSOR
   Vanilla re-implementation of the "Cursor: Adaptive caret size"
   behaviour from Motion (examples.motion.dev/react/cursor):

   - default   small dot that follows the pointer on a spring
   - pointer   grows into a ring over links / buttons
   - text      turns into a caret that matches the hovered text size
   - drag/zoom keeps the affordance of the comparison slider and
               the image galleries (they used ew-resize / zoom-in)
   - pressed   shrinks slightly
   - disabled  dims over disabled controls

   Friendly by default:
   - only for a fine pointer with hover (no touch devices)
   - disabled for prefers-reduced-motion
   - the native cursor is hidden only after the custom one is placed
   - the native cursor comes back on window leave / touch input

   Add data-cursor="pointer|text|drag|zoom|disabled|hide" to any
   element to override the automatic detection.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Tunables ---------- */
  // true  = cursor sits exactly on the pointer, no lag
  // false = cursor trails the pointer on a spring (see SPRING)
  var INSTANT = true;
  var SPRING = { stiffness: 520, damping: 42 }; // ~critically damped, low lag
  var CARET_MIN = 14;
  var CARET_MAX = 72;
  var POS_KEY = 'site-cursor-pos';

  /* ---------- Interactive element detection ---------- */
  // Semantic elements that are always clickable.
  var BASE_POINTER = [
    'a[href]', 'button', 'summary', 'select', 'label[for]',
    '[role="button"]', '[role="tab"]', '[role="link"]', '[role="menuitem"]',
    '[role="option"]', '[onclick]', 'input[type="button"]',
    'input[type="submit"]', 'input[type="checkbox"]', 'input[type="radio"]'
  ];
  // Components that set `cursor: pointer` in CSS on non-semantic elements.
  // Also gathered automatically from the stylesheets below, this is the
  // fallback for when stylesheets can't be read (e.g. file://).
  var FALLBACK_POINTER = [
    '.mob-toggle', '.section-img-preview', '.expand-preview-btn',
    '.email-row', '#emailRow', '.contact-action-item', '.lang-option',
    '.lang-dropdown-trigger', '.ux-module-card', '.theme-tab', '.code-tab',
    '.uxm-dot', '.uxm-pill', '.uxm-arrow', '.exp-expand-btn'
  ];
  var FALLBACK_ZOOM = ['.img-gallery-item', '.uxm-slide'];
  var FALLBACK_DRAG = ['.comparison-slider'];
  // Controls that look interactive but are switched off.
  var DISABLED_SEL = ':disabled, [aria-disabled="true"], .disabled';

  var CURSOR_TO_STATE = {
    'pointer': 'pointer',
    'zoom-in': 'zoom', 'zoom-out': 'zoom',
    'ew-resize': 'drag', 'col-resize': 'drag', 'grab': 'drag', 'grabbing': 'drag',
    'not-allowed': 'disabled'
  };

  var selectors = { pointer: [], zoom: [], drag: [], disabled: [] };
  var matchers = {}; // state -> combined selector string

  function isValidSelector(sel) {
    try { doc.createDocumentFragment().querySelector(sel); return true; }
    catch (e) { return false; }
  }

  function collectRules(rules) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.cssRules && !rule.selectorText) { collectRules(rule.cssRules); continue; } // @media etc.
      if (!rule.selectorText || !rule.style || !rule.style.cursor) continue;
      var state = CURSOR_TO_STATE[rule.style.cursor];
      if (!state) continue;
      rule.selectorText.split(',').forEach(function (part) {
        part = part.trim();
        // Pseudo-elements and our own cursor styles can't be matched on elements.
        if (!part || part.indexOf('::') !== -1 || part.indexOf('site-cursor') !== -1) return;
        selectors[state].push(part);
      });
    }
  }

  function buildMatchers() {
    selectors.pointer = BASE_POINTER.concat(FALLBACK_POINTER);
    selectors.zoom = FALLBACK_ZOOM.slice();
    selectors.drag = FALLBACK_DRAG.slice();
    selectors.disabled = [];

    // Read the real `cursor:` declarations written in the site's CSS, so
    // new components get the right behaviour without touching this file.
    // Must run before the native cursor is hidden by our own stylesheet.
    for (var i = 0; i < doc.styleSheets.length; i++) {
      try { collectRules(doc.styleSheets[i].cssRules); } catch (e) { /* cross-origin / file:// */ }
    }

    Object.keys(selectors).forEach(function (state) {
      var valid = selectors[state].filter(isValidSelector);
      matchers[state] = valid.length ? valid.join(',') : null;
    });
  }

  /* ---------- Text detection ---------- */
  function caretFromPoint(x, y) {
    if (doc.caretPositionFromPoint) {
      var pos = doc.caretPositionFromPoint(x, y);
      return pos ? { node: pos.offsetNode } : null;
    }
    if (doc.caretRangeFromPoint) {
      var range = doc.caretRangeFromPoint(x, y);
      return range ? { node: range.startContainer } : null;
    }
    return null;
  }

  // Returns the height of the text line under the pointer, or 0 when the
  // pointer is not actually over selectable text.
  function textHeightAt(x, y, el) {
    if (el.closest('img, svg, canvas, video, picture')) return 0;
    var caret = caretFromPoint(x, y);
    var node = caret && caret.node;
    if (!node || node.nodeType !== 3 || !/\S/.test(node.nodeValue)) return 0;

    var host = node.parentElement;
    if (!host) return 0;
    var cs = getComputedStyle(host);
    if (cs.userSelect === 'none') return 0;
    var fontSize = parseFloat(cs.fontSize) || 16;
    var lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;   // 'normal' -> NaN

    var range = doc.createRange();
    range.selectNodeContents(node);
    var rects = range.getClientRects();
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      // The gap between lines belongs to the nearest line, so the caret
      // doesn't flicker back to the dot while moving through a paragraph.
      var pad = Math.max(2, (lineHeight - r.height) / 2);
      if (x >= r.left - 3 && x <= r.right + 3 && y >= r.top - pad && y <= r.bottom + pad) {
        return Math.max(CARET_MIN, Math.min(CARET_MAX, Math.round(r.height)));
      }
    }
    return 0;
  }

  /* ---------- Light cursor over dark content ----------
     No mix-blend-mode (too slow on older machines). Instead the cursor looks
     at what is under it and switches between a dark and a light variant:
       - <img>: the average brightness of the spot under the pointer, read
         from a tiny 24x24 thumbnail that is computed once per image
       - everything else: the first opaque background colour in the stack
         of elements under the pointer (dark sections, the lightbox, ...)
     Runs inside the throttled hit-test, so it costs nothing while moving.
     Force it per element with data-cursor-theme="light" (= dark content,
     light cursor) or data-cursor-theme="dark". */
  var LIGHT_BELOW = 0.45;   // darker than this  -> light cursor
  var DARK_ABOVE  = 0.55;   // brighter than this -> back to dark (hysteresis, no flicker)
  var THUMB = 24;
  var lumaCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  var thumbCanvas, thumbCtx;
  var themeLight = false;

  function buildLuma(img) {
    var info = { src: '', grid: null, fit: 'fill', px: 0.5, py: 0.5 };
    if (!img.complete || !img.naturalWidth) return info;      // not loaded yet, retry next time
    info.src = img.currentSrc || img.src;
    try {
      if (!thumbCanvas) {
        thumbCanvas = doc.createElement('canvas');
        thumbCanvas.width = thumbCanvas.height = THUMB;
        thumbCtx = thumbCanvas.getContext('2d', { willReadFrequently: true });
      }
      thumbCtx.clearRect(0, 0, THUMB, THUMB);
      thumbCtx.drawImage(img, 0, 0, THUMB, THUMB);
      var data = thumbCtx.getImageData(0, 0, THUMB, THUMB).data;
      var grid = new Float32Array(THUMB * THUMB);
      for (var i = 0; i < grid.length; i++) {
        var o = i * 4;
        grid[i] = data[o + 3] < 128 ? -1 :
          (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
      }
      info.grid = grid;
    } catch (e) { /* tainted canvas (cross-origin / file://): image is skipped */ }
    var cs = getComputedStyle(img);
    info.fit = cs.objectFit || 'fill';
    var op = (cs.objectPosition || '50% 50%').split(' ');
    info.px = op[0] && op[0].indexOf('%') > 0 ? parseFloat(op[0]) / 100 : 0.5;
    info.py = op[1] && op[1].indexOf('%') > 0 ? parseFloat(op[1]) / 100 : 0.5;
    return info;
  }

  // Brightness (0..1) of the image under the pointer, or -1 when unknown / transparent there.
  function imageLumaAt(img, x, y) {
    var info = lumaCache && lumaCache.get(img);
    if (!info || info.src !== (img.currentSrc || img.src)) {
      info = buildLuma(img);
      if (lumaCache) lumaCache.set(img, info);
    }
    if (!info.grid) return -1;
    var r = img.getBoundingClientRect();
    if (!r.width || !r.height) return -1;
    var nw = img.naturalWidth, nh = img.naturalHeight;
    var dw = r.width, dh = r.height, ox = 0, oy = 0, s;
    if (info.fit === 'cover') s = Math.max(r.width / nw, r.height / nh);
    else if (info.fit === 'contain') s = Math.min(r.width / nw, r.height / nh);
    else if (info.fit === 'none') s = 1;
    else if (info.fit === 'scale-down') s = Math.min(1, r.width / nw, r.height / nh);
    if (s) { dw = nw * s; dh = nh * s; ox = (r.width - dw) * info.px; oy = (r.height - dh) * info.py; }
    var u = (x - r.left - ox) / dw, v = (y - r.top - oy) / dh;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return -1;                // letterbox area
    return info.grid[((v * THUMB) | 0) * THUMB + ((u * THUMB) | 0)];
  }

  // Brightness (0..1) of an opaque-ish computed background colour, or -1 when transparent.
  function colorLuma(str) {
    if (!str || str === 'transparent') return -1;
    var isFn = str.indexOf('color(') === 0;
    if (!isFn && str.indexOf('rgb') !== 0) return -1;
    var n = str.match(/-?\d*\.?\d+/g);
    if (!n || n.length < 3) return -1;
    var a = n.length > 3 ? parseFloat(n[3]) : 1;
    if (a < 0.5) return -1;
    var k = isFn ? 1 : 255;
    return (0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2]) / k;
  }

  function detectTheme(x, y) {
    var stack = doc.elementsFromPoint ? doc.elementsFromPoint(x, y) : [doc.elementFromPoint(x, y)];
    var luma = 1;                                   // nothing opaque found: the light paper page
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      if (!el || el === cursorEl) continue;
      var forced = el.getAttribute('data-cursor-theme');
      if (forced === 'light') { luma = 0; break; }
      if (forced === 'dark') { luma = 1; break; }
      var l = el.tagName === 'IMG' ? imageLumaAt(el, x, y) : colorLuma(getComputedStyle(el).backgroundColor);
      if (l >= 0) { luma = l; break; }
    }
    var light = themeLight ? luma <= DARK_ABOVE : luma < LIGHT_BELOW;
    if (light !== themeLight) {
      themeLight = light;
      if (light) cursorEl.setAttribute('data-theme', 'light');
      else cursorEl.removeAttribute('data-theme');
    }
  }

  /* ---------- State resolution ---------- */
  var VALID_OVERRIDES = { pointer: 1, text: 1, drag: 1, zoom: 1, disabled: 1, hide: 1, 'default': 1 };

  function resolve(x, y, el) {
    if (!el || el === cursorEl || cursorEl.contains(el)) return { state: 'default' };

    // Nearest ancestor decides, like CSS cursor inheritance.
    for (var n = el; n && n !== root; n = n.parentElement) {
      var override = n.getAttribute && n.getAttribute('data-cursor');
      if (override && VALID_OVERRIDES[override]) return { state: override };

      if (matchers.disabled && n.matches(matchers.disabled)) return { state: 'disabled' }; // `cursor: not-allowed` in CSS
      if (n.matches(DISABLED_SEL) && matchers.pointer && n.matches(matchers.pointer)) return { state: 'disabled' };
      if (matchers.drag && n.matches(matchers.drag)) return { state: 'drag' };
      if (matchers.zoom && n.matches(matchers.zoom)) return { state: 'zoom' };
      if (matchers.pointer && n.matches(matchers.pointer)) return { state: 'pointer' };
    }

    var h = textHeightAt(x, y, el);
    if (h) return { state: 'text', caret: h };
    return { state: 'default' };
  }

  /* ---------- DOM ---------- */
  var cursorEl, shapeEl;

  function createDom() {
    cursorEl = doc.createElement('div');
    cursorEl.className = 'site-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.setAttribute('data-state', 'default');
    cursorEl.innerHTML =
      '<div class="site-cursor__shape">' +
        '<svg class="site-cursor__glyph site-cursor__glyph--drag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg>' +
        '<svg class="site-cursor__glyph site-cursor__glyph--zoom" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>' +
      '</div>';
    shapeEl = cursorEl.firstChild;
    // Attached to <html>, not <body>: the portfolio fades <body> out between
    // pages, and the cursor should stay put during that transition.
    root.appendChild(cursorEl);
  }

  /* ---------- Spring loop ---------- */
  var target = { x: 0, y: 0 };
  var pos = { x: 0, y: 0 };
  var vel = { x: 0, y: 0 };
  var rafId = 0;
  var lastT = 0;

  function step(t) {
    var dt = Math.min((t - lastT) / 1000 || 0.016, 1 / 30);
    lastT = t;

    var ax = -SPRING.stiffness * (pos.x - target.x) - SPRING.damping * vel.x;
    var ay = -SPRING.stiffness * (pos.y - target.y) - SPRING.damping * vel.y;
    vel.x += ax * dt; vel.y += ay * dt;
    pos.x += vel.x * dt; pos.y += vel.y * dt;

    cursorEl.style.transform = 'translate3d(' + pos.x.toFixed(2) + 'px,' + pos.y.toFixed(2) + 'px,0)';

    var settled = Math.abs(pos.x - target.x) < 0.05 && Math.abs(pos.y - target.y) < 0.05 &&
                  Math.abs(vel.x) < 0.05 && Math.abs(vel.y) < 0.05;
    if (settled) {
      pos.x = target.x; pos.y = target.y; vel.x = vel.y = 0;
      cursorEl.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)';
      rafId = 0;
    } else {
      rafId = requestAnimationFrame(step);
    }
  }

  function kick() {
    if (!rafId) { lastT = performance.now(); rafId = requestAnimationFrame(step); }
  }

  /* ---------- State application ---------- */
  var current = { state: 'default', caret: 0 };
  var last = { x: -1, y: -1 };
  var placed = false;     // has the cursor been positioned yet?
  var enabled = false;

  function applyState(next) {
    if (next.state === 'text' && next.caret !== current.caret) {
      cursorEl.style.setProperty('--caret-h', next.caret + 'px');
    }
    if (next.state !== current.state) cursorEl.setAttribute('data-state', next.state);
    current = { state: next.state, caret: next.caret || 0 };
  }

  // The hit-test (elementFromPoint + caret/range lookups) forces layout, so it
  // is throttled. The cursor position itself is NOT throttled: it is written
  // straight from the pointermove event.
  var DETECT_INTERVAL = 60;   // ms
  var detectQueued = false;
  var lastDetect = 0;
  function runDetect() {
    detectQueued = false;
    if (!enabled || !placed) return;
    lastDetect = performance.now();
    var el = doc.elementFromPoint(last.x, last.y);
    applyState(resolve(last.x, last.y, el));
    detectTheme(last.x, last.y);
  }
  function queueDetect() {
    if (detectQueued) return;
    detectQueued = true;
    var wait = DETECT_INTERVAL - (performance.now() - lastDetect);
    if (wait > 0) setTimeout(function () { requestAnimationFrame(runDetect); }, wait);
    else requestAnimationFrame(runDetect);
  }

  // The portfolio reveals sections with a slide/fade animation, so whatever
  // ends up under a still pointer after scrolling isn't final right away.
  // Re-check once the scroll (and the reveal animations) have settled.
  var settleTimer = 0;
  function onScroll() {
    queueDetect();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(queueDetect, 700);
  }

  function place(x, y, snap) {
    last.x = x; last.y = y;
    target.x = x; target.y = y;
    if (snap || INSTANT) { pos.x = x; pos.y = y; vel.x = vel.y = 0; cursorEl.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; }
    else kick();
  }

  /* ---------- Events ---------- */
  function show() {
    if (!placed) return;
    cursorEl.classList.add('is-visible');
    root.classList.add('has-site-cursor');
  }
  function hide() {
    cursorEl.classList.remove('is-visible');
    root.classList.remove('has-site-cursor'); // give the native cursor back
  }

  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') { hide(); placed = false; return; }
    var firstMove = !placed;
    placed = true;
    place(e.clientX, e.clientY, firstMove);
    queueDetect();   // throttled to one hit-test per frame
    show();
  }

  function onPointerDown(e) { if (e.pointerType === 'mouse' && e.button === 0) cursorEl.classList.add('is-pressed'); }
  function onPointerUp() { cursorEl.classList.remove('is-pressed'); queueDetect(); }

  function onLeave(e) { if (!e.relatedTarget) hide(); }   // pointer left the window
  function onEnter() { show(); }
  function onBlur() { cursorEl.classList.remove('is-pressed'); }

  function onPageHide() {
    if (!placed) return;
    try { sessionStorage.setItem(POS_KEY, JSON.stringify({ x: last.x, y: last.y, t: Date.now() })); } catch (e) {}
  }

  // Restore the pointer position after a page navigation so the cursor
  // doesn't vanish until the mouse moves again.
  function restorePosition() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(POS_KEY) || 'null');
      sessionStorage.removeItem(POS_KEY);
      if (saved && Date.now() - saved.t < 8000 &&
          saved.x >= 0 && saved.y >= 0 && saved.x <= innerWidth && saved.y <= innerHeight) {
        placed = true;
        // Appear instantly at the old position (no fade / pop-in) so there is
        // no moment without a cursor after the page change.
        cursorEl.classList.add('is-restoring');
        place(saved.x, saved.y, true);
        queueDetect();
        show();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { cursorEl.classList.remove('is-restoring'); });
        });
      }
    } catch (e) {}
  }

  // js/soft-nav.js swaps the page content without reloading the document.
  // The cursor itself stays, but the page under it is new: re-read the
  // cursor styles of the new page and re-check what is under the pointer.
  function onSoftNavDone() {
    buildMatchers();
    cursorEl.classList.remove('is-pressed');
    queueDetect();
  }

  var listening = false;
  function listen(on) {
    if (on === listening) return;
    listening = on;
    var fn = on ? 'addEventListener' : 'removeEventListener';
    var passive = { passive: true };
    // Tell js/soft-nav.js that these listeners belong to the cursor and must
    // survive a page swap (it removes the listeners of the page scripts).
    [onPointerMove, onPointerDown, onPointerUp, onLeave, onEnter, onScroll, onBlur, onPageHide, onSoftNavDone]
      .forEach(function (f) { f.__softNavKeep = true; });
    doc[fn]('pointermove', onPointerMove, passive);
    doc[fn]('pointerdown', onPointerDown, passive);
    doc[fn]('pointerup', onPointerUp, passive);
    doc[fn]('pointercancel', onPointerUp, passive);
    doc[fn]('mouseout', onLeave, passive);
    doc[fn]('mouseover', onEnter, passive);
    window[fn]('scroll', onScroll, passive);      // content moves under a still pointer
    window[fn]('wheel', onScroll, passive);
    window[fn]('blur', onBlur);
    window[fn]('pagehide', onPageHide);
    window[fn]('softnav:done', onSoftNavDone);
  }

  /* ---------- Enable / disable (media queries) ---------- */
  function sync() {
    var shouldRun = finePointer.matches && !reducedMotion.matches;
    if (shouldRun === enabled) return;
    enabled = shouldRun;

    if (enabled) {
      if (!cursorEl) { buildMatchers(); createDom(); }
      listen(true);
      restorePosition();
    } else {
      listen(false);
      placed = false;
      if (cursorEl) hide();
    }
  }

  function init() {
    sync();
    var onChange = function () { sync(); };
    [finePointer, reducedMotion].forEach(function (mq) {
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();