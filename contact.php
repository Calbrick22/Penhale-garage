<?php
/**
 * Penhale Garage – contact form handler.
 *
 * Receives the form on /contact-us/ and emails it to the garage.
 * Needs PHP 7.4+ with mail() working on the server (see README-HOSTING.md).
 * Replaces the old WordPress/Elementor form, which cannot run on a static site.
 */

// ---- Settings (the host can change these) ---------------------------------
$TO_ADDRESS   = 'penhalegarage@outlook.com';          // where messages are sent
$FROM_ADDRESS = 'website@penhalegarage.co.uk';        // must be a mailbox/domain the server may send from
$SUBJECT      = 'Website message from penhalegarage.co.uk';
$MIN_SECONDS  = 3;                                    // spam check: humans take longer than this
// -----------------------------------------------------------------------------

header('X-Content-Type-Options: nosniff');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond($ok, $message, $wantsJson) {
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $message]);
        exit;
    }
    if ($ok) {
        header('Location: contact-us/?sent=1#message', true, 303);
        exit;
    }
    http_response_code(400);
    header('Content-Type: text/html; charset=utf-8');
    $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>Message not sent - Penhale Garage</title><meta name="robots" content="noindex"><link rel="stylesheet" href="css/styles.css"></head>'
       . '<body style="padding:0"><main id="main" class="wrap section"><h1>Your message wasn\'t sent</h1>'
       . '<p>' . $safe . '</p><p>Please <a href="contact-us/#message">go back and try again</a>, or call us on <a href="tel:01726861338">01726 861 338</a>.</p></main></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact-us/', true, 303);
    exit;
}

function field($name, $max) {
    $v = isset($_POST[$name]) ? trim((string) $_POST[$name]) : '';
    return mb_substr($v, 0, $max);
}

$name    = field('name', 100);
$phone   = field('telephone', 30);
$email   = field('email', 150);
$message = field('message', 5000);
$gdpr    = field('gdpr', 3);
$trap    = field('website', 200);
$started = (int) field('started', 20);

// Spam checks: hidden field filled, or submitted impossibly fast. Pretend success.
if ($trap !== '' || ($started > 0 && time() - $started < $MIN_SECONDS)) {
    respond(true, '', $wantsJson);
}

$errors = [];
if ($name === '')    $errors[] = 'Enter your name.';
if ($phone === '' || !preg_match('/^[0-9 +()\-]{6,30}$/', $phone)) $errors[] = 'Enter a phone number we can call you on.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Enter a valid email address.';
if ($message === '') $errors[] = 'Enter your message.';
if ($gdpr !== 'yes') $errors[] = "Tick the box to confirm you've read the privacy policy.";
if ($errors) respond(false, implode(' ', $errors), $wantsJson);

// Strip anything that could inject extra mail headers
$clean = function ($s) { return str_replace(["\r", "\n", '%0a', '%0d'], ' ', $s); };

$body  = "New message from the website contact form\n\n";
$body .= "Name: " . $clean($name) . "\n";
$body .= "Telephone: " . $clean($phone) . "\n";
$body .= "Email: " . $clean($email) . "\n";
$body .= "Privacy policy agreed: yes\n";
$body .= "Sent: " . date('j F Y, H:i') . "\n\n";
$body .= "Message:\n" . $message . "\n";

$headers  = 'From: Penhale Garage website <' . $FROM_ADDRESS . ">\r\n";
$headers .= 'Reply-To: ' . $clean($name) . ' <' . $clean($email) . ">\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($TO_ADDRESS, $SUBJECT, $body, $headers, '-f' . $FROM_ADDRESS);

if (!$sent) {
    respond(false, "Your message couldn't be sent because of a problem on our server.", $wantsJson);
}
respond(true, '', $wantsJson);
