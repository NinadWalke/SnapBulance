-- DropForeignKey
ALTER TABLE "MedicalReport" DROP CONSTRAINT "MedicalReport_tripId_fkey";

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
