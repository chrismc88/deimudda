-- Seed additional critical system settings for operational control
-- These settings control various system behaviors and limitations

-- Maintenance mode toggle
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('maintenance_mode','false','system','Enable maintenance mode to prevent user access (true/false)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Maximum offers per listing
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_offers_per_listing','10','limits','Maximum number of active offers allowed per listing')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Maximum offers per user (buyer)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_offers_per_user','20','limits','Maximum number of active offers a user can have as buyer')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Minimum offer amount
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('min_offer_amount','1.00','limits','Minimum offer amount in EUR')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Maximum images per listing
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_images_per_listing','8','limits','Maximum number of images allowed per listing')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Image upload size limit (MB)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('max_image_size_mb','5','limits','Maximum image file size in megabytes')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Auto-expire listings after days of inactivity
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('listing_auto_expire_days','30','listings','Automatically expire listings after this many days of inactivity')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Minimum seller profile completion for offers
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('require_seller_profile_for_offers','true','verification','Require completed seller profile to accept offers (true/false)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Email verification required
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('email_verification_required','false','verification','Require email verification before creating listings (true/false)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- Site name for notifications and emails
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('site_name','Deimudda','branding','Site name displayed in notifications and communications')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);
