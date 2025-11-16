-- Seed seller payout minimum setting
INSERT INTO systemSettings (`key`,`value`,`category`,`description`,`updatedAt`,`updatedBy`) VALUES
  ('seller_payout_minimum','1.00','limits','Mindest-Auszahlungsbetrag für Verkäufer in EUR', NOW(), NULL)
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), `updatedAt`=NOW();
