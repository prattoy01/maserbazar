ALTER TABLE `orders` ADD `trx_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_status` text DEFAULT 'pending' NOT NULL;
