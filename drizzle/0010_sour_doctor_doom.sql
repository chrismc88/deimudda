CREATE TABLE `authSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`refreshTokenHash` varchar(128) NOT NULL,
	`csrfToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`rotatedAt` timestamp,
	`revokedAt` timestamp,
	CONSTRAINT `authSessions_id` PRIMARY KEY(`id`)
);
