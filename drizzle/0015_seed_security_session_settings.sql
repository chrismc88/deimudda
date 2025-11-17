-- Seed security & session related settings (defaults)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`,`updatedAt`,`updatedBy`) VALUES
  ('session_lifetime_days','14','security','Standard Sessiondauer in Tagen', NOW(), NULL),
  ('ip_block_duration_hours','6','security','Automatische Entsperrung nach x Stunden', NOW(), NULL),
  ('max_login_attempts','5','security','Maximale fehlgeschlagene Login-Versuche in 15 Minuten', NOW(), NULL),
  ('suspicious_activity_threshold','10','security','Schwelle für verdächtige Aktivitäten', NOW(), NULL),
  ('notification_retention_days','30','general','Benachrichtigungen älter als diese Tage werden gelöscht', NOW(), NULL)
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), `updatedAt`=NOW();
