(function () {
  var STORAGE_KEY = 'shaantha-consent';
  var banner;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }
  function grant() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    setStored('granted');
    hideBanner();
  }
  function deny() {
    setStored('denied');
    hideBanner();
  }
  function hideBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function buildBanner() {
    if (!document.getElementById('cookie-banner-style')) {
      var style = document.createElement('style');
      style.id = 'cookie-banner-style';
      style.textContent =
        '#cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:999;' +
        'background:#FBF6EF;border-top:1px solid color-mix(in srgb,#6B4A42 18%,transparent);' +
        'box-shadow:0 -8px 24px color-mix(in srgb,#6B4A42 14%,transparent);' +
        'padding:18px clamp(16px,4vw,32px);font-family:"Cormorant Garamond",Baskerville,Georgia,serif;' +
        'color:#6B4A42;display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;justify-content:space-between;}' +
        '#cookie-banner p{margin:0;font-size:15px;line-height:1.5;max-width:56ch;flex:1 1 260px;}' +
        '#cookie-banner a{color:#6B4A42;}' +
        '#cookie-banner .cb-actions{display:flex;gap:10px;flex:0 0 auto;}' +
        '#cookie-banner button{font-family:inherit;font-size:14px;padding:10px 20px;border-radius:999px;cursor:pointer;border:1px solid transparent;}' +
        '#cookie-banner .cb-accept{background:#6B4A42;color:#FBF6EF;}' +
        '#cookie-banner .cb-reject{background:transparent;border-color:color-mix(in srgb,#6B4A42 30%,transparent);color:#6B4A42;}' +
        '@media (max-width:520px){#cookie-banner{flex-direction:column;align-items:stretch;}#cookie-banner p{flex:none;max-width:none;}#cookie-banner .cb-actions{justify-content:stretch;}#cookie-banner button{flex:1;}}';
      document.head.appendChild(style);
    }

    banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>We use cookies to understand how visitors use this site. See our <a href="privacy.html">privacy policy</a>.</p>' +
      '<div class="cb-actions">' +
      '<button type="button" class="cb-reject">Reject</button>' +
      '<button type="button" class="cb-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.cb-accept').addEventListener('click', grant);
    banner.querySelector('.cb-reject').addEventListener('click', deny);
  }

  function showBanner() {
    if (!banner) buildBanner();
  }

  var stored = getStored();
  if (stored === 'granted') {
    if (typeof gtag === 'function') gtag('consent', 'update', { analytics_storage: 'granted' });
  } else if (stored !== 'denied') {
    showBanner();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('#cookie-settings-link');
    if (t) {
      e.preventDefault();
      showBanner();
    }
  });
})();
