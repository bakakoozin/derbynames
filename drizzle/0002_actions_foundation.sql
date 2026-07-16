ALTER TABLE `clubs`
  ADD COLUMN `parentClubId` varchar(255);

ALTER TABLE `derbynames`
  ADD COLUMN `derbyType` varchar(20) NOT NULL DEFAULT 'player',
  ADD COLUMN `userId` int;

ALTER TABLE `derbyname_rename_history`
  ADD COLUMN `derbyType` varchar(20) NOT NULL DEFAULT 'player';

CREATE TABLE `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `createdAt` timestamp DEFAULT NOW(),
  `updatedAt` timestamp DEFAULT NOW() ON UPDATE NOW(),
  CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE TABLE `actions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `actionType` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `token` varchar(255),
  `expiresAt` timestamp,
  `payload` text,
  `completedAt` timestamp,
  `createdAt` timestamp DEFAULT NOW(),
  `updatedAt` timestamp DEFAULT NOW() ON UPDATE NOW(),
  CONSTRAINT `actions_token_unique` UNIQUE(`token`)
);

CREATE INDEX `actions_userId_idx` ON `actions` (`userId`);
CREATE INDEX `actions_status_expiresAt_idx` ON `actions` (`status`, `expiresAt`);
CREATE INDEX `actions_actionType_idx` ON `actions` (`actionType`);
CREATE INDEX `derbynames_email_derbyType_confirmed_idx` ON `derbynames` (`email`, `derbyType`, `emailConfirmed`);
CREATE INDEX `clubs_parentClubId_idx` ON `clubs` (`parentClubId`);
