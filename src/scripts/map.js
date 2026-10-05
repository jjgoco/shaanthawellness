for (const container of document.querySelectorAll('[data-map-container]')) {
  const loadButton = container.querySelector('[data-map-load]');
  const hideButton = container.querySelector('[data-map-hide]');
  loadButton.addEventListener('click', () => {
    if (container.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.title = 'Map — Mandala, Sagres';
    iframe.src = 'https://maps.google.com/maps?q=Mandala%20Sagres%20Portugal&z=16&output=embed';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.appendChild(iframe);
    hideButton.hidden = false;
    hideButton.focus();
  });
  hideButton.addEventListener('click', () => {
    container.querySelector('iframe')?.remove();
    hideButton.hidden = true;
    loadButton.focus();
  });
}
