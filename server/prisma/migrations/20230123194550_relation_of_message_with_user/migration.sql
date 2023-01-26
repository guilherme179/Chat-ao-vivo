-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_author_fkey` FOREIGN KEY (`author`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
