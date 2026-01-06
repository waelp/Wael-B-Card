CREATE TABLE `app_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phoneNumber` varchar(20),
	`passwordHash` varchar(255) NOT NULL,
	`isEmailVerified` boolean NOT NULL DEFAULT false,
	`verificationCode` varchar(6),
	`verificationCodeExpiry` timestamp,
	`resetToken` varchar(255),
	`resetTokenExpiry` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLogin` timestamp,
	CONSTRAINT `app_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `business_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`fullName` varchar(255) NOT NULL,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`jobTitle` varchar(255),
	`department` varchar(255),
	`mobileNumber` varchar(50),
	`phoneNumber` varchar(50),
	`email` varchar(320),
	`website` varchar(500),
	`address` text,
	`notes` text,
	`imageUrl` varchar(500),
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_cards_id` PRIMARY KEY(`id`)
);
