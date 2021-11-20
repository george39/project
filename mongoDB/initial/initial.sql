-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'categories'
-- 
-- ---

DROP TABLE IF EXISTS `categories`;
		
CREATE TABLE `categories` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `parent_id` INTEGER NULL DEFAULT NULL,
  `category_langs_id [ ] (E)` INTEGER NULL DEFAULT NULL,
  `manager_file_id [ ] (R)` INTEGER NULL DEFAULT NULL,
  `lft` INTEGER NULL DEFAULT NULL,
  `rght` INTEGER NULL DEFAULT NULL,
  `level_depth` INTEGER NULL DEFAULT NULL,
  `status` SMALLINT NULL DEFAULT NULL,
  `position` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'manager_files'
-- 
-- ---

DROP TABLE IF EXISTS `manager_files`;
		
CREATE TABLE `manager_files` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `fieldname` VARCHAR NULL DEFAULT NULL,
  `ext` VARCHAR NULL DEFAULT NULL,
  `size` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'langs'
-- 
-- ---

DROP TABLE IF EXISTS `langs`;
		
CREATE TABLE `langs` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `file_id` INTEGER NULL DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `status` INTEGER NULL DEFAULT NULL,
  `iso_code` VARCHAR NULL DEFAULT NULL,
  `language_code` VARCHAR NULL DEFAULT NULL,
  `locale` VARCHAR NULL DEFAULT NULL,
  `date_format_lite` VARCHAR NULL DEFAULT NULL,
  `date_format_full` VARCHAR NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'categories_langs (E)'
-- 
-- ---

DROP TABLE IF EXISTS `categories_langs (E)`;
		
CREATE TABLE `categories_langs (E)` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `lang_id` INTEGER NULL DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `description` VARCHAR NULL DEFAULT NULL,
  `link_rewrite` VARCHAR NULL DEFAULT NULL,
  `meta_title` VARCHAR NULL DEFAULT NULL,
  `meta_keywords` VARCHAR NULL DEFAULT NULL,
  `meta_description` VARCHAR NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'products'
-- 
-- ---

DROP TABLE IF EXISTS `products`;
		
CREATE TABLE `products` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `category_id [ ] (R)` INTEGER NULL DEFAULT NULL,
  `file_id [ ] (R)` INTEGER NULL DEFAULT NULL,
  `product_langs [ ] (E)` INTEGER NULL DEFAULT NULL,
  `maker_id` INTEGER NULL DEFAULT NULL,
  `provider_id` INTEGER NULL DEFAULT NULL,
  `tax_id` INTEGER NULL DEFAULT NULL,
  `bar_code` VARCHAR NULL DEFAULT NULL,
  `code` VARCHAR NULL DEFAULT NULL,
  `quantity` INTEGER NULL DEFAULT NULL,
  `quantity_min` INTEGER NULL DEFAULT NULL,
  `cost` INTEGER NULL DEFAULT NULL,
  `price` INTEGER NULL DEFAULT NULL,
  `profit` INTEGER NULL DEFAULT NULL,
  `percent_discount` INTEGER NULL DEFAULT NULL,
  `shipping_data [ ] (E)` INTEGER NULL DEFAULT NULL,
  `show_price` SMALLINT NULL DEFAULT NULL,
  `online_only` SMALLINT NULL DEFAULT NULL,
  `is_offer` SMALLINT NULL DEFAULT NULL,
  `available_now` SMALLINT NULL DEFAULT NULL,
  `delivery_in_stock` SMALLINT NULL DEFAULT NULL,
  `outstanding` SMALLINT NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  `status` SMALLINT NULL DEFAULT NULL,
  `discountList_id [ ] (E)` INTEGER NULL DEFAULT NULL,
  `localDiscount { } (E)` INTEGER NULL DEFAULT NULL,
  `typeDiscount` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'product_langs (E)'
-- 
-- ---

DROP TABLE IF EXISTS `product_langs (E)`;
		
CREATE TABLE `product_langs (E)` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `lang_id` INTEGER NULL DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `description` VARCHAR NULL DEFAULT NULL,
  `description_short` VARCHAR NULL DEFAULT NULL,
  `link_rewrite` VARCHAR NULL DEFAULT NULL,
  `meta_description` VARCHAR NULL DEFAULT NULL,
  `meta_keywords` VARCHAR NULL DEFAULT NULL,
  `meta_title` VARCHAR NULL DEFAULT NULL,
  `available_later` DATE NULL DEFAULT NULL,
  `delivery_out_stock` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'thirds'
-- 
-- ---

DROP TABLE IF EXISTS `thirds`;
		
