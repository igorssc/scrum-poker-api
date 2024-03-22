/*
  Warnings:

  - The required column `access` was added to the `rooms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "access" TEXT NOT NULL;
