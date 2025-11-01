-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "who_can_aprove_entries" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "who_can_edit" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "who_can_open_cards" SET DEFAULT ARRAY[]::TEXT[];
