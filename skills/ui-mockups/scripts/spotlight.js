// spotlight.js — clone a live component into a centered square frame on a clean
// wash, so a real UI element becomes an ultraclean 1:1 "feature spotlight" tile.
//
// Runs in the page via `browse eval`. Because it clones the LIVE DOM (not an
// upscaled screenshot), text stays crisp at any scale. Drive the app into the
// desired state first, then set the globals below and eval this file, then
// `browse screenshot --clip <left>,0,<SIZE>,<SIZE> out.png` (the return value
// prints the exact clip rect to use).
//
// Globals you set before eval (via `browse js "window.__x=..."`):
//   window.__sqSel    (required) CSS selector of the component to spotlight
//   window.__sqScale  (default 2.0) how much to enlarge the component
//   window.__sqBg     (optional)  CSS background for the wash. If omitted,
//                                 falls back to __sqDark ? dark : light preset.
//   window.__sqDark   (default false) pick the built-in dark vs light preset
//   window.__sqSize   (default 1080) square edge in CSS px (output = size * scaleFactor)
(function () {
  var sel = window.__sqSel;
  var scale = window.__sqScale || 2.0;
  var dark = window.__sqDark || false;
  var SIZE = window.__sqSize || 1080;
  var old = document.getElementById('sqframe');
  if (old) old.remove();

  var target = document.querySelector(sel);
  if (!target) return 'NO_TARGET:' + sel;
  var origW = Math.round(target.getBoundingClientRect().width);

  var left = Math.round((window.innerWidth - SIZE) / 2);
  if (left < 0) left = 0;

  var bg = window.__sqBg || (dark
    ? 'radial-gradient(120% 120% at 50% 30%, #1b1815 0%, #0f0e0d 100%)'
    : 'radial-gradient(120% 120% at 50% 28%, #fbf8f2 0%, #efe8dc 100%)');

  var frame = document.createElement('div');
  frame.id = 'sqframe';
  frame.style.cssText = [
    'position:fixed', 'top:0px', 'left:' + left + 'px',
    'width:' + SIZE + 'px', 'height:' + SIZE + 'px',
    'z-index:2147483647', 'display:flex',
    'align-items:center', 'justify-content:center', 'overflow:hidden'
  ].join(';');
  frame.style.background = bg;

  var wrap = document.createElement('div');
  wrap.style.cssText = [
    'transform:scale(' + scale + ')',
    'transform-origin:center center',
    'filter:drop-shadow(0 24px 60px rgba(20,14,8,' + (dark ? '0.55' : '0.18') + '))'
  ].join(';');

  var clone = target.cloneNode(true);
  clone.removeAttribute('hidden');
  clone.style.position = 'static';
  clone.style.left = 'auto';
  clone.style.top = 'auto';
  clone.style.margin = '0';
  clone.style.width = origW + 'px';       // pin width so it keeps its real layout
  clone.style.maxWidth = origW + 'px';
  clone.style.flex = 'none';
  clone.style.boxSizing = 'border-box';

  // Frosted/translucent menus need a solid surface once lifted off the app.
  if (clone.className && String(clone.className).indexOf('frost') > -1) {
    clone.style.background = dark ? '#1b1815' : '#fffdf9';
    clone.style.backdropFilter = 'none';
    clone.style.webkitBackdropFilter = 'none';
    clone.style.border = dark ? '1px solid rgba(255,240,230,.16)' : '1px solid rgba(60,45,30,.14)';
    clone.style.borderRadius = '16px';
    clone.style.boxShadow = 'none';
    clone.style.minWidth = '260px';
  }

  wrap.appendChild(clone);
  frame.appendChild(wrap);
  document.body.appendChild(frame);
  return 'OK clip=' + left + ',0,' + SIZE + ',' + SIZE;
})();
