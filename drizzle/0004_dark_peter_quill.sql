ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `nickname` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImageUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `isSellerActive` boolean DEFAULT false NOT NULL;