-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "who_can_aprove_entries" TEXT[],
ADD COLUMN     "who_can_edit" TEXT[],
ADD COLUMN     "who_can_open_cards" TEXT[];
