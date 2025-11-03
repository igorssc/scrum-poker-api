-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalized_at" TIMESTAMP(3),
    "total_duration" INTEGER,
    "final_consensus" TEXT,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_rounds" (
    "id" TEXT NOT NULL,
    "vote_id" TEXT NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "consensus" TEXT,
    "winner_cards" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "voting_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_details" (
    "id" TEXT NOT NULL,
    "voting_round_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_rounds" ADD CONSTRAINT "voting_rounds_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_details" ADD CONSTRAINT "vote_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_details" ADD CONSTRAINT "vote_details_voting_round_id_fkey" FOREIGN KEY ("voting_round_id") REFERENCES "voting_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
