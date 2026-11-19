-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkCode" TEXT,
ADD COLUMN     "linkCodeExp" TIMESTAMP(3),
ADD COLUMN     "telegramId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "remindedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_linkCode_key" ON "User"("linkCode");

-- CreateIndex
CREATE INDEX "Task_done_dueDate_idx" ON "Task"("done", "dueDate");

