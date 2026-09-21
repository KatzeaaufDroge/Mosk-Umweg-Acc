// Netlify Function, called directly by the contact form on submit.
// Sends a notification email via Resend. No database involved.
//
// Env var required (set in Netlify dashboard -> Site settings -> Environment variables):
//   RESEND_API_KEY

const RESEND_API_URL = 'https://api.resend.com/emails';
// TEMP: moskunlimited.be is not verified in Resend yet, so we're using the
// sandbox sender/recipient. Once the domain is verified, switch NOTIFY_TO
// back to d.mamon@moskunlimited.be and NOTIFY_FROM to the kontakt@ address.
const NOTIFY_TO = 'moneyprintercrp@gmail.com';
const NOTIFY_FROM = 'Mosk Unlimited Kontaktformular <onboarding@resend.dev>';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactSubmission {
  kundentyp: string | null;
  vorname: string | null;
  nachname: string | null;
  unternehmensname: string | null;
  ansprechpartner: string | null;
  email: string;
  telefonnummer: string | null;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildEmailHtml(record: ContactSubmission): string {
  const name =
    record.kundentyp === 'Unternehmen'
      ? `${record.unternehmensname ?? ''} (${record.ansprechpartner ?? ''})`
      : `${record.vorname ?? ''} ${record.nachname ?? ''}`.trim();

  const rows: [string, string][] = [
    ['Kundentyp', record.kundentyp ?? '—'],
    ['Name', name || '—'],
    ['E-Mail', record.email],
    ['Telefon', record.telefonnummer ?? '—'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;">
      <h2 style="color:#f59e0b;">Neue Kontaktanfrage</h2>
      <table>${rowsHtml}</table>
      <p style="margin-top:16px;"><strong>Nachricht:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(record.message)}</p>
    </div>
  `;
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  let record: ContactSubmission;
  try {
    record = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!record.email || !EMAIL_REGEX.test(record.email) || !record.message) {
    return new Response('Invalid submission', { status: 400 });
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        reply_to: record.email,
        subject: `Neue Kontaktanfrage von ${record.vorname ?? record.unternehmensname ?? record.email}`,
        html: buildEmailHtml(record),
      }),
    });

    if (!response.ok) {
      console.error('Resend API error:', await response.text());
      return new Response('Email send failed', { status: 502 });
    }
  } catch (error) {
    console.error('send-contact-email failed:', error);
    return new Response('Email send failed', { status: 502 });
  }

  return new Response('OK', { status: 200 });
};
