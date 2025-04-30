/*
  Warnings:

  - You are about to drop the `book_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "book_tags" DROP CONSTRAINT "book_tags_tagId_fkey";

-- DropTable
DROP TABLE "book_tags";

-- DropTable
DROP TABLE "tags";
