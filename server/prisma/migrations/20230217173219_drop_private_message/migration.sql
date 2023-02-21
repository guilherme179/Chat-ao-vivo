/*
  Warnings:

  - You are about to drop the `privatemessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `privatemessage` DROP FOREIGN KEY `PrivateMessage_author_fkey`;

-- DropTable
DROP TABLE `privatemessage`;
