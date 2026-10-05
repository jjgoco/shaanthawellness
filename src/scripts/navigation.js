const menu = document.getElementById('mobile-menu');
const openButton = document.getElementById('menu-open-btn');
const closeButton = document.getElementById('menu-close-btn');
if (menu && openButton && closeButton) {
  let previousFocus;
  let previousOverflow;
  const background = [...document.body.children].filter(element => element !== menu && !['SCRIPT', 'STYLE'].includes(element.tagName));
  const previousInert = new Map();
  const close = () => {
    menu.style.display = 'none';
    openButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = previousOverflow;
    for (const [element, inert] of previousInert) element.inert = inert;
    previousInert.clear();
    previousFocus?.focus();
  };
  openButton.addEventListener('click', () => {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    for (const element of background) { previousInert.set(element, element.inert); element.inert = true; }
    menu.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    openButton.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  });
  closeButton.addEventListener('click', close);
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('button, a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}
