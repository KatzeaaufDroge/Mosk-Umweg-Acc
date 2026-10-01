<?php
/*
  Kontaktformular -> E-Mail an Dima (über Resend). Ersetzt die frühere
  Netlify Function netlify/functions/send-contact-email.ts.

  Der Resend-Schlüssel steht NICHT hier, sondern in einer Datei außerhalb
  von public_html (vom Browser aus nicht abrufbar):
      <Domain-Ordner>/mosk-config.php
      <?php return ['resend_api_key' => 're_...'];
  (public_html/api/contact.php -> zwei Ordner höher)

  Selbsttest ohne Mailversand:  /api/contact.php?check=1
*/

declare(strict_types=1);

const NOTIFY_TO = 'd.mamon@moskunlimited.be';
const NOTIFY_FROM = 'Mosk Unlimited Kontaktformular <kontakt@moskunlimited.be>';
const ALLOWED_HOSTS = ['moskunlimited.be', 'www.moskunlimited.be'];
const RATE_LIMIT = 5;          // Anfragen ...
const RATE_WINDOW = 15 * 60;   // ... pro 15 Minuten und Absender-IP

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function load_api_key(): ?string
{
    $file = dirname(__DIR__, 2) . '/mosk-config.php';
    if (is_file($file)) {
        $config = include $file;
        if (is_array($config) && !empty($config['resend_api_key'])) {
            return (string) $config['resend_api_key'];
        }
    }
    $env = getenv('RESEND_API_KEY');
    return $env !== false && $env !== '' ? $env : null;
}

// Selbsttest: verrät nur, ob die Voraussetzungen erfüllt sind
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['check'])) {
    respond(200, [
        'ok' => true,
        'schluessel_gefunden' => load_api_key() !== null,
        'curl_verfuegbar' => function_exists('curl_init'),
    ]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed']);
}

// Nur Anfragen von der eigenen Website annehmen
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if (!in_array($host, ALLOWED_HOSTS, true)) {
        respond(403, ['error' => 'Forbidden']);
    }
}

// Spam-Bremse pro IP (Datei im temporären Ordner des Servers)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/mosk-contact-' . hash('sha256', $ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $stored = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($stored)) {
        $hits = array_values(array_filter($stored, fn($t) => is_int($t) && $t > $now - RATE_WINDOW));
    }
}
if (count($hits) >= RATE_LIMIT) {
    respond(429, ['error' => 'Too many requests']);
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 20000) {
    respond(400, ['error' => 'Invalid submission']);
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['error' => 'Invalid JSON']);
}

// Feld lesen: nur Text, gekürzt; einzeilig für Betreff/Kopfzeilen
function field(array $data, string $key, int $max, bool $singleLine = true): string
{
    $value = $data[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = trim($value);
    if ($singleLine) {
        $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
    }
    return mb_substr($value, 0, $max);
}

// Honeypot: echte Besucher sehen dieses Feld nie
if (field($data, 'website', 200) !== '') {
    respond(200, ['ok' => true]);
}

$record = [
    'kundentyp' => field($data, 'kundentyp', 40),
    'vorname' => field($data, 'vorname', 120),
    'nachname' => field($data, 'nachname', 120),
    'unternehmensname' => field($data, 'unternehmensname', 160),
    'ansprechpartner' => field($data, 'ansprechpartner', 160),
    'email' => field($data, 'email', 200),
    'telefonnummer' => field($data, 'telefonnummer', 60),
    'message' => field($data, 'message', 5000, false),
    'leistung' => field($data, 'leistung', 120),
];

if (!filter_var($record['email'], FILTER_VALIDATE_EMAIL) || $record['message'] === '') {
    respond(400, ['error' => 'Invalid submission']);
}

$apiKey = load_api_key();
if ($apiKey === null) {
    error_log('contact.php: Resend-Schlüssel fehlt (mosk-config.php)');
    respond(500, ['error' => 'Server misconfigured']);
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$name = $record['kundentyp'] === 'Unternehmen'
    ? trim($record['unternehmensname'] . ' (' . $record['ansprechpartner'] . ')')
    : trim($record['vorname'] . ' ' . $record['nachname']);

$rows = [];
if ($record['leistung'] !== '') {
    $rows[] = ['Anfrage für', $record['leistung']];
}
$rows[] = ['Kundentyp', $record['kundentyp'] ?: '—'];
$rows[] = ['Name', $name !== '' && $name !== '()' ? $name : '—'];
$rows[] = ['E-Mail', $record['email']];
$rows[] = ['Telefon', $record['telefonnummer'] ?: '—'];

$rowsHtml = '';
foreach ($rows as [$label, $value]) {
    $rowsHtml .= '<tr><td style="padding:4px 12px 4px 0;color:#666;">' . e($label) . '</td><td>' . e($value) . '</td></tr>';
}

$html = '<div style="font-family:sans-serif;font-size:14px;color:#111;">'
    . '<h2 style="color:#55a041;">Neue Kontaktanfrage</h2>'
    . '<table>' . $rowsHtml . '</table>'
    . '<p style="margin-top:16px;"><strong>Nachricht:</strong></p>'
    . '<p style="white-space:pre-wrap;">' . e($record['message']) . '</p>'
    . '</div>';

$who = $record['vorname'] ?: ($record['unternehmensname'] ?: $record['email']);
$subject = $record['leistung'] !== ''
    ? 'Neue Anfrage: ' . $record['leistung'] . ' – ' . $who
    : 'Neue Kontaktanfrage von ' . $who;

$payload = json_encode([
    'from' => NOTIFY_FROM,
    'to' => [NOTIFY_TO],
    'reply_to' => $record['email'],
    'subject' => $subject,
    'html' => $html,
], JSON_UNESCAPED_UNICODE);

// Versuch für die Spam-Bremse zählen (vor dem Versand, damit Fehlversuche
// nicht unbegrenzt Resend-Kontingent verbrauchen)
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    error_log('contact.php: Resend-Fehler ' . $status . ' ' . $curlError . ' ' . substr((string) $response, 0, 300));
    respond(502, ['error' => 'Email send failed']);
}

respond(200, ['ok' => true]);
