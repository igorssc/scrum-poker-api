-- CreateEnum
CREATE TYPE "StatusMember" AS ENUM ('PENDING', 'LOGGED');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "status" "StatusMember" NOT NULL DEFAULT 'PENDING';
