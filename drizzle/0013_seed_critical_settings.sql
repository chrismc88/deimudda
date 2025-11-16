-- Seed critical system settings for security, payments, and operations
-- Migration 0013: Add session lifetime, payment minimums, and security settings

-- Session lifetime in days (currently hardcoded as 1 year)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('session_lifetime_days','14','security','Session cookie lifetime in days (replaces ONE_YEAR_MS hardcode)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Minimum transaction amount to avoid excessive fees
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('min_transaction_amount','5.00','payments','Minimum transaction amount in EUR (prevents excessive PayPal fees on small amounts)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Seller payout minimum for batch processing
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('seller_payout_minimum','20.00','payments','Minimum balance required for seller payout in EUR')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Refund window for buyer protection (EU law compliance)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('refund_window_days','14','payments','Number of days buyers can request refunds (EU consumer protection)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Currency setting for future multi-currency support
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('platform_currency','EUR','payments','Platform currency (EUR, USD, etc.)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- IP block duration for automatic unblocking
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('ip_block_duration_hours','24','security','Automatic unblock time for blocked IPs in hours (0 = manual only)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Max login attempts before IP block
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_login_attempts','5','security','Maximum failed login attempts before IP blocking')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Suspicious activity threshold
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('suspicious_activity_threshold','10','security','Number of rapid actions triggering security review (offers/min, etc.)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Notification retention for cleanup
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('notification_retention_days','30','notifications','Auto-delete read notifications older than X days')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Email notification global toggle
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('email_notifications_enabled','true','notifications','Global toggle for email notifications (maintenance mode)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Max active listings per user
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_active_listings_per_user','20','limits','Maximum number of active listings a user can have')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Listing approval requirement
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('require_listing_approval','false','verification','Require admin approval before listings go live')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Rating system toggle
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('enable_ratings','true','features','Enable/disable rating and review system')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Min transactions before rating
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('min_transactions_for_rating','1','features','Minimum completed transactions required to leave a rating')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Message length limit
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_message_length','2000','limits','Maximum message length in characters')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Message rate limit
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('message_rate_limit_per_hour','50','limits','Maximum messages per user per hour (spam prevention)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);
