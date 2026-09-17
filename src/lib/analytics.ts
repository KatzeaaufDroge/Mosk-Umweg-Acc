const UMAMI_SRC = 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = '05e2cf8d-3770-4f0c-b020-e7752d1c448b';

// Only loads the analytics script once the user has actively accepted
// cookies via the CookieBanner — never loaded unconditionally.
export function loadUmamiIfConsented() {
  if (localStorage.getItem('cookieConsent') !== 'accepted') return;
  if (document.querySelector(`script[src="${UMAMI_SRC}"]`)) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SRC;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  document.head.appendChild(script);
}
