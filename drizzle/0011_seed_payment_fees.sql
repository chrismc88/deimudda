-- Seed default payment fee settings for transaction calculations
-- These settings are used in acceptOffer to calculate platform and PayPal fees

-- Platform fee: fixed amount charged per transaction (in Euro)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('platform_fee_fixed','0.42','payments','Fixed platform fee charged per transaction in EUR')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- PayPal fee: percentage of transaction amount
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('paypal_fee_percentage','2.49','payments','PayPal fee percentage (e.g., 2.49 for 2.49%)')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);

-- PayPal fee: fixed amount per transaction (in Euro)
INSERT INTO systemSettings (`key`,`value`,`category`,`description`)
VALUES ('paypal_fee_fixed','0.49','payments','Fixed PayPal fee per transaction in EUR')
ON DUPLICATE KEY UPDATE
  `value`=VALUES(`value`),
  `category`=VALUES(`category`),
  `description`=VALUES(`description`);
