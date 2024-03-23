/*
  Warnings:

  - You are about to drop the column `member_id` on the `members` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_member_id_fkey";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "member_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
