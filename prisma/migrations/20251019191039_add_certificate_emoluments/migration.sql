-- CreateTable
CREATE TABLE "public"."CertificateEmolument" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "value5Years" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "boletoFee" DECIMAL(10,3) NOT NULL DEFAULT 0.87,
    "lucroFee" DECIMAL(10,3) NOT NULL DEFAULT 30.00,
    "serviceValue" DECIMAL(10,3) NOT NULL DEFAULT 5.09,
    "taxPercentage" DECIMAL(5,2) NOT NULL DEFAULT 6.00,
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
