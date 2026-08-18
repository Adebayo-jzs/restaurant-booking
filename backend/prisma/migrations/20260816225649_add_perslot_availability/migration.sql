/*
  Warnings:

  - You are about to drop the column `closingTime` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "closingTime",
DROP COLUMN "openingTime";

-- CreateTable
CREATE TABLE "RestaurantAvailability" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSlots" JSONB NOT NULL,

    CONSTRAINT "RestaurantAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAvailability_restaurantId_date_key" ON "RestaurantAvailability"("restaurantId", "date");

-- AddForeignKey
ALTER TABLE "RestaurantAvailability" ADD CONSTRAINT "RestaurantAvailability_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
