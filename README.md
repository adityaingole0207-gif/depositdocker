# DepositLocker • Official Tenancy Inspection & Deposit Protection Registry

> **Design Thinking Prototype**: Tamper-Evident Security Deposit Protection for Tenants in Urban India (Pune & PCMC).

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Custom_Design_System-38B2AC)](https://tailwindcss.com/)
[![Cryptographic SHA-256](https://img.shields.io/badge/SHA--256-Merkle_Chained-2F5D50)](https://en.wikipedia.org/wiki/SHA-2)

---

## 🏛️ Project Overview

**DepositLocker** is a production-quality web application built to eliminate the widespread "security deposit trap" experienced by students and young working professionals in flats and PGs across India. 

Tenants frequently forfeit between ₹10,000 and ₹30,000 to arbitrary deductions (such as full flat repainting for minor scuffs, pre-existing floor cracks, or unitemized cleaning penalties) due to a complete lack of verifiable move-in proof.

DepositLocker addresses this through an **"Official Inspection Record"** conceptual framework:
- **Paper & Notary Aesthetic**: Designed as an official ledger with notary seal stamps, paper grain textures, perforated tear-off edges, and typewriter mono accents.
- **SHA-256 Evidence Chaining**: Every photograph taken at move-in and move-out is fingerprinted with cryptographic SHA-256 and chained into an immutable report root. Any post-handover alteration is mathematically detectable.
- **Automated Depreciation Diff Engine**: Complies with Model Tenancy Act principles—distinguishes normal domestic wear (₹0) from pre-existing flaws (₹0) and calculates fair depreciated deductions instead of arbitrary replacement fines.
- **Frictionless Landlord Engagement**: Zero-login, mobile-ready QR code and tokenized web links allowing property owners to inspect evidence and digitally sign in under 60 seconds.
- **Multilingual Support**: Real-time switchable i18n between English, हिन्दी (Hindi), and मराठी (Marathi).

---

## 🚀 One-Command Quickstart

```bash
npm install && npx prisma migrate dev && npm run seed && npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials
- **Email**: `demo@depositlocker.com`
- **Password**: `demo123`
*(A 1-click "Fill Demo Login" button is also present directly on the login screen).*

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client["Tenant & Landlord Web Client"]
        PWA["Next.js 14 PWA & Camera Capture"]
        UI["Custom Notary & Ledger Design System"]
        I18N["i18n Context (EN / HI / MR)"]
        SLIDER["Before/After Draggable Photo Slider"]
    end

    subgraph Server["Next.js App Router (Node.js)"]
        AUTH["JWT Middleware (jose + bcrypt)"]
        CRYPTO["SHA-256 Hash Chaining & Merkle Engine"]
        DEP["Tenancy Depreciation Calculator"]
        PDF["Server-Side PDF Generator (jsPDF + autotable)"]
        QR["QR Code Generator (QRCode)"]
        API["REST API Endpoints"]
    end

    subgraph Data["Database & Storage Layer"]
        PRISMA["Prisma ORM (SQLite / switchable to PostgreSQL)"]
        LOCAL_STORAGE["/public/uploads & /seed-images (Abstracted)"]
    end

    Client --> AUTH
    AUTH --> API
    API --> CRYPTO
    API --> DEP
    API --> PDF
    API --> QR
    API --> PRISMA
    API --> LOCAL_STORAGE
```

---

## 🗄️ Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ ROOM : owns
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ PASSWORD_RESET_TOKEN : requests
    ROOM ||--o{ INSPECTION_REPORT : contains
    INSPECTION_REPORT ||--o{ INSPECTION_ITEM_RECORD : details
    CHECKLIST_ITEM ||--o{ INSPECTION_ITEM_RECORD : standardizes
    INSPECTION_ITEM_RECORD ||--o{ EVIDENCE_PHOTO : fingerprints

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        string phone
        string preferredLanguage
        datetime createdAt
    }

    ROOM {
        string id PK
        string userId FK
        string title
        string propertyType
        string address
        string area
        int monthlyRent
        int securityDeposit
        datetime leaseStartDate
        datetime leaseEndDate
        string landlordName
        string landlordPhone
        string status
    }

    CHECKLIST_ITEM {
        string id PK
        string code UK
        string category
        string name
        int typicalRepairCostInr
        string damageHint
        string wearTolerance
    }

    INSPECTION_REPORT {
        string id PK
        string roomId FK
        string type
        string status
        string reportNumber UK
        string chainedHash
        datetime lockedAt
        string tenantSignature
        string landlordSignature
        string shareToken UK
    }

    INSPECTION_ITEM_RECORD {
        string id PK
        string reportId FK
        string checklistItemId FK
        int conditionRating
        string status
        int estimatedDeduction
        string notes
        boolean landlordDisputed
        string landlordComment
    }

    EVIDENCE_PHOTO {
        string id PK
        string itemRecordId FK
        string fileUrl
        string sha256Hash
        datetime serverTimestamp
        datetime exifCaptureDate
        float exifGpsLat
        float exifGpsLng
    }
```

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **Guided 40-Point Inspection** | Walkthrough across 9 categories (Walls, Flooring, Ceiling, Doors/Windows, Furniture, Electrical, Bathroom, Kitchen, Safety) with segmented 1–5 scoring and live camera capture. |
| **Cryptographic SHA-256 Chaining** | Immediate hashing of photos upon capture; report locking computes an immutable digest chain preventing post-hoc fabrication. |
| **Live Tamper Verification** | `/reports/[id]/verify` recomputes cryptographic roots in real time and flags any discrepancy as *Intact* or *Tampered*. |
| **Depreciation Diff Engine** | Drop of 1 = Normal Wear & Tear (₹0), Move-in rating ≤ 2 = Pre-existing (₹0). Drops ≥ 2 apply useful life depreciation (Model Tenancy Act). |
| **Interactive Before/After Slider** | Draggable split slider allowing side-by-side visual comparison between Move-In and Move-Out photos for disputed items. |
| **Zero-Login Landlord Flow** | Landlords access reports via unique shareable link or QR code, inspect photos, comment on items, and provide digital signature. |
| **Legal Dispute Helper** | Generates tailored, factual notices citing certificate numbers and SHA-256 hashes, with 1-click WhatsApp and email sharing. |
| **Official PDF Generation** | Server-side printable inspection certificates with notary ledger styling, QR codes, and digital signatures. |
| **Deposit Analytics & Insights** | Interactive Recharts visualizations of 30 survey respondents across Pune hubs (Akurdi, Wakad, Hinjewadi, Nigdi, Chinchwad, Kothrud). |
| **Design Thinking Section** | Dedicated `/about` route documenting Empathize, Define, Ideate, Prototype, and Test phases. |

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates tenant & sets httpOnly cookie |
| `POST` | `/api/auth/register` | Registers tenant with language preference |
| `POST` | `/api/auth/logout` | Clears authentication session cookie |
| `GET` | `/api/auth/me` | Retrieves current session user |
| `POST` | `/api/auth/forgot-password` | Generates password reset token |
| `POST` | `/api/auth/reset-password` | Resets password using token |
| `GET` | `/api/rooms` | Fetches tenant rooms with report statuses |
| `POST` | `/api/rooms` | Registers new property and creates draft move-in report |
| `GET` | `/api/rooms/[id]` | Fetches room ledger hub and 40 checklist items |
| `PUT` | `/api/rooms/[id]` | Updates room particulars |
| `DELETE`| `/api/rooms/[id]` | Archives room record |
| `GET` | `/api/reports/[id]` | Fetches report, items, photos, and chained hashes |
| `POST` | `/api/reports/[id]` | Auto-saves item ratings, notes, and photos |
| `POST` | `/api/reports/[id]/lock` | Permanently seals report with SHA-256 chain |
| `GET` | `/api/reports/[id]/verify` | Recomputes SHA-256 chain and verifies tamper status |
| `GET` | `/api/reports/[id]/pdf` | Streams downloadable official PDF certificate |
| `GET` | `/api/landlord/[token]` | Public read-only landlord inspection view |
| `POST` | `/api/landlord/[token]` | Landlord digital acknowledgment or item dispute |
| `POST` | `/api/upload` | Multipart file upload with SHA-256 calculation |
| `GET` | `/api/notifications` | Fetches in-app notifications |
| `PATCH`| `/api/notifications` | Marks all notifications as read |

---

## 🎨 Design System Specifications

- **Paper Background**: `#F4EFE6` (Paper Cream)
- **Ink Primary**: `#1B1A17` (Deep Carbon Ink)
- **Verified Accent**: `#2F5D50` (Forest Green)
- **Warning / Alert**: `#C8412B` (Vermilion)
- **Caution / Fair**: `#C27803` (Mustard Amber)
- **Dark Mode**: Charcoal (`#161513`) and Cream (`#EDE7DC`)
- **Headings Font**: Fraunces (Variable Serif)
- **Body Font**: IBM Plex Sans
- **Codes & Hashes Font**: IBM Plex Mono
- **Icons**: Custom pure SVG line icons (zero emoji, zero icon webfonts)

---

## 📄 License
MIT License. Created as a Design Thinking Prototype for Tenant Protection in India.
