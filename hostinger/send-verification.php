<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

function sendVerification(PDO $db, array $config, string $id, string $email): ?bool
{
    $now = time();
    $token = bin2hex(random_bytes(32));
    $claimed = execute($db, 'UPDATE smcc_users SET verification_hash = ?, verification_expires = ?, verification_sent_at = ?
        WHERE id = ? AND verified_at IS NULL AND verification_sent_at <= ?',
        [hash('sha256', $token), $now + 3600, $now, $id, $now - 60]);
    if ($claimed->rowCount() !== 1) return null;
    try {
        $url = rtrim($config['base_url'], '/');
        $scheme = parse_url($url, PHP_URL_SCHEME);
        if ($scheme !== 'https' && !($config['local_http'] ?? false)) throw new RuntimeException('Invalid verification URL');
        foreach (['Exception.php', 'PHPMailer.php', 'SMTP.php'] as $file) {
            require_once __DIR__ . '/vendor/PHPMailer/' . $file;
        }
        $smtp = $config['smtp'];
        if (!($config['local_http'] ?? false) && !in_array($smtp['encryption'], ['ssl','tls'], true)) {
            throw new RuntimeException('SMTP encryption is required');
        }
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $smtp['host'];
        $mail->Port = $smtp['port'];
        $mail->SMTPAuth = !($config['local_http'] ?? false) || !empty($smtp['username']);
        $mail->Username = $smtp['username'];
        $mail->Password = $smtp['password'];
        $mail->SMTPSecure = $smtp['encryption'];
        $mail->Timeout = 8;
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->setFrom($smtp['from'], 'SMCC Practice Studio');
        $mail->addAddress($email);
        $mail->Subject = 'ยืนยันอีเมลบัญชี SMCC Practice Studio';
        $mail->Body = "เปิดลิงก์และกรอกรหัสผ่านที่คุณตั้งตอนสมัครเพื่อยืนยันอีเมล\n\n"
            . $url . '/#verify/' . $token . "\n\nลิงก์ใช้ได้หนึ่งครั้งและหมดอายุใน 1 ชั่วโมง";
        return $mail->send();
    } catch (Throwable $error) {
        error_log('SMCC verification mail failed: ' . get_class($error));
        return false;
    }
}
