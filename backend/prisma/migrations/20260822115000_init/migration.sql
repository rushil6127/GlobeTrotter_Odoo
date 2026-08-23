-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ActivityVote" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL DEFAULT 'UPVOTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripComment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itineraryItemId" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySuggestion" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayNumber" INTEGER,
    "date" TIMESTAMP(3),
    "notes" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityVote_tripId_idx" ON "ActivityVote"("tripId");

-- CreateIndex
CREATE INDEX "ActivityVote_activityId_idx" ON "ActivityVote"("activityId");

-- CreateIndex
CREATE INDEX "ActivityVote_userId_idx" ON "ActivityVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityVote_tripId_activityId_userId_key" ON "ActivityVote"("tripId", "activityId", "userId");

-- CreateIndex
CREATE INDEX "TripComment_tripId_idx" ON "TripComment"("tripId");

-- CreateIndex
CREATE INDEX "TripComment_itineraryItemId_idx" ON "TripComment"("itineraryItemId");

-- CreateIndex
CREATE INDEX "TripComment_userId_idx" ON "TripComment"("userId");

-- CreateIndex
CREATE INDEX "ActivitySuggestion_tripId_idx" ON "ActivitySuggestion"("tripId");

-- CreateIndex
CREATE INDEX "ActivitySuggestion_activityId_idx" ON "ActivitySuggestion"("activityId");

-- CreateIndex
CREATE INDEX "ActivitySuggestion_userId_idx" ON "ActivitySuggestion"("userId");

-- AddForeignKey
ALTER TABLE "ActivityVote" ADD CONSTRAINT "ActivityVote_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityVote" ADD CONSTRAINT "ActivityVote_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityVote" ADD CONSTRAINT "ActivityVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripComment" ADD CONSTRAINT "TripComment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripComment" ADD CONSTRAINT "TripComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripComment" ADD CONSTRAINT "TripComment_itineraryItemId_fkey" FOREIGN KEY ("itineraryItemId") REFERENCES "ItineraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySuggestion" ADD CONSTRAINT "ActivitySuggestion_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySuggestion" ADD CONSTRAINT "ActivitySuggestion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySuggestion" ADD CONSTRAINT "ActivitySuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
