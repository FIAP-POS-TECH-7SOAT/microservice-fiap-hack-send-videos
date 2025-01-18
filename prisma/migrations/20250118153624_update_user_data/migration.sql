/*
  Warnings:

  - Added the required column `email` to the `video_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `video_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `video_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "video_user" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "url" DROP NOT NULL;
