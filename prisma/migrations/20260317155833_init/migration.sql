-- CreateEnum
CREATE TYPE "OptInSource" AS ENUM ('TIKTOK', 'INSTAGRAM', 'DISCORD', 'ORGANIC', 'OTHER');

-- CreateTable
CREATE TABLE "OptIn" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "OptInSource" NOT NULL,
    "channel" TEXT NOT NULL,
    "consent_status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "payment_processor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processor_ref" TEXT,
    "amount_agorot" INTEGER NOT NULL,
    "is_upgrade" BOOLEAN NOT NULL DEFAULT false,
    "upgrade_price_agorot" INTEGER,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discord_username" TEXT,
    "discord_role_assigned" BOOLEAN NOT NULL DEFAULT false,
    "tier" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "payment_ref" TEXT NOT NULL,
    "payment_processor" TEXT NOT NULL,
    "oto_purchased" BOOLEAN NOT NULL DEFAULT false,
    "kit_subscriber_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discord_channel_url" TEXT NOT NULL,
    "drip_day" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailEvent" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "sequence_name" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),

    CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofAsset" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionLog" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");
