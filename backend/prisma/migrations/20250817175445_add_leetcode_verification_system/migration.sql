/*
  Warnings:

  - A unique constraint covering the columns `[leetcodeUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."VerificationMethod" AS ENUM ('PROFILE_BIO', 'GITHUB_OAUTH', 'EMAIL_VERIFICATION');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "leetcodeUsername" TEXT;

-- CreateTable
CREATE TABLE "public"."LeetCodeVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leetcodeUsername" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "verificationMethod" "public"."VerificationMethod" NOT NULL DEFAULT 'PROFILE_BIO',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeetCodeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeetCodeVerification_leetcodeUsername_idx" ON "public"."LeetCodeVerification"("leetcodeUsername");

-- CreateIndex
CREATE INDEX "LeetCodeVerification_verificationCode_idx" ON "public"."LeetCodeVerification"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "LeetCodeVerification_userId_leetcodeUsername_key" ON "public"."LeetCodeVerification"("userId", "leetcodeUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_leetcodeUsername_key" ON "public"."User"("leetcodeUsername");

-- AddForeignKey
ALTER TABLE "public"."LeetCodeVerification" ADD CONSTRAINT "LeetCodeVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
