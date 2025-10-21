-- AlterTable: Rename value3Years to value5Years
ALTER TABLE "public"."CertificateEmolument"
RENAME COLUMN "value3Years" TO "value5Years";

-- AlterTable: Add serviceValue column
ALTER TABLE "public"."CertificateEmolument"
ADD COLUMN "serviceValue" DECIMAL(10,3) NOT NULL DEFAULT 5.09;

-- AlterTable: Update default values
ALTER TABLE "public"."CertificateEmolument"
ALTER COLUMN "boletoFee" SET DEFAULT 0.87,
ALTER COLUMN "lucroFee" SET DEFAULT 30.00,
ALTER COLUMN "taxPercentage" SET DEFAULT 6.00;
