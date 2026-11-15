<?php
declare(strict_types=1);
ini_set('display_errors', '0');
require dirname(__DIR__, 2) . '/smcc-private/bootstrap.php';
require dirname(__DIR__, 2) . '/smcc-private/send-verification.php';

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function body(): object
{
    $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($type !== 'application/json') respond(['error' => 'invalid_content_type'], 415);
    $raw = file_get_contents('php://input', false, null, 0, 180001);
    if ($raw === false || strlen($raw) > 180000) respond(['error' => 'request_too_large'], 413);
    $value = json_decode($raw);
    if (!is_object($value)) respond(['error' => 'invalid_body'], 400);
    return $value;
}

function execute(PDO $db, string $sql, array $params = []): PDOStatement
{
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function profile(array $row): array
{
    return [
        'state' => 'registered', 'accountId' => (string)$row['id'],
        'displayName' => $row['display_name'], 'revision' => (int)$row['revision'],
        'progress' => json_decode($row['progress_json'], false, 512, JSON_THROW_ON_ERROR),
        'csrfToken' => $_SESSION['csrf'],
    ];
}

function findUser(PDO $db, string $id): array|false
{
    return execute($db, 'SELECT id, display_name, revision, progress_json FROM smcc_users WHERE id = ? AND verified_at IS NOT NULL', [$id])->fetch();
}

function newSession(string $id): void
{
    if (!session_regenerate_id(true)) throw new RuntimeException('Session renewal failed');
    $_SESSION = ['user_id' => $id, 'csrf' => bin2hex(random_bytes(32))];
}

function pendingSession(string $id): void
{
    if (!session_regenerate_id(true)) throw new RuntimeException('Session renewal failed');
    $_SESSION = ['pending_id' => $id, 'csrf' => bin2hex(random_bytes(32))];
}

function pendingProfile(?bool $sent = null): array
{
    return ['state' => 'verification-required', 'csrfToken' => $_SESSION['csrf'], 'sent' => $sent];
}

function throttle(PDO $db, string $key, int $limit): void
{
    $now = time();
    $scope = hash('sha256', $key);
    execute($db, 'INSERT INTO smcc_auth_limits (scope_key, attempts, reset_at) VALUES (?, 1, ?)
        ON DUPLICATE KEY UPDATE attempts = IF(reset_at <= ?, 1, attempts + 1),
        reset_at = IF(reset_at <= ?, ?, reset_at)', [$scope, $now + 900, $now, $now, $now + 900]);
    $row = execute($db, 'SELECT attempts, reset_at FROM smcc_auth_limits WHERE scope_key = ?', [$scope])->fetch();
    if (random_int(1, 100) === 1) {
        execute($db, 'DELETE FROM smcc_auth_limits WHERE reset_at < ? LIMIT 500', [$now - 900]);
    }
    if ((int)$row['attempts'] > $limit) {
        header('Retry-After: ' . max(1, (int)$row['reset_at'] - $now));
        respond(['error' => 'rate_limited'], 429);
    }
}

function progressMap(mixed $map, callable $accept): object
{
    $result = new stdClass();
    if (!is_object($map)) return $result;
    $count = 0;
    foreach ($map as $key => $value) {
        if (strlen($key) > 80 || in_array($key, ['__proto__','constructor','prototype'], true) || !$accept($value)) continue;
        $result->{$key} = $value;
        if (++$count >= 300) break;
    }
    return $result;
}

function cleanProgress(object $value): array
{
    $counter = static fn(mixed $n): int => is_int($n) ? max(0, min($n, 10000000)) : 0;
    $answered = $counter($value->answered ?? null);
    $deadline = $value->deadline ?? 0;
    return [
        'answered' => $answered,
        'correct' => min($answered, $counter($value->correct ?? null)),
        'checks' => progressMap($value->checks ?? null, 'is_bool'),
        'lessons' => progressMap($value->lessons ?? null, static fn(mixed $v): bool => $v === true),
        'drafts' => progressMap($value->drafts ?? null, static fn(mixed $v): bool => is_string($v) && mb_strlen($v) <= 5000),
        'deadline' => is_int($deadline) && $deadline >= 0 ? $deadline : 0,
        'instrument' => is_string($value->instrument ?? null) ? mb_substr($value->instrument, 0, 80) : '',
    ];
}

$route = $_GET['route'] ?? 'account';
$expected = ['account'=>'GET', 'register'=>'POST', 'login'=>'POST', 'logout'=>'POST', 'progress'=>'PUT', 'verify'=>'POST', 'resend'=>'POST'];
if (!is_string($route) || !isset($expected[$route])) respond(['error' => 'not_found'], 404);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== $expected[$route]) respond(['error' => 'method_not_allowed'], 405);

try {
    $config = smccConfig();
    $cookies = smccSession($config);
    $id = $_SESSION['user_id'] ?? null;
    $pending = $_SESSION['pending_id'] ?? null;
    if ($route !== 'account') {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_SMCC_CSRF'] ?? '')) respond(['error' => 'invalid_csrf'], 403);
        $input = body();
    }
    if ($route === 'logout') {
        $_SESSION = [];
        session_destroy();
        setcookie(session_name(), '', ['expires' => time() - 3600] + $cookies);
        respond(['state' => 'signed-out']);
    }
    if ($route === 'account' && $id === null) {
        if ($pending !== null) respond(pendingProfile());
        respond(['state' => 'signed-out', 'csrfToken' => $_SESSION['csrf']]);
    }
    $db = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_port'], $config['db_name']),
        $config['db_user'], $config['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
    if ($route === 'account') {
        $row = findUser($db, $id);
        if ($row) respond(profile($row));
        unset($_SESSION['user_id']);
        respond(['state' => 'signed-out', 'csrfToken' => $_SESSION['csrf']]);
    }
    if ($route === 'progress') {
        if ($id === null || ($input->accountId ?? null) !== $id) respond(['error' => 'account_changed'], 401);
        if (!is_int($input->revision ?? null) || $input->revision < 0 || !is_object($input->progress ?? null)) {
            respond(['error' => 'invalid_progress'], 400);
        }
        $progress = json_encode(cleanProgress($input->progress), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        $update = execute($db, 'UPDATE smcc_users SET progress_json = ?, revision = revision + 1 WHERE id = ? AND revision = ? AND verified_at IS NOT NULL',
            [$progress, $id, $input->revision]);
        if ($update->rowCount() !== 1) respond(['error' => 'progress_conflict'], 409);
        respond(['revision' => $input->revision + 1]);
    }
    if ($id !== null) respond(['error' => 'already_signed_in'], 409);
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if ($route === 'resend') {
        if ($pending === null) respond(['error' => 'sign_in_required'], 401);
        throttle($db, 'resend:ip:' . $ip, 20);
        $row = execute($db, 'SELECT email FROM smcc_users WHERE id = ? AND verified_at IS NULL', [$pending])->fetch();
        if (!$row) respond(['error' => 'sign_in_required'], 401);
        $sent = sendVerification($db, $config, $pending, $row['email']);
        if ($sent === null) respond(['error' => 'resend_cooldown'], 429);
        respond(pendingProfile($sent));
    }
    if ($route === 'verify') {
        throttle($db, 'verify:ip:' . $ip, 20);
        $token = is_string($input->token ?? null) ? $input->token : '';
        $password = is_string($input->password ?? null) ? $input->password : '';
        if (!preg_match('/^[a-f0-9]{64}$/D', $token) || $password === '' || strlen($password) > 72 || str_contains($password, "\0")) {
            respond(['error' => 'invalid_verification'], 400);
        }
        $hash = hash('sha256', $token);
        throttle($db, 'verify:token:' . $hash, 10);
        $row = execute($db, 'SELECT id, password_hash FROM smcc_users
            WHERE verification_hash = ? AND verification_expires >= ? AND verified_at IS NULL', [$hash, time()])->fetch();
        if (!$row || !password_verify($password, $row['password_hash'])) respond(['error' => 'invalid_verification'], 400);
        $confirm = execute($db, 'UPDATE smcc_users SET verified_at = ?, verification_hash = NULL, verification_expires = 0
            WHERE id = ? AND verification_hash = ? AND verification_expires >= ? AND verified_at IS NULL',
            [time(), $row['id'], $hash, time()]);
        if ($confirm->rowCount() !== 1) respond(['error' => 'invalid_verification'], 400);
        newSession((string)$row['id']);
        respond(profile(findUser($db, (string)$row['id'])));
    }
    $email = is_string($input->email ?? null) ? strtolower(trim($input->email)) : '';
    $password = is_string($input->password ?? null) ? $input->password : '';
    throttle($db, $route . ':ip:' . $ip, $route === 'login' ? 30 : 10);
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$password ||
        strlen($password) > 72 || str_contains($password, "\0")) {
        respond(['error' => 'invalid_credentials'], 400);
    }
    if ($route === 'register') {
        $name = is_string($input->displayName ?? null) ? trim($input->displayName) : '';
        if ($name === '' || mb_strlen($name) > 60 || preg_match('/[\x00-\x1f\x7f]/', $name) || mb_strlen($password) < 12) {
            respond(['error' => 'invalid_registration'], 400);
        }
        try {
            execute($db, 'INSERT INTO smcc_users (email, password_hash, display_name, progress_json) VALUES (?, ?, ?, ?)',
                [$email, password_hash($password, PASSWORD_DEFAULT), $name, '{}']);
        } catch (PDOException $error) {
            if ((int)($error->errorInfo[1] ?? 0) === 1062) respond(['error' => 'email_unavailable'], 409);
            throw $error;
        }
        $id = $db->lastInsertId();
        pendingSession($id);
        respond(pendingProfile(sendVerification($db, $config, $id, $email)), 201);
    }
    throttle($db, 'login:email:' . $email, 12);
    $row = execute($db, 'SELECT id, password_hash, display_name, progress_json, revision, verified_at FROM smcc_users WHERE email = ?', [$email])->fetch();
    $hash = $row['password_hash'] ?? '$2y$10$QhVF9BSktHTceR0VlDtXjuUMtt4C4szYdSnDjcuqFRiVGllUrBuau';
    if (!password_verify($password, $hash) || !$row) respond(['error' => 'invalid_credentials'], 401);
    if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
        execute($db, 'UPDATE smcc_users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $row['id']]);
    }
    if ($row['verified_at'] === null) {
        pendingSession((string)$row['id']);
        respond(pendingProfile());
    }
    newSession((string)$row['id']);
    respond(profile($row));
} catch (Throwable $error) {
    error_log('SMCC account service error: ' . get_class($error));
    respond(['error' => 'service_unavailable'], 503);
}
