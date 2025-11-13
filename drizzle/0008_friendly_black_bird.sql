CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`offerAmount` decimal(10,2) NOT NULL,
	`message` text,
	`status` enum('pending','accepted','rejected','countered','expired') NOT NULL DEFAULT 'pending',
	`counterAmount` decimal(10,2),
	`counterMessage` text,
	`expiresAt` timestamp,
	`respondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `bids`;--> statement-breakpoint
ALTER TABLE `listings` MODIFY COLUMN `priceType` enum('fixed','offer') NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `offerMinPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `listings` ADD `acceptsOffers` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` DROP COLUMN `auctionStartPrice`;--> statement-breakpoint
ALTER TABLE `listings` DROP COLUMN `auctionEndTime`;