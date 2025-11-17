-- Chat moderation support: conversations table + message moderation columns

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `listingId` int NOT NULL,
  `buyerId` int NOT NULL,
  `sellerId` int NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  `lockedReason` text,
  `lockedBy` int,
  `lockedAt` timestamp NULL,
  `lastMessageAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_listing_buyer_seller_unique` (`listingId`,`buyerId`,`sellerId`),
  KEY `conversations_listing_idx` (`listingId`),
  KEY `conversations_buyer_idx` (`buyerId`),
  KEY `conversations_seller_idx` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `messages`
  ADD COLUMN `conversationId` int NULL AFTER `listingId`,
  ADD COLUMN `moderatedAt` timestamp NULL AFTER `isRead`,
  ADD COLUMN `moderatedBy` int NULL AFTER `moderatedAt`,
  ADD COLUMN `moderationReason` text NULL AFTER `moderatedBy`,
  ADD COLUMN `deletedAt` timestamp NULL AFTER `moderationReason`,
  ADD COLUMN `deletedBy` int NULL AFTER `deletedAt`;

CREATE INDEX `messages_conversation_idx` ON `messages` (`conversationId`);

-- Backfill existing messages into conversations table (per listing + buyer pair)
INSERT INTO `conversations` (`listingId`, `buyerId`, `sellerId`, `locked`, `lastMessageAt`, `createdAt`, `updatedAt`)
SELECT
  l.id AS listingId,
  CASE WHEN m.senderId = l.sellerId THEN m.receiverId ELSE m.senderId END AS buyerId,
  l.sellerId,
  0,
  MAX(m.createdAt) AS lastMessageAt,
  NOW(),
  NOW()
FROM `messages` m
JOIN `listings` l ON l.id = m.listingId
WHERE m.listingId IS NOT NULL
GROUP BY l.id, buyerId
ON DUPLICATE KEY UPDATE
  `lastMessageAt` = GREATEST(`conversations`.`lastMessageAt`, VALUES(`lastMessageAt`)),
  `updatedAt` = NOW();

-- Attach historical messages to their conversation
UPDATE `messages` m
JOIN `listings` l ON l.id = m.listingId
JOIN `conversations` c
  ON c.listingId = m.listingId
 AND c.buyerId = CASE WHEN m.senderId = l.sellerId THEN m.receiverId ELSE m.senderId END
SET m.conversationId = c.id
WHERE m.listingId IS NOT NULL;
