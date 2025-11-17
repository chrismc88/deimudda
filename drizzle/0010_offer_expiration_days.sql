-- Seed default system setting for offer expiration if not present
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('offer_expiration_days','7','limits','Default number of days before a price offer automatically expires')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);
