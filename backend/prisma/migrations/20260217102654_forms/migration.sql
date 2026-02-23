-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT,
    CONSTRAINT "form_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "field_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "validation" TEXT,
    "uiProperties" TEXT,
    "options" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "field_definitions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asset_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "formVersion" INTEGER NOT NULL,
    "assetType" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asset_records_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asset_records_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asset_field_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "dataKey" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asset_field_values_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset_records" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asset_field_values_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "field_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "form_templates_createdBy_idx" ON "form_templates"("createdBy");

-- CreateIndex
CREATE INDEX "form_templates_tenantId_idx" ON "form_templates"("tenantId");

-- CreateIndex
CREATE INDEX "form_templates_status_idx" ON "form_templates"("status");

-- CreateIndex
CREATE INDEX "field_definitions_formId_idx" ON "field_definitions"("formId");

-- CreateIndex
CREATE INDEX "field_definitions_order_idx" ON "field_definitions"("order");

-- CreateIndex
CREATE UNIQUE INDEX "field_definitions_formId_fieldName_key" ON "field_definitions"("formId", "fieldName");

-- CreateIndex
CREATE INDEX "asset_records_formId_idx" ON "asset_records"("formId");

-- CreateIndex
CREATE INDEX "asset_records_createdBy_idx" ON "asset_records"("createdBy");

-- CreateIndex
CREATE INDEX "asset_records_assetType_idx" ON "asset_records"("assetType");

-- CreateIndex
CREATE INDEX "asset_records_createdAt_idx" ON "asset_records"("createdAt");

-- CreateIndex
CREATE INDEX "asset_field_values_assetId_idx" ON "asset_field_values"("assetId");

-- CreateIndex
CREATE INDEX "asset_field_values_fieldId_idx" ON "asset_field_values"("fieldId");

-- CreateIndex
CREATE INDEX "asset_field_values_dataKey_idx" ON "asset_field_values"("dataKey");

-- CreateIndex
CREATE UNIQUE INDEX "asset_field_values_assetId_fieldId_key" ON "asset_field_values"("assetId", "fieldId");
