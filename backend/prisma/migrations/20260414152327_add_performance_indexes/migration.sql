-- CreateIndex
CREATE INDEX "Review_gameId_idx" ON "Review"("gameId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "UserGameStatus_userId_idx" ON "UserGameStatus"("userId");

-- CreateIndex
CREATE INDEX "UserGameStatus_gameId_idx" ON "UserGameStatus"("gameId");
