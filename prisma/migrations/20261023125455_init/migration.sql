-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Pune / PCMC',
    "pincode" TEXT NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "securityDeposit" INTEGER NOT NULL,
    "leaseStartDate" DATETIME NOT NULL,
    "leaseEndDate" DATETIME NOT NULL,
    "landlordName" TEXT NOT NULL,
    "landlordPhone" TEXT NOT NULL,
    "landlordEmail" TEXT,
    "agreementUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'MOVE_IN_PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typicalRepairCostInr" INTEGER NOT NULL,
    "damageHint" TEXT NOT NULL,
    "wearTolerance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "InspectionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reportNumber" TEXT NOT NULL,
    "chainedHash" TEXT,
    "lockedAt" DATETIME,
    "completedAt" DATETIME,
    "tenantSignature" TEXT,
    "landlordSignature" TEXT,
    "landlordAcknowledgedAt" DATETIME,
    "landlordName" TEXT,
    "landlordPhone" TEXT,
    "landlordNotes" TEXT,
    "landlordStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "shareToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InspectionReport_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InspectionItemRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "conditionRating" INTEGER NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INTACT',
    "estimatedDeduction" INTEGER NOT NULL DEFAULT 0,
    "landlordDisputed" BOOLEAN NOT NULL DEFAULT false,
    "landlordComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InspectionItemRecord_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "InspectionReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InspectionItemRecord_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidencePhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemRecordId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "sha256Hash" TEXT NOT NULL,
    "serverTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exifCaptureDate" DATETIME,
    "exifGpsLat" REAL,
    "exifGpsLng" REAL,
    "deviceLastModified" DATETIME,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidencePhoto_itemRecordId_fkey" FOREIGN KEY ("itemRecordId") REFERENCES "InspectionItemRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TenantSurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantName" TEXT NOT NULL,
    "cityArea" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "depositPaid" INTEGER NOT NULL,
    "depositDeducted" INTEGER NOT NULL,
    "deductionReason" TEXT NOT NULL,
    "hadPhotoProof" BOOLEAN NOT NULL,
    "disputeOutcome" TEXT NOT NULL,
    "satisfactionScore" INTEGER NOT NULL,
    "rentTenancyMonths" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_code_key" ON "ChecklistItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReport_reportNumber_key" ON "InspectionReport"("reportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReport_shareToken_key" ON "InspectionReport"("shareToken");
