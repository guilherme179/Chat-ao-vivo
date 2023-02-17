-- CreateTable
CREATE TABLE `PrivateMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `author` VARCHAR(255) NOT NULL,
    `receiver` VARCHAR(255) NOT NULL,
    `text` VARCHAR(255) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrivateMessage` ADD CONSTRAINT `PrivateMessage_author_fkey` FOREIGN KEY (`author`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
