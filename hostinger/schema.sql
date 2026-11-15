CREATE TABLE smcc_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL UNIQUE,
  password_hash VARCHAR(255) CHARACTER SET ascii NOT NULL,
  display_name VARCHAR(60) NOT NULL,
  progress_json MEDIUMTEXT NOT NULL,
  revision INT UNSIGNED NOT NULL DEFAULT 0,
  verified_at INT UNSIGNED NULL,
  verification_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
  verification_expires INT UNSIGNED NOT NULL DEFAULT 0,
  verification_sent_at INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE smcc_auth_limits (
  scope_key CHAR(64) CHARACTER SET ascii NOT NULL PRIMARY KEY,
  attempts INT UNSIGNED NOT NULL,
  reset_at INT UNSIGNED NOT NULL,
  INDEX (reset_at)
) ENGINE=InnoDB;
