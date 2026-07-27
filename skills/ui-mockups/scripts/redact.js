// redact.js — safe/showcase mode. Blur confidential regions of the LIVE app
// before capture, so you can show off look & feel without leaking real data or
// how the app works. Blurs are applied as CSS filters on the real elements, so
// the shot stays crisp everywhere except the flagged areas (no ugly post-blur
// of the whole image).
//
// Runs in the page via `browse eval`. Set the globals, eval this file, THEN
// take the screenshot. Re-eval with __redactClear=true to remove all blurs.
//
// Globals:
//   window.__redactSelectors  string[]  CSS selectors to blur (the main lever)
//   window.__redactText       string[]  regex sources; leaf elements whose text
//                                        matches get blurred (e.g. "\\d{3,}" for
//                                        long numbers, an email pattern, etc.)
//   window.__redactBlurPx     number     blur radius, default 9
//   window.__redactClear      bool       remove every blur this script added
(function () {
  var MARK = 'data-redacted';
  function clearAll() {
    document.querySelectorAll('[' + MARK + ']').forEach(function (el) {
      el.style.filter = el.getAttribute('data-prev-filter') || '';
      el.removeAttribute('data-prev-filter');
      el.removeAttribute(MARK);
    });
  }
  if (window.__redactClear) { clearAll(); return 'cleared'; }

  var px = window.__redactBlurPx || 9;
  var blur = 'blur(' + px + 'px)';
  var n = 0;
  function blurEl(el) {
    if (!el || el.hasAttribute(MARK)) return;
    el.setAttribute('data-prev-filter', el.style.filter || '');
    el.style.filter = (el.style.filter ? el.style.filter + ' ' : '') + blur;
    el.setAttribute(MARK, '1');
    n++;
  }

  (window.__redactSelectors || []).forEach(function (sel) {
    try { document.querySelectorAll(sel).forEach(blurEl); } catch (e) {}
  });

  var pats = (window.__redactText || []).map(function (s) { return new RegExp(s); });
  if (pats.length) {
    // Only blur leaf-ish elements (few element children) so we don't blur whole
    // panels when a deep value matches.
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.children.length > 2) return;
      var t = (el.textContent || '').trim();
      if (!t) return;
      if (pats.some(function (re) { return re.test(t); })) blurEl(el);
    });
  }

  return 'redacted ' + n + ' element(s) @ ' + px + 'px';
})();
