/* =====================================================================
   PurchaseOrderPrintFit.js - fit the K2 form to A4 or Letter
   Companion to PurchaseOrderPrintScaled.css

   - Browser print: on `beforeprint`, measures the form and sets the zoom
     so it fits one page; resets on `afterprint`.
   - K2 PDF Converter / Save as PDF: add  &pdf=1  to the form URL. The
     script switches on the print layout (html.pdf-render) and fits it.
   - Optional  &paper=a4  or  &paper=letter  fits that exact paper.
     Without it, the zoom fits BOTH sizes.
   - Margins: 1in with &pdf=1 (the converter's default 72pt), 0.5in for
     browser print. Override with &margin=<inches>.
   - If a PO is too tall to fit one page at a readable size (MIN_ZOOM),
     the form is fitted to the page width and flows onto more pages.
   ===================================================================== */
(function () {
  if (window.__poPrintFit) return;          // load once
  window.__poPrintFit = true;

  var DESIGN_WIDTH = 1000;                  // px: form's natural width
  var MIN_ZOOM = 0.55;                      // below this, paginate instead
  var PAPER = {                             // width x height in inches
    letter: [8.5, 11],
    a4: [8.27, 11.69],
    any: [8.27, 11]                         // smallest of each: fits both
  };

  var params = new URLSearchParams(location.search.toLowerCase());
  var paper = PAPER[params.get('paper')] || PAPER.any;

  // Page margin in inches. Must match what the renderer actually uses:
  //  - K2 PDF Converter (&pdf=1): its default of 72pt = 1in on each side
  //  - Browser print: the 0.5in set by @page in the stylesheet
  // Override with &margin=<inches>, e.g. &margin=0.75
  var MARGIN_IN = parseFloat(params.get('margin'));
  if (isNaN(MARGIN_IN)) MARGIN_IN = params.get('pdf') === '1' ? 1 : 0.5;
  var root = document.documentElement;

  function fit() {
    var form = document.querySelector('.theme-entry .runtime-form');
    if (!form) return;
    var availW = (paper[0] - 2 * MARGIN_IN) * 96;
    var availH = (paper[1] - 2 * MARGIN_IN) * 96 - 2;   // 2px rounding guard

    root.style.setProperty('--print-zoom', '1');        // measure unscaled
    var h = form.getBoundingClientRect().height;

    var widthZoom = availW / DESIGN_WIDTH;
    var zoom = Math.min(widthZoom, availH / h);
    if (zoom < MIN_ZOOM) {                              // too tall: paginate
      root.style.setProperty('--print-zoom', widthZoom.toFixed(4));
      return widthZoom;
    }
    // Text reflows slightly once zoomed; re-measure and correct.
    for (var i = 0; i < 4; i++) {
      root.style.setProperty('--print-zoom', zoom.toFixed(4));
      var scaled = form.getBoundingClientRect().height;
      if (scaled <= availH) break;
      zoom = zoom * (availH / scaled) - 0.002;
    }
    return zoom;
  }

  function enterPrint() { root.classList.add('pdf-render'); fit(); }
  function exitPrint() {
    if (!params.has('pdf')) {
      root.classList.remove('pdf-render');
      root.style.removeProperty('--print-zoom');
    }
  }

  window.addEventListener('beforeprint', enterPrint);
  window.addEventListener('afterprint', exitPrint);

  // PDF Converter path: render the print layout on screen.
  // Re-fit while K2 loads data and form rules show/hide controls
  // (heights change as they do).
  if (params.get('pdf') === '1') {
    enterPrint();
    var timer;
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(fit, 150);
    });
    mo.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['style', 'class']
    });
    setTimeout(function () { mo.disconnect(); fit(); }, 15000);
  }

  window.poPrintFit = fit;                  // handy for testing in DevTools
})();
