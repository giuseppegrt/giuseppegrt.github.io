<?php
// contact.php
// Basic self-hosted form handler (PHP)

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method not allowed.");
}

// Honeypot anti-spam: if filled, silently stop
if (!empty($_POST["_gotcha"])) {
    header("Location: ./contact.html?sent=1");
    exit;
}

// Collect + sanitize inputs
$name    = trim($_POST["name"] ?? "");
$email   = trim($_POST["email"] ?? "");
$subject = trim($_POST["subject"] ?? "");
$message = trim($_POST["message"] ?? "");

// Basic validation
if ($name === "" || $email === "" || $message === "") {
    header("Location: ./contact.html?error=missing");
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: ./contact.html?error=email");
    exit;
}

// Prevent header injection
$bad_patterns = "/[\r\n]/";
$name = preg_replace($bad_patterns, " ", $name);
$email = preg_replace($bad_patterns, " ", $email);
$subject = preg_replace($bad_patterns, " ", $subject);

// Fallback subject if empty
if ($subject === "") {
    $subject = "Website contact message";
}

// Your destination email
$to = "giuseppe.gruttadauria@unine.ch";

// Build email body
$body = "New message from website contact form\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

// Email headers
$headers = [];
$headers[] = "From: Website Contact <no-reply@" . $_SERVER["SERVER_NAME"] . ">";
$headers[] = "Reply-To: {$email}";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// Send
$ok = mail($to, $subject, $body, implode("\r\n", $headers));

if ($ok) {
    header("Location: ./contact.html?sent=1");
} else {
    header("Location: ./contact.html?error=send");
}
exit;
