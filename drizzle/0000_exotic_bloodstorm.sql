CREATE TABLE `carts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`items` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`area` text NOT NULL,
	`items` text NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer NOT NULL,
	`delivery` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`payment` text DEFAULT 'cod' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`stock_applied` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_user_request` ON `orders` (`user_id`,`request_id`);--> statement-breakpoint
CREATE INDEX `orders_user_created` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`original_price` integer NOT NULL,
	`stock` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