CREATE TABLE `thirds` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `type` INTEGER NULL DEFAULT NULL COMMENT '1:Fabricante,2:Proveedor',
  `name` VARCHAR NULL DEFAULT NULL,
  `type_document` SMALLINT NULL DEFAULT NULL,
  `number_document` INTEGER NULL DEFAULT NULL,
  `phone` INTEGER NULL DEFAULT NULL,
  `email` VARCHAR NULL DEFAULT NULL,
  `address` VARCHAR NULL DEFAULT NULL,
  `status` SMALLINT NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'taxes'
-- 
-- ---

DROP TABLE IF EXISTS `taxes`;
		
CREATE TABLE `taxes` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `value` DECIMAL NULL DEFAULT NULL,
  `status` INTEGER NULL DEFAULT NULL,
  `tax_langs_id [ ] (E)` VARCHAR NULL DEFAULT NULL COMMENT '{name}, {}...',
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'movements'
-- 
-- ---

DROP TABLE IF EXISTS `movements`;
		
CREATE TABLE `movements` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `product_id` INTEGER NULL DEFAULT NULL,
  `feature_details_id [ ] (R)` INTEGER NULL DEFAULT NULL COMMENT '{tamaño:S,color:Blanco}',
  `typeMovement_id` INTEGER NULL DEFAULT NULL,
  `quantity` INTEGER NULL DEFAULT NULL,
  `balance` INTEGER NULL DEFAULT NULL,
  `cost` INTEGER NULL DEFAULT NULL,
  `price` INTEGER NULL DEFAULT NULL,
  `order_id` INT NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  `status` SMALLINT NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'shipping_datas (E)'
-- 
-- ---

DROP TABLE IF EXISTS `shipping_datas (E)`;
		
CREATE TABLE `shipping_datas (E)` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `shipper_id [ ] (R)` VARCHAR NULL DEFAULT NULL,
  `location` VARCHAR NULL DEFAULT NULL,
  `width` INTEGER NULL DEFAULT NULL,
  `height` INTEGER NULL DEFAULT NULL,
  `depth` INTEGER NULL DEFAULT NULL,
  `weight` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'features'
-- 
-- ---

DROP TABLE IF EXISTS `features`;
		
CREATE TABLE `features` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `nameLang [ ] (E)` INTEGER NULL DEFAULT NULL,
  `typeFeature_id` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'feature_details'
-- 
-- ---

DROP TABLE IF EXISTS `feature_details`;
		
CREATE TABLE `feature_details` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `feature_id` INTEGER NULL DEFAULT NULL,
  `nameLang [ ] (E)` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'shippers'
-- 
-- ---

DROP TABLE IF EXISTS `shippers`;
		
CREATE TABLE `shippers` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `third_id [ ] (R)` INTEGER NULL DEFAULT NULL,
  `url` VARCHAR NULL DEFAULT NULL,
  `shipping_speed` INTEGER NULL DEFAULT NULL,
  `shipping_cost` INTEGER NULL DEFAULT NULL,
  `rate_id [ ] (E)` VARCHAR NULL DEFAULT NULL,
  `max_width` INTEGER NULL DEFAULT NULL,
  `max_height` INTEGER NULL DEFAULT NULL,
  `max_depth` INTEGER NULL DEFAULT NULL,
  `max_weight` INTEGER NULL DEFAULT NULL,
  `is_free` SMALLINT NULL DEFAULT NULL,
  `status` SMALLINT NULL DEFAULT NULL,
  `manager_file_id [ ] (R)` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'discount_lists'
-- 
-- ---

DROP TABLE IF EXISTS `discount_lists`;
		
CREATE TABLE `discount_lists` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'data_types'
-- 
-- ---

DROP TABLE IF EXISTS `data_types`;
		
CREATE TABLE `data_types` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `alias_id` INTEGER NULL DEFAULT NULL,
  `nameLang` INTEGER NULL DEFAULT NULL,
  `system` SMALLINT NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'orders'
-- 
-- ---

DROP TABLE IF EXISTS `orders`;
		
CREATE TABLE `orders` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `order_code` VARCHAR NULL DEFAULT NULL,
  `productos_id [ ] (E)` VARCHAR NULL DEFAULT NULL,
  `pay_type` INTEGER NULL DEFAULT NULL,
  `shipper_id` INTEGER NULL DEFAULT NULL,
  `tracking_code` VARCHAR NULL DEFAULT NULL,
  `invoice_number` VARCHAR NULL DEFAULT NULL,
  `message` INTEGER NULL DEFAULT NULL,
  `total` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  `status` INTEGER NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'users'
-- 
-- ---

DROP TABLE IF EXISTS `users`;
		
