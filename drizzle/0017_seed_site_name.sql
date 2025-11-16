INSERT INTO systemSettings (`key`, `value`, `category`, `description`, `updatedAt`, `updatedBy`) VALUES
  ('site_name','deimudda – Cannabis-Stecklingsbörse','general','Angezeigter Name der Plattform', NOW(), NULL)
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), `updatedAt`=NOW();
INSERT INTO systemSettings (`key`, `value`) VALUES ('site_name', 'deimudda – Cannabis-Stecklingsbörse');
