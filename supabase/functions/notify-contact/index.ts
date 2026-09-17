// Supabase Edge Function, triggered by a Database Webhook on
// INSERT into `contact_submissions`. Sends a notification email via Resend
// so new contact requests don't just sit silently in the database.
//
// Deploy: supabase functions deploy notify-contact
// Secret:  supabase secrets set RESEND_API_KEY=<your resend api key>
// Webhook: Supabase Dashboard -> Database -> Webhooks -> INSERT on
//          contact_submissions -> HTTP POST to this function's URL.

const RESEND_API_URL = 'https://api.resend.com/emails';
const NOTIFY_TO = 'd.mamon@moskunlimited.be';
// Must be a sender/domain verified in your Resend account.
const NOTIFY_FROM = 'Mosk Unlimited Kontaktformular <kontakt@moskunlimited.be>';

interface ContactSubmission {
  kundentyp: string | null;
  vorname: string | null;
  nachname: string | null;
  unternehmensname: string | null;
  ansprechpartner: string | null;
  email: string;
  telefonnummer: string | null;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: ContactSubmission;
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

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return new Response('OK', { status: 200 });
  }

  try {
    const payload: WebhookPayload = await req.json();
    if (payload.type !== 'INSERT' || payload.table !== 'contact_submissions') {
      return new Response('Ignored', { status: 200 });
    }

    const record = payload.record;
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
    }
  } catch (error) {
    console.error('notify-contact failed:', error);
  }

  // Always 200 so Supabase's webhook delivery doesn't endlessly retry.
  return new Response('OK', { status: 200 });
});