CREATE TABLE `users` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `address_id [ ] (E)` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  `price_lists_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'crafts'
-- 
-- ---

DROP TABLE IF EXISTS `crafts`;
		
CREATE TABLE `crafts` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `products_id [ ] (R)` VARCHAR NULL DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `description` VARCHAR NULL DEFAULT NULL,
  `url_video` INTEGER NULL DEFAULT NULL,
  `shop_id` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'shops'
-- 
-- ---

DROP TABLE IF EXISTS `shops`;
		
CREATE TABLE `shops` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `file_id` INTEGER NULL DEFAULT NULL,
  `description` VARCHAR NULL DEFAULT NULL,
  `url` VARCHAR NULL DEFAULT NULL,
  `user_id` INTEGER NULL DEFAULT NULL,
  `template` VARCHAR NULL DEFAULT NULL,
  `status` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'alias'
-- 
-- ---

DROP TABLE IF EXISTS `alias`;
		
CREATE TABLE `alias` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `nameLang` VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'discountList_id (E)'
-- 
-- ---

DROP TABLE IF EXISTS `discountList_id (E)`;
		
CREATE TABLE `discountList_id (E)` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `discountType` BINARY NULL DEFAULT NULL,
  `discountValue` INTEGER NULL DEFAULT NULL,
  `newPrice` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'localDiscount (E)'
-- 
-- ---

DROP TABLE IF EXISTS `localDiscount (E)`;
		
CREATE TABLE `localDiscount (E)` (
  `id` INTEGER NULL AUTO_INCREMENT DEFAULT NULL,
  `name` VARCHAR NULL DEFAULT NULL,
  `discountType` INTEGER NULL DEFAULT NULL,
  `discountValue` INTEGER NULL DEFAULT NULL,
  `newPrice` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `categories` ADD FOREIGN KEY (category_langs_id [ ] (E)) REFERENCES `categories_langs (E)` (`id`);
ALTER TABLE `categories` ADD FOREIGN KEY (manager_file_id [ ] (R)) REFERENCES `manager_files` (`id`);
ALTER TABLE `langs` ADD FOREIGN KEY (file_id) REFERENCES `manager_files` (`id`);
ALTER TABLE `categories_langs (E)` ADD FOREIGN KEY (lang_id) REFERENCES `langs` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (category_id [ ] (R)) REFERENCES `categories` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (file_id [ ] (R)) REFERENCES `manager_files` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (product_langs [ ] (E)) REFERENCES `product_langs (E)` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (maker_id) REFERENCES `thirds` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (provider_id) REFERENCES `thirds` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (tax_id) REFERENCES `taxes` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (shipping_data [ ] (E)) REFERENCES `shipping_datas (E)` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (discountList_id [ ] (E)) REFERENCES `discountList_id (E)` (`id`);
ALTER TABLE `products` ADD FOREIGN KEY (localDiscount { } (E)) REFERENCES `localDiscount (E)` (`id`);
ALTER TABLE `product_langs (E)` ADD FOREIGN KEY (lang_id) REFERENCES `langs` (`id`);
ALTER TABLE `movements` ADD FOREIGN KEY (product_id) REFERENCES `products` (`id`);
ALTER TABLE `movements` ADD FOREIGN KEY (feature_details_id [ ] (R)) REFERENCES `feature_details` (`id`);
ALTER TABLE `movements` ADD FOREIGN KEY (order_id) REFERENCES `orders` (`id`);
ALTER TABLE `shipping_datas (E)` ADD FOREIGN KEY (shipper_id [ ] (R)) REFERENCES `shippers` (`id`);
ALTER TABLE `feature_details` ADD FOREIGN KEY (feature_id) REFERENCES `features` (`id`);
ALTER TABLE `shippers` ADD FOREIGN KEY (third_id [ ] (R)) REFERENCES `thirds` (`id`);
ALTER TABLE `data_types` ADD FOREIGN KEY (alias_id) REFERENCES `alias` (`id`);
ALTER TABLE `orders` ADD FOREIGN KEY (productos_id [ ] (E)) REFERENCES `products` (`id`);
ALTER TABLE `orders` ADD FOREIGN KEY (shipper_id) REFERENCES `shippers` (`id`);
ALTER TABLE `crafts` ADD FOREIGN KEY (products_id [ ] (R)) REFERENCES `products` (`id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `categories` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `manager_files` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `langs` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `categories_langs (E)` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `products` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `product_langs (E)` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `thirds` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `taxes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `movements` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `shipping_datas (E)` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `features` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `feature_details` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `shippers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `discount_lists` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `data_types` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `orders` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `crafts` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `shops` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `alias` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `discountList_id (E)` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `localDiscount (E)` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `categories` (`id`,`parent_id`,`category_langs_id [ ] (E)`,`manager_file_id [ ] (R)`,`lft`,`rght`,`level_depth`,`status`,`position`,`shop_id`) VALUES
-- ('','','','','','','','','','');
-- INSERT INTO `manager_files` (`id`,`fieldname`,`ext`,`size`,`shop_id`) VALUES
-- ('','','','','');
-- INSERT INTO `langs` (`id`,`file_id`,`name`,`status`,`iso_code`,`language_code`,`locale`,`date_format_lite`,`date_format_full`,`shop_id`) VALUES
-- ('','','','','','','','','','');
-- INSERT INTO `categories_langs (E)` (`id`,`lang_id`,`name`,`description`,`link_rewrite`,`meta_title`,`meta_keywords`,`meta_description`,`shop_id`) VALUES
-- ('','','','','','','','','');
-- INSERT INTO `products` (`id`,`category_id [ ] (R)`,`file_id [ ] (R)`,`product_langs [ ] (E)`,`maker_id`,`provider_id`,`tax_id`,`bar_code`,`code`,`quantity`,`quantity_min`,`cost`,`price`,`profit`,`percent_discount`,`shipping_data [ ] (E)`,`show_price`,`online_only`,`is_offer`,`available_now`,`delivery_in_stock`,`outstanding`,`shop_id`,`status`,`discountList_id [ ] (E)`,`localDiscount { } (E)`,`typeDiscount`) VALUES
-- ('','','','','','','','','','','','','','','','','','','','','','','','','','','');
-- INSERT INTO `product_langs (E)` (`id`,`lang_id`,`name`,`description`,`description_short`,`link_rewrite`,`meta_description`,`meta_keywords`,`meta_title`,`available_later`,`delivery_out_stock`) VALUES
-- ('','','','','','','','','','','');
-- INSERT INTO `thirds` (`id`,`type`,`name`,`type_document`,`number_document`,`phone`,`email`,`address`,`status`,`shop_id`) VALUES
-- ('','','','','','','','','','');
-- INSERT INTO `taxes` (`id`,`value`,`status`,`tax_langs_id [ ] (E)`,`shop_id`) VALUES
-- ('','','','','');
-- INSERT INTO `movements` (`id`,`product_id`,`feature_details_id [ ] (R)`,`typeMovement_id`,`quantity`,`balance`,`cost`,`price`,`order_id`,`shop_id`,`status`) VALUES
-- ('','','','','','','','','','','');
-- INSERT INTO `shipping_datas (E)` (`id`,`shipper_id [ ] (R)`,`location`,`width`,`height`,`depth`,`weight`,`shop_id`) VALUES
-- ('','','','','','','','');
-- INSERT INTO `features` (`id`,`nameLang [ ] (E)`,`typeFeature_id`,`shop_id`) VALUES
-- ('','','','');
-- INSERT INTO `feature_details` (`id`,`feature_id`,`nameLang [ ] (E)`,`shop_id`) VALUES
-- ('','','','');
-- INSERT INTO `shippers` (`id`,`third_id [ ] (R)`,`url`,`shipping_speed`,`shipping_cost`,`rate_id [ ] (E)`,`max_width`,`max_height`,`max_depth`,`max_weight`,`is_free`,`status`,`manager_file_id [ ] (R)`,`shop_id`) VALUES
-- ('','','','','','','','','','','','','','');
-- INSERT INTO `discount_lists` (`id`,`name`,`shop_id`) VALUES
-- ('','','');
-- INSERT INTO `data_types` (`id`,`alias_id`,`nameLang`,`system`,`shop_id`) VALUES
-- ('','','','','');
-- INSERT INTO `orders` (`id`,`code`,`productos_id [ ] (E)`,`pay_type`,`shipper_id`,`tracking_code`,`invoice_number`,`message`,`total`,`shop_id`,`status`,`user_id`) VALUES
-- ('','','','','','','','','','','','');
-- INSERT INTO `users` (`id`,`address_id [ ] (E)`,`shop_id`,`price_lists_id`) VALUES
-- ('','','','');
-- INSERT INTO `crafts` (`id`,`products_id [ ] (R)`,`name`,`description`,`url_video`,`shop_id`) VALUES
-- ('','','','','','');
-- INSERT INTO `shops` (`id`,`name`,`file_id`,`description`,`url`,`user_id`,`template`,`status`) VALUES
-- ('','','','','','','','');
-- INSERT INTO `alias` (`id`,`nameLang`) VALUES
-- ('','');
-- INSERT INTO `discountList_id (E)` (`id`,`name`,`discountType`,`discountValue`,`newPrice`) VALUES
-- ('','','','','');
-- INSERT INTO `localDiscount (E)` (`id`,`name`,`discountType`,`discountValue`,`newPrice`) VALUES
-- ('','','','','');