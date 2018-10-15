/* Drop ariantveg DB if it exists */
drop database if exists `oauth2`;


CREATE DATABASE `oauth2`;
USE `oauth2`;

CREATE TABLE `cd_password` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `password_hash` VARCHAR(4000) NOT NULL ,
  `effective_date` DATE NOT NULL DEFAULT '1900-01-01' ,
  `expiry_date` DATE NOT NULL DEFAULT '3000-01-01' ,
  PRIMARY KEY (`id`)
);

ALTER TABLE `cd_password`
  AUTO_INCREMENT = 101;

/*User Table*/
CREATE TABLE `cd_users` (
  `id` int(11) NOT NULL,
  `effective_date` date NOT NULL DEFAULT '1900-01-01',
  `expiry_date` date NOT NULL DEFAULT '3000-01-01',
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NULL,
  `password_id` int(11) NOT NULL
);

ALTER TABLE `cd_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `password_id` (`password_id`),
  ADD UNIQUE `u1_users` (`email`),
  ADD INDEX `i1_users` (`name`),
  ADD INDEX `i2_users` (`email`);

ALTER TABLE `cd_users`
  ADD CONSTRAINT `fk1_users` FOREIGN KEY (`password_id`) REFERENCES `cd_password` (`id`);

ALTER TABLE `cd_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cd_users`
  AUTO_INCREMENT = 10001;

/*Employer OAuth Table*/
CREATE TABLE `cd_auth_client` (
  `id` int(11) NOT NULL,
  `effective_date` date NOT NULL DEFAULT '1900-01-01',
  `expiry_date` date NOT NULL DEFAULT '3000-01-01',
  `name` varchar(255) NOT NULL,
  `client_id` varchar(255) NOT NULL,
  `client_secret` varchar(255) NULL,
  `redirect_uri` varchar(255) NOT NULL
);

ALTER TABLE `cd_auth_client`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE `u1_auth_client` (`client_id`),
  ADD INDEX `i1_auth_client` (`client_id`);

ALTER TABLE `cd_auth_client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cd_auth_client`
  AUTO_INCREMENT = 10001;

CREATE TABLE `cd_auth_token` (
  `id` int(11) NOT NULL,
  `effective_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiry_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `token` varchar(1023) NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL
);

ALTER TABLE `cd_auth_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `client_id` (`client_id`),
  ADD INDEX `i1_users_auth_token` (`token`,`client_id`),
  ADD INDEX `i2_users_auth_token` (`token`,`user_id`);

ALTER TABLE `cd_auth_token`
  ADD CONSTRAINT `fk1_auth_token` FOREIGN KEY (`user_id`) REFERENCES `cd_users` (`id`);

ALTER TABLE `cd_auth_token`
  ADD CONSTRAINT `fk2_auth_token` FOREIGN KEY (`client_id`) REFERENCES `cd_auth_client` (`id`);

ALTER TABLE `cd_auth_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cd_auth_token`
  AUTO_INCREMENT = 10001;

CREATE TABLE `cd_refresh_token` (
  `id` int(11) NOT NULL,
  `effective_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiry_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `refresh_token` varchar(1023) NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL
);

ALTER TABLE `cd_refresh_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `client_id` (`client_id`),
  ADD INDEX `i1_users_refresh_token` (`refresh_token`,`client_id`),
  ADD INDEX `i2_users_refresh_token` (`refresh_token`,`user_id`);

ALTER TABLE `cd_refresh_token`
  ADD CONSTRAINT `fk1_users_refresh_token` FOREIGN KEY (`user_id`) REFERENCES `cd_users` (`id`);

ALTER TABLE `cd_refresh_token`
  ADD CONSTRAINT `fk2_users_refresh_token` FOREIGN KEY (`client_id`) REFERENCES `cd_auth_client` (`id`);

ALTER TABLE `cd_refresh_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cd_refresh_token`
  AUTO_INCREMENT = 10001;
