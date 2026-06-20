-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "builders" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearEstablished" INTEGER NOT NULL,
    "deliveredProjects" INTEGER NOT NULL DEFAULT 0,
    "logoColor" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "builderId" UUID NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "possession" TEXT NOT NULL,
    "possessionDate" TEXT NOT NULL,
    "reraId" TEXT NOT NULL,
    "areaAcres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "towers" INTEGER NOT NULL DEFAULT 0,
    "configsLabel" TEXT NOT NULL,
    "gradientFrom" TEXT NOT NULL DEFAULT '#0f3460',
    "gradientTo" TEXT NOT NULL DEFAULT '#16697a',
    "highlights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "startingPriceLakh" DOUBLE PRECISION NOT NULL,
    "pricePerSqFt" INTEGER NOT NULL,
    "priceRangeLabel" TEXT NOT NULL,
    "minPriceLakh" DOUBLE PRECISION,
    "maxPriceLakh" DOUBLE PRECISION,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "areaSqFt" INTEGER NOT NULL,
    "priceLabel" TEXT NOT NULL,
    "floorPlanImage" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_metrics" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "metroKm" DOUBLE PRECISION NOT NULL,
    "hospitalKm" DOUBLE PRECISION NOT NULL,
    "schoolKm" DOUBLE PRECISION NOT NULL,
    "airportKm" DOUBLE PRECISION NOT NULL,
    "connectivityIndex" INTEGER NOT NULL,

    CONSTRAINT "location_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_metrics" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "appreciationPct" DOUBLE PRECISION NOT NULL,
    "rentalYieldPct" DOUBLE PRECISION NOT NULL,
    "demandIndex" INTEGER NOT NULL,

    CONSTRAINT "investment_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_videos" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "property_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "userId" UUID,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_comparisons" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_comparison_properties" (
    "id" UUID NOT NULL,
    "savedComparisonId" UUID NOT NULL,
    "propertyId" UUID NOT NULL,

    CONSTRAINT "saved_comparison_properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "builders_name_key" ON "builders"("name");

-- CreateIndex
CREATE INDEX "builders_name_idx" ON "builders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "properties_reraId_key" ON "properties"("reraId");

-- CreateIndex
CREATE INDEX "properties_builderId_idx" ON "properties"("builderId");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_kind_idx" ON "properties"("kind");

-- CreateIndex
CREATE INDEX "properties_possession_idx" ON "properties"("possession");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_propertyId_key" ON "pricing"("propertyId");

-- CreateIndex
CREATE INDEX "pricing_startingPriceLakh_idx" ON "pricing"("startingPriceLakh");

-- CreateIndex
CREATE INDEX "configurations_propertyId_idx" ON "configurations"("propertyId");

-- CreateIndex
CREATE INDEX "amenities_propertyId_idx" ON "amenities"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_propertyId_key_key" ON "amenities"("propertyId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "location_metrics_propertyId_key" ON "location_metrics"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "investment_metrics_propertyId_key" ON "investment_metrics"("propertyId");

-- CreateIndex
CREATE INDEX "property_images_propertyId_idx" ON "property_images"("propertyId");

-- CreateIndex
CREATE INDEX "property_videos_propertyId_idx" ON "property_videos"("propertyId");

-- CreateIndex
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "saved_comparisons_userId_idx" ON "saved_comparisons"("userId");

-- CreateIndex
CREATE INDEX "saved_comparison_properties_propertyId_idx" ON "saved_comparison_properties"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_comparison_properties_savedComparisonId_propertyId_key" ON "saved_comparison_properties"("savedComparisonId", "propertyId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "builders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_metrics" ADD CONSTRAINT "location_metrics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_metrics" ADD CONSTRAINT "investment_metrics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_videos" ADD CONSTRAINT "property_videos_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparison_properties" ADD CONSTRAINT "saved_comparison_properties_savedComparisonId_fkey" FOREIGN KEY ("savedComparisonId") REFERENCES "saved_comparisons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparison_properties" ADD CONSTRAINT "saved_comparison_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

