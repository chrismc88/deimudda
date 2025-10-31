ALTER TABLE `listings` ADD `shippingVerified` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` ADD `shippingPickup` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `listings` DROP COLUMN `shippingMethod`;