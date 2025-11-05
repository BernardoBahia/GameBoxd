/*
  Warnings:

  - You are about to drop the column `gameId` on the `List` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."List" DROP CONSTRAINT "List_gameId_fkey";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "gameId",
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ListGame" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListGame_listId_gameId_key" ON "ListGame"("listId", "gameId");

-- AddForeignKey
ALTER TABLE "ListGame" ADD CONSTRAINT "ListGame_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListGame" ADD CONSTRAINT "ListGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
