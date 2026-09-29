const UMAMI_SRC = 'https://cloud.umami.is/script.js';
const UMAMI_WEBSITE_ID = '2ce08832-0b02-4dff-a490-09b9f52e3ab3';

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
