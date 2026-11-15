<?php
declare(strict_types=1);

function smccConfig(): array
{
    $path = dirname(__DIR__) . '/smcc-config.php';
    if (!is_file($path)) throw new RuntimeException('Missing configuration');
    return require $path;
}

function smccSession(array $config): array
{
    $cookies = ['path' => '/', 'secure' => !($config['local_http'] ?? false), 'httponly' => true, 'samesite' => 'Lax'];
    if ($cookies['secure'] && in_array(strtolower($_SERVER['HTTPS'] ?? ''), ['', 'off', '0'], true)) {
        throw new RuntimeException('HTTPS is required');
    }
    session_name('SMCCSESSID');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_set_cookie_params($cookies);
    if (!session_start()) throw new RuntimeException('Session start failed');
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    return $cookies;
}
