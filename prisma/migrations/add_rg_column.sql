-- Add missing rg column to User table
-- This migration adds the rg (RG document) field that exists in the schema but not in production database

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rg" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "User"."rg" IS 'RG (Registro Geral) document number';
