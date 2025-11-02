-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "auto_grant_permissions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
