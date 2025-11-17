-- Commerce & Transaction Settings (max price, min rating)
-- Created: 2025-11-16

INSERT INTO systemSettings (`key`, `value`, category, description)
VALUES 
('max_listing_price','10000','commerce','Maximum allowed price for listings in EUR'),
('min_seller_rating','0','commerce','Minimum rating required to sell on the platform')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), description=VALUES(description);
