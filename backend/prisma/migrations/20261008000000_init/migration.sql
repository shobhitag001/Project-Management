CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Project` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED',
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `ownerId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Project_ownerId_status_idx`(`ownerId`, `status`),
    INDEX `Project_ownerId_createdAt_idx`(`ownerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Task` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `dueDate` DATETIME(3) NULL,
    `projectId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Task_projectId_status_idx`(`projectId`, `status`),
    INDEX `Task_projectId_priority_idx`(`projectId`, `priority`),
    INDEX `Task_projectId_dueDate_idx`(`projectId`, `dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RevokedToken` (
    `jti` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RevokedToken_expiresAt_idx`(`expiresAt`),
    INDEX `RevokedToken_userId_idx`(`userId`),
    PRIMARY KEY (`jti`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Project`
ADD CONSTRAINT `Project_ownerId_fkey`
FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Task`
ADD CONSTRAINT `Task_projectId_fkey`
FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `RevokedToken`
ADD CONSTRAINT `RevokedToken_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
