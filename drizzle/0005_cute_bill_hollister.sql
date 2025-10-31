ALTER TABLE `listings` ADD `genetics` enum('sativa','indica','hybrid');--> statement-breakpoint
ALTER TABLE `listings` ADD `seedBank` varchar(255);--> statement-breakpoint
ALTER TABLE `listings` ADD `growMethod` enum('hydro','bio','soil');--> statement-breakpoint
ALTER TABLE `listings` ADD `seedType` enum('feminized','regular','autoflower');--> statement-breakpoint
ALTER TABLE `listings` ADD `thcContent` varchar(50);--> statement-breakpoint
ALTER TABLE `listings` ADD `cbdContent` varchar(50);--> statement-breakpoint
ALTER TABLE `listings` ADD `floweringTime` varchar(100);--> statement-breakpoint
ALTER TABLE `listings` ADD `yieldInfo` varchar(255);--> statement-breakpoint
ALTER TABLE `listings` ADD `flavorProfile` varchar(500);--> statement-breakpoint
ALTER TABLE `listings` ADD `origin` varchar(255);