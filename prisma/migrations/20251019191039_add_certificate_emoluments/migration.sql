-- CreateTable
CREATE TABLE "public"."CertificateEmolument" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "value3Years" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "boletoFee" DECIMAL(10,3) NOT NULL DEFAULT 5.087,
    "lucroFee" DECIMAL(10,3) NOT NULL DEFAULT 5.087,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 30.6,
    "taxValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateEmolument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CertificateEmolument_state_key" ON "public"."CertificateEmolument"("state");

-- CreateIndex
CREATE INDEX "CertificateEmolument_state_idx" ON "public"."CertificateEmolument"("state");

-- CreateIndex
CREATE INDEX "CertificateEmolument_active_idx" ON "public"."CertificateEmolument"("active");
