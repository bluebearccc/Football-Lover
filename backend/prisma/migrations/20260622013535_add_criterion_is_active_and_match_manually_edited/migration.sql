-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "manually_edited_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "prediction_criteria" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
