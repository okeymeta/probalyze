CREATE TABLE `bets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`market_id` integer NOT NULL,
	`user_wallet` text NOT NULL,
	`amount` real NOT NULL,
	`prediction` text NOT NULL,
	`price_at_bet` real NOT NULL,
	`potential_payout` real NOT NULL,
	`actual_payout` real DEFAULT 0 NOT NULL,
	`platform_fee` real NOT NULL,
	`transaction_signature` text,
	`timestamp` text NOT NULL,
	`is_settled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `market_chart_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`market_id` integer NOT NULL,
	`timestamp` text NOT NULL,
	`yes_price` real NOT NULL,
	`no_price` real NOT NULL,
	`volume` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `markets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`status` text DEFAULT 'active' NOT NULL,
	`total_yes_amount` real DEFAULT 0 NOT NULL,
	`total_no_amount` real DEFAULT 0 NOT NULL,
	`yes_price` real DEFAULT 0.5 NOT NULL,
	`no_price` real DEFAULT 0.5 NOT NULL,
	`outcome` text,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`closes_at` text,
	`resolved_at` text,
	`category` text,
	`volume_24h` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `platform_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_fees_collected` real DEFAULT 0 NOT NULL,
	`total_volume` real DEFAULT 0 NOT NULL,
	`total_markets` integer DEFAULT 0 NOT NULL,
	`total_users` integer DEFAULT 0 NOT NULL,
	`total_bets` integer DEFAULT 0 NOT NULL,
	`pool_balance` real DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_address` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`total_volume` real DEFAULT 0 NOT NULL,
	`total_winnings` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_wallet_address_unique` ON `users` (`wallet_address`);