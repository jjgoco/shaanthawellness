const measurementId = 'G-56DW565S7C';
const storageKey = 'shaantha-consent';
const receiptKey = 'shaantha-consent-receipt';
const policyVersion = '2026-10-05';
const banner = document.getElementById('cookie-banner');
let choice;
let initialized = false;
let settingsTrigger;
const readChoice = () => {
  try { return localStorage.getItem(storageKey); } catch { return null; }
};
const persist = value => {
  choice = value;
  try {
    localStorage.setItem(storageKey, value);
    localStorage.setItem(receiptKey, JSON.stringify({ version: policyVersion, choice: value, chosenAt: new Date().toISOString() }));
  } catch { /* With storage blocked, the choice applies to this document only. */ }
};
const hide = () => {
  banner.hidden = true;
  if (banner.contains(document.activeElement)) settingsTrigger?.focus();
};
const loadAnalytics = () => {
  if (initialized || choice !== 'granted') return;
  initialized = true;
  window[`ga-disable-${measurementId}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 60 * 60 * 24 * 180 });
  const script = document.createElement('script');
  script.id = 'analytics-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
};
const clearAnalyticsCookies = () => {
  const names = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name));
  const hostnameParts = location.hostname.split('.');
  const domains = ['', ...hostnameParts.map((_, i) => hostnameParts.slice(i).join('.')).filter(domain => domain.includes('.')).flatMap(domain => [domain, `.${domain}`])];
  const parts = location.pathname.split('/').filter(Boolean);
  const paths = ['/', ...parts.map((_, i) => `/${parts.slice(0, i + 1).join('/')}`)];
  for (const name of names) for (const domain of domains) for (const path of paths) {
    document.cookie = `${name}=; Max-Age=0; Path=${path}${domain ? `; Domain=${domain}` : ''}; SameSite=Lax`;
  }
};
const stopAnalytics = () => {
  window[`ga-disable-${measurementId}`] = true;
  if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  clearAnalyticsCookies();
  document.getElementById('analytics-tag')?.remove();
  // Reload removes the already downloaded SDK, timers and queued network callbacks.
  if (initialized) location.reload();
};
banner.querySelector('.cb-accept').addEventListener('click', () => { persist('granted'); hide(); loadAnalytics(); });
banner.querySelector('.cb-reject').addEventListener('click', () => { persist('denied'); hide(); stopAnalytics(); });
document.addEventListener('click', event => {
  const settings = event.target.closest('#cookie-settings-link');
  if (settings) {
    event.preventDefault();
    settingsTrigger = settings;
    banner.hidden = false;
    banner.querySelector('.cb-reject').focus();
  }
  const contact = event.target.closest('a[href^="https://wa.me/"]');
  if (contact && choice === 'granted' && typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', { method: 'whatsapp', content_type: contact.textContent.trim().slice(0, 60) || 'whatsapp_link' });
  }
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  choice = readChoice();
  if (choice === 'granted') { hide(); loadAnalytics(); }
  else { banner.hidden = choice === 'denied'; stopAnalytics(); }
});
choice = readChoice();
if (choice === 'granted') loadAnalytics();
else banner.hidden = choice === 'denied';
