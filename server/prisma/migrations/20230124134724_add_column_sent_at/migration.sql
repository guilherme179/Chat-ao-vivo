/*
  Warnings:

  - Added the required column `sentAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `sentAt` DATETIME(3) NOT NULL;
