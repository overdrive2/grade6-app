<?php
declare(strict_types=1);
ini_set('display_errors', '0');

$private = dirname(__DIR__) . '/smcc-private';
$pathname = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if (PHP_SAPI === 'cli-server' && $pathname === '/api/index.php') return false;

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header('Cache-Control: private, no-store');
if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'HEAD'], true)) {
    http_response_code(405);
    exit;
}

$assetTypes = [
    'html' => 'text/html; charset=utf-8', 'css' => 'text/css; charset=utf-8',
    'js' => 'text/javascript; charset=utf-8', 'mp3' => 'audio/mpeg', 'txt' => 'text/plain; charset=utf-8',
];
function serve(string $file, string $type): never
{
    header('Content-Type: ' . $type);
    header('Content-Length: ' . filesize($file));
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') readfile($file);
    exit;
}

// These two files are also used by the public sign-in page.
if ($pathname === '/style.css') serve($private . '/assets/style.css', $assetTypes['css']);
if ($pathname === '/entry.js') serve($private . '/entry.js', $assetTypes['js']);

require $private . '/bootstrap.php';
$authorized = false;
try {
    smccSession(smccConfig());
    $authorized = isset($_SESSION['user_id']);
    session_write_close();
} catch (Throwable) {}

if (in_array($pathname, ['/', '/index.php', '/index.html'], true)) {
    $file = $authorized ? '/assets/index.html' : '/landing.html';
    serve($private . $file, $assetTypes['html']);
}
if (!$authorized) {
    http_response_code(401);
    exit;
}
$root = realpath($private . '/assets') . DIRECTORY_SEPARATOR;
$file = realpath($root . ltrim((string)$pathname, '/'));
$type = $assetTypes[pathinfo((string)$file, PATHINFO_EXTENSION)] ?? null;
if (!$file || !str_starts_with($file, $root) || !is_file($file) || !$type) {
    http_response_code(404);
    exit;
}
serve($file, $type);
