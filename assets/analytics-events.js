(function () {
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (!link) return;
    if (typeof gtag !== 'function') return;
    gtag('event', 'generate_lead', {
      method: 'whatsapp',
      content_type: link.textContent.trim().slice(0, 60) || 'whatsapp_link'
    });
  });
})();
