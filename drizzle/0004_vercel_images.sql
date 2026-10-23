CREATE TABLE `image_payloads` (
 `id` text PRIMARY KEY NOT NULL REFERENCES `product_images`(`id`),
 `data_base64` text NOT NULL
);
