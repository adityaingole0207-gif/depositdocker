const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to compute sha256
function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Match the exact algorithm in src/lib/crypto.ts
function computeItemHash(itemId, conditionRating, status, photoHashes) {
  const sortedPhotos = [...photoHashes].sort().join(',');
  const itemPayload = `ITEM:${itemId}|RATING:${conditionRating}|STATUS:${status}|PHOTOS:[${sortedPhotos}]`;
  return sha256(itemPayload);
}

function computeReportChainedHash(reportNumber, lockedAtIsoString, itemHashes) {
  const sortedItemHashes = [...itemHashes].sort().join('::');
  const chainPayload = `DL-CERT:${reportNumber}|LOCKED:${lockedAtIsoString}|ITEMS:[${sortedItemHashes}]`;
  return sha256(chainPayload);
}

// Generate an SVG seed image representing a real inspection photo
function createSeedSvg(itemName, category, conditionName, conditionRating, roomTitle, timestampStr) {
  const isDamaged = conditionRating <= 2;
  const isFair = conditionRating === 3;
  const isGood = conditionRating >= 4;

  const bgGradientStart = isDamaged ? '#3b2522' : isFair ? '#2e2c22' : '#1e2b25';
  const bgGradientEnd = isDamaged ? '#1c1211' : isFair ? '#191813' : '#121815';
  const accentColor = isDamaged ? '#C8412B' : isFair ? '#C27803' : '#2F5D50';
  const badgeText = isDamaged ? 'POSSIBLE DAMAGE' : isFair ? 'FAIR WEAR' : 'VERIFIED INTACT';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientStart}" />
      <stop offset="100%" stop-color="${bgGradientEnd}" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bgGrad)"/>
  <rect width="800" height="600" fill="url(#grid)"/>

  <!-- Camera HUD Crosshairs -->
  <circle cx="400" cy="300" r="140" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="380" y1="300" x2="420" y2="300" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
  <line x1="400" y1="280" x2="400" y2="320" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>

  <!-- HUD Corner Brackets -->
  <path d="M 40 70 L 40 40 L 70 40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <path d="M 760 70 L 760 40 L 730 40" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <path d="M 40 530 L 40 560 L 70 560" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <path d="M 760 530 L 760 560 L 730 560" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

  <!-- Inspection Item Visual Motif -->
  <rect x="250" y="180" width="300" height="200" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <text x="400" y="240" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.5)" text-anchor="middle" letter-spacing="2">INSPECTION TARGET</text>
  <text x="400" y="275" font-family="'IBM Plex Sans', sans-serif" font-weight="600" font-size="20" fill="#F4EFE6" text-anchor="middle">${itemName}</text>
  <text x="400" y="305" font-family="monospace" font-size="13" fill="${accentColor}" text-anchor="middle">CATEGORY: ${category.toUpperCase()}</text>
  <text x="400" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="#F4EFE6" text-anchor="middle">RATING: ${conditionRating}/5 • ${conditionName.toUpperCase()}</text>

  <!-- Tamper-evident Ledger Overlay Banner -->
  <rect x="30" y="500" width="740" height="70" rx="4" fill="rgba(10, 10, 10, 0.85)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="50" y="525" font-family="monospace" font-size="11" fill="#DCD4C4">PROPERTY: ${roomTitle}</text>
  <text x="50" y="545" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.6)">EXIF TIMESTAMP: ${timestampStr} | GPS: 18.6279° N, 73.7831° E</text>
  <text x="50" y="560" font-family="monospace" font-size="9" fill="#2F5D50">SHA-256 CRYPTO-SEALED EVIDENCE PROOF</text>

  <!-- Notary Stamp Badge on upper right -->
  <g transform="translate(620, 70) rotate(-6)">
    <rect x="-10" y="-10" width="130" height="42" rx="3" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="8 3"/>
    <text x="55" y="16" font-family="'Fraunces', serif" font-weight="bold" font-size="11" fill="${accentColor}" text-anchor="middle" letter-spacing="1">${badgeText}</text>
  </g>
</svg>`;
  return svg;
}

const CHECKLIST_ITEMS_DATA = [
  // 1. Walls and Paint
  { code: 'WP-01', category: 'Walls and Paint', name: 'Living Room Walls & Primer Coat', typicalRepairCostInr: 2800, damageHint: 'Check for heavy scuffs, peeling paint, or unauthorized dark paint', wearTolerance: 'MEDIUM', sortOrder: 1 },
  { code: 'WP-02', category: 'Walls and Paint', name: 'Bedroom Walls & Skirting', typicalRepairCostInr: 2200, damageHint: 'Check for adhesive tape residue, grease stains, or deep scratches', wearTolerance: 'MEDIUM', sortOrder: 2 },
  { code: 'WP-03', category: 'Walls and Paint', name: 'Nail Holes & Wall Plugs (Anchor Anchors)', typicalRepairCostInr: 800, damageHint: 'Count unpatched holes from photo frames or TV brackets', wearTolerance: 'LOW', sortOrder: 3 },
  { code: 'WP-04', category: 'Walls and Paint', name: 'Ceiling Joint Seams & Corners', typicalRepairCostInr: 1500, damageHint: 'Look for stress cracks, cobweb staining, or settling fissures', wearTolerance: 'HIGH', sortOrder: 4 },
  { code: 'WP-05', category: 'Walls and Paint', name: 'Balcony / Exterior Wall Coating', typicalRepairCostInr: 1800, damageHint: 'Look for water streaks, moss formation, or peeling exterior emulsion', wearTolerance: 'HIGH', sortOrder: 5 },

  // 2. Flooring
  { code: 'FL-01', category: 'Flooring', name: 'Living Room Vitrified Tiles', typicalRepairCostInr: 3500, damageHint: 'Check for chipped tile corners, hairline cracks, or deep furniture gouges', wearTolerance: 'LOW', sortOrder: 6 },
  { code: 'FL-02', category: 'Flooring', name: 'Bedroom Tile Grouting & Finish', typicalRepairCostInr: 1200, damageHint: 'Check for blackened grouting, missing filler, or loose hollow tiles', wearTolerance: 'MEDIUM', sortOrder: 7 },
  { code: 'FL-03', category: 'Flooring', name: 'Bathroom Anti-Skid Floor Tiles', typicalRepairCostInr: 2500, damageHint: 'Look for chemical acid wash discoloration or broken tile corners', wearTolerance: 'LOW', sortOrder: 8 },
  { code: 'FL-04', category: 'Flooring', name: 'Balcony Flooring & Threshold Slab', typicalRepairCostInr: 1600, damageHint: 'Check slope to drain, water pooling marks, or chipped granite slab', wearTolerance: 'MEDIUM', sortOrder: 9 },

  // 3. Ceiling
  { code: 'CL-01', category: 'Ceiling', name: 'Living Room False Ceiling & Cove', typicalRepairCostInr: 4500, damageHint: 'Look for sagging gypsum boards, water dampness, or broken cove strips', wearTolerance: 'LOW', sortOrder: 10 },
  { code: 'CL-02', category: 'Ceiling', name: 'Ceiling Fan Hooks & Canopy Ring', typicalRepairCostInr: 600, damageHint: 'Check anchor firmness and plastic canopy alignment', wearTolerance: 'HIGH', sortOrder: 11 },
  { code: 'CL-03', category: 'Ceiling', name: 'Exhaust Vent Duct & Ceiling Mesh', typicalRepairCostInr: 900, damageHint: 'Inspect for grease clogs, rusted mesh, or broken exhaust collar', wearTolerance: 'MEDIUM', sortOrder: 12 },
  { code: 'CL-04', category: 'Ceiling', name: 'Water Seepage & Damp Stains Check', typicalRepairCostInr: 5000, damageHint: 'Critical: note yellow water seepage rings from upper floor bathroom', wearTolerance: 'HIGH', sortOrder: 13 },

  // 4. Doors and Windows
  { code: 'DW-01', category: 'Doors and Windows', name: 'Main Entrance Teak/Flush Door & Polish', typicalRepairCostInr: 4000, damageHint: 'Inspect wood polish, gouges, door bottom swelling from mop water', wearTolerance: 'LOW', sortOrder: 14 },
  { code: 'DW-02', category: 'Doors and Windows', name: 'Main Door Godrej/Europa Lock & Latches', typicalRepairCostInr: 2200, damageHint: 'Test smooth deadbolt turn, latch engagement, and both keys provided', wearTolerance: 'LOW', sortOrder: 15 },
  { code: 'DW-03', category: 'Doors and Windows', name: 'Internal Bedroom Doors & Handles', typicalRepairCostInr: 1500, damageHint: 'Test mortise latch closure and inspect for kicked panels', wearTolerance: 'MEDIUM', sortOrder: 16 },
  { code: 'DW-04', category: 'Doors and Windows', name: 'Aluminium Sliding Windows & Glass Panes', typicalRepairCostInr: 2800, damageHint: 'Check sliding roller track smoothness, cracked glass, and locking clip', wearTolerance: 'MEDIUM', sortOrder: 17 },
  { code: 'DW-05', category: 'Doors and Windows', name: 'Mosquito Mesh Track & Netting', typicalRepairCostInr: 900, damageHint: 'Check for punctures, cat claw tears, or derailed mesh sash', wearTolerance: 'MEDIUM', sortOrder: 18 },
  { code: 'DW-06', category: 'Doors and Windows', name: 'Bathroom PVC / Waterproof Door', typicalRepairCostInr: 2000, damageHint: 'Inspect bottom panel rot, hinge rusting, or latch misalignment', wearTolerance: 'HIGH', sortOrder: 19 },

  // 5. Furniture
  { code: 'FN-01', category: 'Furniture', name: 'Wooden Bed Frame & Hydraulic Storage', typicalRepairCostInr: 4500, damageHint: 'Test hydraulic pump lift, inspect headboard laminates and slat integrity', wearTolerance: 'LOW', sortOrder: 20 },
  { code: 'FN-02', category: 'Furniture', name: 'Mattress Condition & Cleanliness', typicalRepairCostInr: 3500, damageHint: 'Inspect for spills, cigarette burns, sagging coils, or mold', wearTolerance: 'LOW', sortOrder: 21 },
  { code: 'FN-03', category: 'Furniture', name: 'Wardrobe Shutters, Hinges & Drawer Lock', typicalRepairCostInr: 2500, damageHint: 'Test smooth hinge swing, magnetic catches, and inner drawer sliding', wearTolerance: 'MEDIUM', sortOrder: 22 },
  { code: 'FN-04', category: 'Furniture', name: 'Study Desk, Laminate Surface & Drawer', typicalRepairCostInr: 1800, damageHint: 'Check for laptop heat blisters, cut marks, and drawer alignment', wearTolerance: 'MEDIUM', sortOrder: 23 },
  { code: 'FN-05', category: 'Furniture', name: 'Ergonomic Desk Chair / Study Chair', typicalRepairCostInr: 1600, damageHint: 'Test pneumatic height lever, caster wheels, and armrest padding', wearTolerance: 'MEDIUM', sortOrder: 24 },
  { code: 'FN-06', category: 'Furniture', name: 'Dining Table & Seating Chairs', typicalRepairCostInr: 2000, damageHint: 'Check leg wobbles, glass top scratches, and chair joints', wearTolerance: 'MEDIUM', sortOrder: 25 },

  // 6. Electrical
  { code: 'EL-01', category: 'Electrical', name: 'Modular Switches, 6A/16A Sockets & Faceplates', typicalRepairCostInr: 1100, damageHint: 'Test socket power with phone charger, inspect cracked switch plates', wearTolerance: 'LOW', sortOrder: 26 },
  { code: 'EL-02', category: 'Electrical', name: 'Ceiling Fans & Speed Regulators', typicalRepairCostInr: 1400, damageHint: 'Test all 5 speeds, listen for motor humming or loose wobble', wearTolerance: 'HIGH', sortOrder: 27 },
  { code: 'EL-03', category: 'Electrical', name: 'LED Tube Lights & Batten Fixtures', typicalRepairCostInr: 750, damageHint: 'Verify all tubes ignite immediately without flickering', wearTolerance: 'HIGH', sortOrder: 28 },
  { code: 'EL-04', category: 'Electrical', name: 'MCB Distribution Board & ELCB Trip Test', typicalRepairCostInr: 2400, damageHint: 'Check for burnt breaker smells, labeled circuits, and proper cover', wearTolerance: 'LOW', sortOrder: 29 },
  { code: 'EL-05', category: 'Electrical', name: 'Geyser Heavy Load Power Point & Isolator', typicalRepairCostInr: 950, damageHint: 'Look for blackened socket holes or melted plug pins', wearTolerance: 'LOW', sortOrder: 30 },
  { code: 'EL-06', category: 'Electrical', name: 'AC Power Point & Drain Outlet Conduit', typicalRepairCostInr: 1300, damageHint: 'Ensure 25A socket is intact and outdoor pipe sleeve is sealed', wearTolerance: 'MEDIUM', sortOrder: 31 },

  // 7. Bathroom
  { code: 'BA-01', category: 'Bathroom', name: 'Western Commode, Seat Cover & Dual Flush', typicalRepairCostInr: 3200, damageHint: 'Test flush valve refill, inspect ceramic bowl cracks, and hinge tightness', wearTolerance: 'LOW', sortOrder: 32 },
  { code: 'BA-02', category: 'Bathroom', name: 'Health Faucet, Flexible Hose & Angle Cock', typicalRepairCostInr: 850, damageHint: 'Check spray trigger leak, pinhole leaks in steel hose', wearTolerance: 'MEDIUM', sortOrder: 33 },
  { code: 'BA-03', category: 'Bathroom', name: 'Wash Basin, CP Tap & Pop-Up Waste Plug', typicalRepairCostInr: 1900, damageHint: 'Check under-basin waste coupling leak and tap chrome pitting', wearTolerance: 'MEDIUM', sortOrder: 34 },
  { code: 'BA-04', category: 'Bathroom', name: 'Overhead Shower Head & Mixer Diverter', typicalRepairCostInr: 2100, damageHint: 'Test hot/cold diverter lever and clear shower spray holes', wearTolerance: 'MEDIUM', sortOrder: 35 },
  { code: 'BA-05', category: 'Bathroom', name: 'Bathroom Mirror & Beveled Glass Shelf', typicalRepairCostInr: 1200, damageHint: 'Inspect silvering desilvering around edges and secure brackets', wearTolerance: 'LOW', sortOrder: 36 },

  // 8. Kitchen/Balcony
  { code: 'KB-01', category: 'Kitchen/Balcony', name: 'Granite Platform Slab & Sink Sealant', typicalRepairCostInr: 3800, damageHint: 'Look for chips around the gas stove cutout and sink silicone mold', wearTolerance: 'LOW', sortOrder: 37 },
  { code: 'KB-02', category: 'Kitchen/Balcony', name: 'Stainless Steel Sink & Waste Coupling', typicalRepairCostInr: 1800, damageHint: 'Inspect for deep dents, rust stains, or slow drainage', wearTolerance: 'MEDIUM', sortOrder: 38 },
  { code: 'KB-03', category: 'Kitchen/Balcony', name: 'Under-Sink Cabinet & Water-Resistant Ply', typicalRepairCostInr: 2600, damageHint: 'Inspect for termite mud lines, water swelling, or loose hinges', wearTolerance: 'MEDIUM', sortOrder: 39 },

  // 9. Safety
  { code: 'SF-01', category: 'Safety', name: 'Safety Door / MS Grill Gate & Deadbolt', typicalRepairCostInr: 2500, damageHint: 'Verify secondary security gate lock, hinges, and peephole clarity', wearTolerance: 'LOW', sortOrder: 40 },
];

const ROOMS_DATA = [
  // 1. Akurdi - Student PG near DY Patil
  {
    title: 'Akurdi Sector 26 PG Room (Twin Share)',
    propertyType: 'Single PG Room',
    address: 'Flat 203, Nilgiri Heights, Near DY Patil College, Sector 26, Pradhikaran',
    area: 'Akurdi',
    city: 'Pune / PCMC',
    pincode: '411044',
    monthlyRent: 8500,
    securityDeposit: 25000,
    leaseStartDate: new Date('2023-08-01'),
    leaseEndDate: new Date('2024-05-31'),
    landlordName: 'Suresh Patil',
    landlordPhone: '+91 98220 11442',
    landlordEmail: 'suresh.patil.pune@gmail.com',
    status: 'COMPARED',
    hasMoveOut: true,
  },
  // 2. Wakad - 1BHK Flat
  {
    title: 'Wakad Datta Mandir Road 1BHK',
    propertyType: '1BHK Flat',
    address: 'B-402, Shivam Enclave, Datta Mandir Road',
    area: 'Wakad',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 19000,
    securityDeposit: 50000,
    leaseStartDate: new Date('2023-11-01'),
    leaseEndDate: new Date('2024-10-31'),
    landlordName: 'Mahesh Deshmukh',
    landlordPhone: '+91 94223 88190',
    landlordEmail: 'deshmukh.properties@outlook.com',
    status: 'COMPARED',
    hasMoveOut: true,
  },
  // 3. Hinjewadi Phase 1 - 2BHK Shared Flat
  {
    title: 'Hinjewadi Phase 1 Techie Flat (Room A)',
    propertyType: '2BHK Shared Flat',
    address: 'Tower 7, Apt 1104, Blue Ridge Township',
    area: 'Hinjewadi',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 16500,
    securityDeposit: 45000,
    leaseStartDate: new Date('2024-01-15'),
    leaseEndDate: new Date('2025-01-14'),
    landlordName: 'Anand Kulkarni',
    landlordPhone: '+91 98812 33451',
    landlordEmail: 'anand.kulkarni.it@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 4. Nigdi Pradhikaran - Furnished Studio
  {
    title: 'Nigdi Pradhikaran Studio Penthouse',
    propertyType: 'Studio Apartment',
    address: 'Row House 14, Sector 24, Near Madhukar Pavale Chowk',
    area: 'Nigdi',
    city: 'Pune / PCMC',
    pincode: '411044',
    monthlyRent: 14000,
    securityDeposit: 40000,
    leaseStartDate: new Date('2023-06-01'),
    leaseEndDate: new Date('2024-05-31'),
    landlordName: 'Rameshwar Shinde',
    landlordPhone: '+91 98901 77622',
    landlordEmail: 'shinde.rameshwar@rediffmail.com',
    status: 'SETTLED',
    hasMoveOut: true,
  },
  // 5. Chinchwad Station - 1RK Flat
  {
    title: 'Chinchwad Moraya Gosavi 1RK',
    propertyType: '1RK Flat',
    address: 'Flat 102, Ganesh Krupa Bldg, Near Moraya Mandir',
    area: 'Chinchwad',
    city: 'Pune / PCMC',
    pincode: '411033',
    monthlyRent: 9500,
    securityDeposit: 25000,
    leaseStartDate: new Date('2024-02-01'),
    leaseEndDate: new Date('2025-01-31'),
    landlordName: 'Prakash Kadam',
    landlordPhone: '+91 97654 32189',
    landlordEmail: 'pkadam.chinchwad@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 6. Kothrud - Student Single Room near MIT
  {
    title: 'Kothrud Ideal Colony Single Room',
    propertyType: 'Single PG Room',
    address: 'Flat 3, Snehal Apartment, Paud Road, Ideal Colony',
    area: 'Kothrud',
    city: 'Pune / PCMC',
    pincode: '411038',
    monthlyRent: 11000,
    securityDeposit: 30000,
    leaseStartDate: new Date('2023-09-01'),
    leaseEndDate: new Date('2024-08-31'),
    landlordName: 'Sunita Joshi',
    landlordPhone: '+91 98230 45671',
    landlordEmail: 'sunita.joshi.pune@yahoo.com',
    status: 'COMPARED',
    hasMoveOut: true,
  },
  // 7. Hinjewadi Phase 3 - Megapolis Studio
  {
    title: 'Hinjewadi Megapolis Mystic Studio',
    propertyType: 'Studio Apartment',
    address: 'Mystic Tower 3, Flat 905, Megapolis Township, Phase 3',
    area: 'Hinjewadi',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 15000,
    securityDeposit: 40000,
    leaseStartDate: new Date('2024-03-01'),
    leaseEndDate: new Date('2025-02-28'),
    landlordName: 'Vikas Jagtap',
    landlordPhone: '+91 99224 81093',
    landlordEmail: 'vikas.jagtap@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 8. Wakad Bhumkar Chowk - 2BHK Room B
  {
    title: 'Wakad Kasturi Apex 2BHK (Master Bedroom)',
    propertyType: '2BHK Shared Flat',
    address: 'Flat 604, Kasturi Apex, Near Bhumkar Chowk',
    area: 'Wakad',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 17500,
    securityDeposit: 50000,
    leaseStartDate: new Date('2023-10-15'),
    leaseEndDate: new Date('2024-09-30'),
    landlordName: 'Deepak More',
    landlordPhone: '+91 98500 12984',
    landlordEmail: 'deepakmore_pune@gmail.com',
    status: 'COMPARED',
    hasMoveOut: true,
  },
  // 9. Akurdi Railway Station - 1BHK Flat
  {
    title: 'Akurdi Station Road 1BHK',
    propertyType: '1BHK Flat',
    address: 'B-12, Sai Sadan, Opposite Akurdi Railway Station',
    area: 'Akurdi',
    city: 'Pune / PCMC',
    pincode: '411044',
    monthlyRent: 12500,
    securityDeposit: 35000,
    leaseStartDate: new Date('2024-04-01'),
    leaseEndDate: new Date('2025-03-31'),
    landlordName: 'Nitin Bhalerao',
    landlordPhone: '+91 97300 45612',
    landlordEmail: 'bhalerao.nitin@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 10. Chinchwad Auto Cluster - 1BHK
  {
    title: 'Chinchwad Empire Estate 1BHK',
    propertyType: '1BHK Flat',
    address: 'Tower A1, Flat 802, Empire Estate, Old Mumbai-Pune Highway',
    area: 'Chinchwad',
    city: 'Pune / PCMC',
    pincode: '411019',
    monthlyRent: 16000,
    securityDeposit: 45000,
    leaseStartDate: new Date('2023-07-01'),
    leaseEndDate: new Date('2024-06-30'),
    landlordName: 'Gajanan Pawar',
    landlordPhone: '+91 94220 89012',
    landlordEmail: 'gpawar.chinchwad@gmail.com',
    status: 'COMPARED',
    hasMoveOut: true,
  },
  // 11. Kothrud Karve Nagar - PG Twin Sharing
  {
    title: 'Karve Nagar Cozy Twin Room',
    propertyType: 'Single PG Room',
    address: 'Flat 101, Omkar Residency, Near Cummins College, Karve Nagar',
    area: 'Kothrud',
    city: 'Pune / PCMC',
    pincode: '411052',
    monthlyRent: 9000,
    securityDeposit: 20000,
    leaseStartDate: new Date('2024-06-01'),
    leaseEndDate: new Date('2025-05-31'),
    landlordName: 'Archana Gadgil',
    landlordPhone: '+91 98814 55670',
    landlordEmail: 'gadgil.archana@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 12. Nigdi Yamuna Nagar - 1BHK
  {
    title: 'Nigdi Yamuna Nagar 1BHK Flat',
    propertyType: '1BHK Flat',
    address: 'Building 18, Flat 6, Sector 21, Yamuna Nagar',
    area: 'Nigdi',
    city: 'Pune / PCMC',
    pincode: '411044',
    monthlyRent: 11500,
    securityDeposit: 30000,
    leaseStartDate: new Date('2024-07-01'),
    leaseEndDate: new Date('2025-06-30'),
    landlordName: 'Sambhaji Gaikwad',
    landlordPhone: '+91 98223 99014',
    landlordEmail: 'sgaikwad.nigdi@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 13. Wakad Pink City Road - Furnished Studio
  {
    title: 'Wakad Pink City Road Studio',
    propertyType: 'Studio Apartment',
    address: 'Apt 301, Royal Palms, Pink City Road',
    area: 'Wakad',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 15500,
    securityDeposit: 40000,
    leaseStartDate: new Date('2024-08-01'),
    leaseEndDate: new Date('2025-07-31'),
    landlordName: 'Rajendra Thorat',
    landlordPhone: '+91 98904 12389',
    landlordEmail: 'thorat.properties@yahoo.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 14. Hinjewadi Phase 2 - Quad sharing flat
  {
    title: 'Hinjewadi Phase 2 IT PG (Deluxe AC)',
    propertyType: 'Single PG Room',
    address: 'Room 304, Green Nest Luxury Living, Behind Cognizant, Phase 2',
    area: 'Hinjewadi',
    city: 'Pune / PCMC',
    pincode: '411057',
    monthlyRent: 10500,
    securityDeposit: 25000,
    leaseStartDate: new Date('2024-09-01'),
    leaseEndDate: new Date('2025-08-31'),
    landlordName: 'Ashok Chavan',
    landlordPhone: '+91 97631 88410',
    landlordEmail: 'ashok.chavan.pg@gmail.com',
    status: 'LOCKED',
    hasMoveOut: false,
  },
  // 15. Akurdi Gurudwara Road - 2BHK Room
  {
    title: 'Akurdi Gurudwara Colony 2BHK (Shared)',
    propertyType: '2BHK Shared Flat',
    address: 'Flat 501, Gurukripa Complex, Near Akurdi Gurudwara',
    area: 'Akurdi',
    city: 'Pune / PCMC',
    pincode: '411044',
    monthlyRent: 13000,
    securityDeposit: 35000,
    leaseStartDate: new Date('2024-09-15'),
    leaseEndDate: new Date('2025-09-14'),
    landlordName: 'Harpreet Singh',
    landlordPhone: '+91 98225 66712',
    landlordEmail: 'harpreet.akurdi@gmail.com',
    status: 'MOVE_IN_PENDING',
    hasMoveOut: false,
  },
];

const TENANT_SURVEY_DATA = [
  { tenantName: 'Aditya Ranade', cityArea: 'Hinjewadi', propertyType: '1BHK Flat', depositPaid: 45000, depositDeducted: 18000, deductionReason: 'Full house repainting charge despite minor scuffs', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 12 },
  { tenantName: 'Sneha Kulkarni', cityArea: 'Akurdi', propertyType: 'Single PG Room', depositPaid: 20000, depositDeducted: 8000, deductionReason: 'Mattress replacement & cleaning fees', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 10 },
  { tenantName: 'Pranav Joshi', cityArea: 'Wakad', propertyType: '2BHK Shared Flat', depositPaid: 50000, depositDeducted: 3500, deductionReason: 'Broken wash basin mirror, fair replacement', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 4, rentTenancyMonths: 14 },
  { tenantName: 'Neha Deshmukh', cityArea: 'Kothrud', propertyType: '1RK Flat', depositPaid: 25000, depositDeducted: 0, deductionReason: 'Full refund after showing move-in checklist with stamps', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 11 },
  { tenantName: 'Rohan Sharma', cityArea: 'Hinjewadi', propertyType: '2BHK Shared Flat', depositPaid: 40000, depositDeducted: 16000, deductionReason: 'Unspecified deep cleaning and AC servicing bill', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 2, rentTenancyMonths: 12 },
  { tenantName: 'Tanvi Bhosale', cityArea: 'Nigdi', propertyType: '1BHK Flat', depositPaid: 30000, depositDeducted: 2000, deductionReason: 'Agreed kitchen tap repair, landlord waived painting', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 5, rentTenancyMonths: 24 },
  { tenantName: 'Kunal Verma', cityArea: 'Chinchwad', propertyType: '1BHK Flat', depositPaid: 35000, depositDeducted: 12000, deductionReason: 'Tile scratch claimed near balcony, was pre-existing', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 11 },
  { tenantName: 'Ananya Iyer', cityArea: 'Wakad', propertyType: '1BHK Flat', depositPaid: 50000, depositDeducted: 0, deductionReason: 'Landlord accepted move-in photos showing pre-existing marks', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 12 },
  { tenantName: 'Vikram Shinde', cityArea: 'Akurdi', propertyType: 'Single PG Room', depositPaid: 25000, depositDeducted: 11000, deductionReason: 'PG warden deducted arbitrary maintenance penalty', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 9 },
  { tenantName: 'Pooja Agarwal', cityArea: 'Hinjewadi', propertyType: 'Studio Apartment', depositPaid: 40000, depositDeducted: 4500, deductionReason: 'Curtain rod detachment, settled fairly', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 4, rentTenancyMonths: 15 },
  { tenantName: 'Saurabh Muley', cityArea: 'Kothrud', propertyType: 'Single PG Room', depositPaid: 30000, depositDeducted: 14000, deductionReason: 'Ceiling fan noise and switchboard replacement claim', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 11 },
  { tenantName: 'Megha Patil', cityArea: 'Chinchwad', propertyType: '1BHK Flat', depositPaid: 32000, depositDeducted: 1500, deductionReason: 'One door latch repair, rest refunded on day of key handover', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 13 },
  { tenantName: 'Arjun Nair', cityArea: 'Wakad', propertyType: '2BHK Shared Flat', depositPaid: 45000, depositDeducted: 22000, deductionReason: 'Landlord refused to return deposit citing delayed notice', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 12 },
  { tenantName: 'Divya Khurana', cityArea: 'Hinjewadi', propertyType: '1BHK Flat', depositPaid: 42000, depositDeducted: 0, deductionReason: 'Timestamped move-in report presented, full ₹42,000 returned', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 12 },
  { tenantName: 'Harshwardhan More', cityArea: 'Nigdi', propertyType: 'Studio Apartment', depositPaid: 35000, depositDeducted: 8500, deductionReason: 'Bathroom geyser electrical issue', hadPhotoProof: false, disputeOutcome: 'Partial Recovery', satisfactionScore: 3, rentTenancyMonths: 18 },
  { tenantName: 'Pallavi Rao', cityArea: 'Akurdi', propertyType: 'Single PG Room', depositPaid: 22000, depositDeducted: 0, deductionReason: 'Deposit returned via UPI within 24 hours with digital proof', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 10 },
  { tenantName: 'Girish Kulkarni', cityArea: 'Kothrud', propertyType: '1BHK Flat', depositPaid: 38000, depositDeducted: 15000, deductionReason: 'Wooden wardrobe hinge looseness charged as full shutter rebuild', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 12 },
  { tenantName: 'Radhika Sane', cityArea: 'Wakad', propertyType: '1BHK Flat', depositPaid: 48000, depositDeducted: 2500, deductionReason: 'Repaired one damaged window mesh net', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 4, rentTenancyMonths: 16 },
  { tenantName: 'Naveen Reddy', cityArea: 'Hinjewadi', propertyType: '2BHK Shared Flat', depositPaid: 44000, depositDeducted: 19000, deductionReason: 'Unfair ₹19,000 deduction for wall touchups and balcony cleaning', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 12 },
  { tenantName: 'Isha Pandit', cityArea: 'Chinchwad', propertyType: '1RK Flat', depositPaid: 24000, depositDeducted: 0, deductionReason: 'Complete refund without deduction', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 8 },
  { tenantName: 'Abhishek Tambe', cityArea: 'Nigdi', propertyType: '1BHK Flat', depositPaid: 28000, depositDeducted: 9000, deductionReason: 'Plumbing leak in kitchen sink blamed on tenant', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 2, rentTenancyMonths: 14 },
  { tenantName: 'Mansi Shah', cityArea: 'Wakad', propertyType: '2BHK Shared Flat', depositPaid: 46000, depositDeducted: 1800, deductionReason: 'Tube light fixtures replaced', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 12 },
  { tenantName: 'Sanket Jadhav', cityArea: 'Akurdi', propertyType: 'Single PG Room', depositPaid: 21000, depositDeducted: 7500, deductionReason: 'Bed wood scratch deduction', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 10 },
  { tenantName: 'Shruti Kamat', cityArea: 'Kothrud', propertyType: 'Single PG Room', depositPaid: 32000, depositDeducted: 0, deductionReason: 'Detailed move-in PDF locked on cloud helped resolve instantly', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 12 },
  { tenantName: 'Varun Chitale', cityArea: 'Hinjewadi', propertyType: '1BHK Flat', depositPaid: 48000, depositDeducted: 20000, deductionReason: 'Landlord claimed total repainting is standard mandatory deduction', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 11 },
  { tenantName: 'Tejaswini Dixit', cityArea: 'Wakad', propertyType: 'Studio Apartment', depositPaid: 36000, depositDeducted: 3000, deductionReason: 'Agreed minor tap repair', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 4, rentTenancyMonths: 13 },
  { tenantName: 'Amol Borse', cityArea: 'Chinchwad', propertyType: '1BHK Flat', depositPaid: 30000, depositDeducted: 11500, deductionReason: 'Window glass crack disputed but tenant had no move-in photo', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 2, rentTenancyMonths: 12 },
  { tenantName: 'Ritu Sen', cityArea: 'Hinjewadi', propertyType: '2BHK Shared Flat', depositPaid: 42000, depositDeducted: 0, deductionReason: 'Verified condition ledger shared with landlord on move-out day', hadPhotoProof: true, disputeOutcome: 'Full Refund', satisfactionScore: 5, rentTenancyMonths: 12 },
  { tenantName: 'Dhananjay Phadke', cityArea: 'Nigdi', propertyType: '1BHK Flat', depositPaid: 26000, depositDeducted: 8000, deductionReason: 'Painting deduction deducted automatically from deposit check', hadPhotoProof: false, disputeOutcome: 'Full Loss', satisfactionScore: 1, rentTenancyMonths: 12 },
  { tenantName: 'Kavita Mutha', cityArea: 'Akurdi', propertyType: 'Single PG Room', depositPaid: 24000, depositDeducted: 1200, deductionReason: 'Key replacement charge for duplicate locker key', hadPhotoProof: true, disputeOutcome: 'Partial Recovery', satisfactionScore: 5, rentTenancyMonths: 10 },
];

async function main() {
  const existingUsers = await prisma.user.count().catch(() => 0);
  if (existingUsers > 0 && !process.env.FORCE_SEED) {
    console.log(`Database already contains ${existingUsers} user(s). Skipping seed.`);
    return;
  }

  console.log('🧹 Clearing existing database records...');
  await prisma.evidencePhoto.deleteMany();
  await prisma.inspectionItemRecord.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.room.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.tenantSurveyResponse.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating demo user (demo@depositlocker.com / demo123)...');
  const passwordHash = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@depositlocker.com',
      passwordHash,
      name: 'Rohan Sharma',
      phone: '+91 98231 45092',
      preferredLanguage: 'en',
    },
  });

  console.log('📋 Seeding 40 standard checklist items...');
  const checklistMap = new Map();
  for (const item of CHECKLIST_ITEMS_DATA) {
    const created = await prisma.checklistItem.create({
      data: item,
    });
    checklistMap.set(item.code, created);
  }

  console.log('📊 Seeding 30 tenant survey responses for Insights...');
  for (const survey of TENANT_SURVEY_DATA) {
    await prisma.tenantSurveyResponse.create({
      data: survey,
    });
  }

  // Ensure public/seed-images directory exists
  const seedImagesDir = path.join(process.cwd(), 'public', 'seed-images');
  if (!fs.existsSync(seedImagesDir)) {
    fs.mkdirSync(seedImagesDir, { recursive: true });
  }

  console.log('🏠 Seeding 15 realistic sample rooms in Pune / PCMC with reports & evidence photos...');

  const conditionNames = {
    1: 'Damaged',
    2: 'Poor',
    3: 'Fair',
    4: 'Good',
    5: 'Like New',
  };

  const checklistCodes = CHECKLIST_ITEMS_DATA.map((i) => i.code);

  for (let idx = 0; idx < ROOMS_DATA.length; idx++) {
    const roomInfo = ROOMS_DATA[idx];
    const room = await prisma.room.create({
      data: {
        userId: demoUser.id,
        title: roomInfo.title,
        propertyType: roomInfo.propertyType,
        address: roomInfo.address,
        area: roomInfo.area,
        city: roomInfo.city,
        pincode: roomInfo.pincode,
        monthlyRent: roomInfo.monthlyRent,
        securityDeposit: roomInfo.securityDeposit,
        leaseStartDate: roomInfo.leaseStartDate,
        leaseEndDate: roomInfo.leaseEndDate,
        landlordName: roomInfo.landlordName,
        landlordPhone: roomInfo.landlordPhone,
        landlordEmail: roomInfo.landlordEmail,
        status: roomInfo.status,
      },
    });

    if (roomInfo.status === 'MOVE_IN_PENDING') {
      // Room 15 has no locked report yet, ready for move-in walkthrough
      continue;
    }

    // 1. Create Move-In Report
    const moveInReportNumber = `DL-IN-${roomInfo.area.substring(0, 3).toUpperCase()}-${2023 + (idx % 2)}-${String(100 + idx).padStart(4, '0')}`;
    const moveInReport = await prisma.inspectionReport.create({
      data: {
        roomId: room.id,
        type: 'MOVE_IN',
        status: 'LOCKED',
        reportNumber: moveInReportNumber,
        lockedAt: roomInfo.leaseStartDate,
        completedAt: roomInfo.leaseStartDate,
        tenantSignature: 'Rohan Sharma',
        landlordSignature: roomInfo.landlordName,
        landlordAcknowledgedAt: new Date(roomInfo.leaseStartDate.getTime() + 86400000 * 2),
        landlordName: roomInfo.landlordName,
        landlordPhone: roomInfo.landlordPhone,
        landlordStatus: 'ACKNOWLEDGED',
        landlordNotes: 'Acknowledged move-in condition on lease signing.',
      },
    });

    // Populate move-in item records
    // We select 10 to 14 representative checklist items per room for high realism
    const selectedItemCodes = checklistCodes.filter((_, cIdx) => (cIdx + idx) % 3 === 0 || cIdx < 5);
    const moveInItemHashes = [];

    for (let itemIdx = 0; itemIdx < selectedItemCodes.length; itemIdx++) {
      const code = selectedItemCodes[itemIdx];
      const checkItem = checklistMap.get(code);

      // Realistic condition distribution:
      // Most items 4 or 5 at move-in. Occasionally 2 or 3 (pre-existing wear!)
      let moveInRating = 5;
      if (itemIdx === 2) moveInRating = 4;
      if (itemIdx === 4 && idx % 2 === 0) moveInRating = 2; // Pre-existing scuff / crack
      if (itemIdx === 6) moveInRating = 3; // Fair wear

      const itemRecord = await prisma.inspectionItemRecord.create({
        data: {
          reportId: moveInReport.id,
          checklistItemId: checkItem.id,
          conditionRating: moveInRating,
          notes: moveInRating <= 2
            ? `Pre-existing wear observed on key handover: ${checkItem.damageHint}`
            : `Inspected and found clean and fully functional.`,
          status: moveInRating <= 2 ? 'PRE_EXISTING' : 'INTACT',
        },
      });

      // Generate seed photo
      const photoFileName = `photo-in-${room.id.substring(0, 6)}-${code}.svg`;
      const photoFilePath = path.join(seedImagesDir, photoFileName);
      const timestampStr = new Date(roomInfo.leaseStartDate.getTime() + itemIdx * 120000).toISOString();
      const svgContent = createSeedSvg(
        checkItem.name,
        checkItem.category,
        conditionNames[moveInRating],
        moveInRating,
        room.title,
        timestampStr
      );
      fs.writeFileSync(photoFilePath, svgContent);

      const photoHash = sha256(svgContent);
      // Compute per-item hash using same algorithm as src/lib/crypto.ts
      const moveInStatus = moveInRating <= 2 ? 'PRE_EXISTING' : 'INTACT';
      const moveInItemHash = computeItemHash(itemRecord.id, moveInRating, moveInStatus, [photoHash]);
      moveInItemHashes.push(moveInItemHash);

      await prisma.evidencePhoto.create({
        data: {
          itemRecordId: itemRecord.id,
          fileUrl: `/seed-images/${photoFileName}`,
          sha256Hash: photoHash,
          serverTimestamp: new Date(roomInfo.leaseStartDate.getTime() + itemIdx * 120000),
          exifCaptureDate: new Date(roomInfo.leaseStartDate.getTime() + itemIdx * 120000),
          exifGpsLat: 18.6279 + (idx * 0.005),
          exifGpsLng: 73.7831 + (idx * 0.005),
          fileSize: svgContent.length,
          mimeType: 'image/svg+xml',
        },
      });
    }

    // Compute chained hash for move-in report (matching computeReportChainedHash in crypto.ts)
    const chainedMoveInHash = computeReportChainedHash(
      moveInReport.reportNumber,
      moveInReport.lockedAt.toISOString(),
      moveInItemHashes
    );
    await prisma.inspectionReport.update({
      where: { id: moveInReport.id },
      data: { chainedHash: chainedMoveInHash },
    });

    // 2. For rooms with move-out (6 rooms): create move-out report & comparison items
    if (roomInfo.hasMoveOut) {
      const moveOutReportNumber = `DL-OUT-${roomInfo.area.substring(0, 3).toUpperCase()}-${2024}-${String(200 + idx).padStart(4, '0')}`;
      const moveOutReport = await prisma.inspectionReport.create({
        data: {
          roomId: room.id,
          type: 'MOVE_OUT',
          status: 'LOCKED',
          reportNumber: moveOutReportNumber,
          lockedAt: roomInfo.leaseEndDate,
          completedAt: roomInfo.leaseEndDate,
          tenantSignature: 'Rohan Sharma',
          landlordSignature: roomInfo.status === 'SETTLED' ? roomInfo.landlordName : null,
          landlordAcknowledgedAt: roomInfo.status === 'SETTLED' ? roomInfo.leaseEndDate : null,
          landlordName: roomInfo.landlordName,
          landlordPhone: roomInfo.landlordPhone,
          landlordStatus: roomInfo.status === 'SETTLED' ? 'ACKNOWLEDGED' : 'PENDING',
        },
      });

      const moveOutItemHashes = [];

      for (let itemIdx = 0; itemIdx < selectedItemCodes.length; itemIdx++) {
        const code = selectedItemCodes[itemIdx];
        const checkItem = checklistMap.get(code);

        // Fetch move-in record for this item to calculate realistic diff
        const moveInItem = await prisma.inspectionItemRecord.findFirst({
          where: { reportId: moveInReport.id, checklistItemId: checkItem.id },
        });

        const inRating = moveInItem ? moveInItem.conditionRating : 5;
        let outRating = inRating;
        let diffStatus = 'INTACT';
        let deduction = 0;

        if (inRating <= 2) {
          // Pre-existing item! Even if it stays 2 or 1, tenant is PROTECTED
          outRating = inRating;
          diffStatus = 'PRE_EXISTING';
          deduction = 0;
        } else if (itemIdx === 0 && idx % 2 === 0) {
          // Possible damage: Drop of 2 or more (e.g. 5 -> 3, or 5 -> 2)
          outRating = 2; // Damaged
          diffStatus = 'POSSIBLE_DAMAGE';
          // Tenancy depreciation: 1 year occupancy out of 3 years useful life -> 70% residual cost
          deduction = Math.round(checkItem.typicalRepairCostInr * 0.7);
        } else if (itemIdx === 1) {
          // Normal wear and tear: Drop of 1 (e.g. 5 -> 4 or 4 -> 3)
          outRating = inRating - 1;
          diffStatus = 'NORMAL_WEAR';
          deduction = 0; // ₹0 for normal wear
        } else {
          outRating = inRating;
          diffStatus = 'INTACT';
          deduction = 0;
        }

        const outRecord = await prisma.inspectionItemRecord.create({
          data: {
            reportId: moveOutReport.id,
            checklistItemId: checkItem.id,
            conditionRating: outRating,
            notes: diffStatus === 'POSSIBLE_DAMAGE'
              ? `Inspection at vacate showed new damage: ${checkItem.damageHint}. Depreciated deduction calculated.`
              : diffStatus === 'PRE_EXISTING'
              ? `Pre-existing condition documented at move-in. Zero tenant deduction as per Model Tenancy Act.`
              : diffStatus === 'NORMAL_WEAR'
              ? `Minor surface wear consistent with standard 12-month domestic tenancy.`
              : `Handed back in identical condition.`,
            status: diffStatus,
            estimatedDeduction: deduction,
          },
        });

        // Generate move-out seed photo
        const photoFileName = `photo-out-${room.id.substring(0, 6)}-${code}.svg`;
        const photoFilePath = path.join(seedImagesDir, photoFileName);
        const timestampStr = new Date(roomInfo.leaseEndDate.getTime() + itemIdx * 120000).toISOString();
        const svgContent = createSeedSvg(
          checkItem.name,
          checkItem.category,
          conditionNames[outRating],
          outRating,
          `${room.title} (Move-Out)`,
          timestampStr
        );
        fs.writeFileSync(photoFilePath, svgContent);

        const photoHash = sha256(svgContent);
        // Compute per-item hash matching src/lib/crypto.ts
        const moveOutItemHash = computeItemHash(outRecord.id, outRating, diffStatus, [photoHash]);
        moveOutItemHashes.push(moveOutItemHash);

        await prisma.evidencePhoto.create({
          data: {
            itemRecordId: outRecord.id,
            fileUrl: `/seed-images/${photoFileName}`,
            sha256Hash: photoHash,
            serverTimestamp: new Date(roomInfo.leaseEndDate.getTime() + itemIdx * 120000),
            exifCaptureDate: new Date(roomInfo.leaseEndDate.getTime() + itemIdx * 120000),
            exifGpsLat: 18.6279 + (idx * 0.005),
            exifGpsLng: 73.7831 + (idx * 0.005),
            fileSize: svgContent.length,
            mimeType: 'image/svg+xml',
          },
        });
      }

      // Compute chained hash for move-out report (matching computeReportChainedHash in crypto.ts)
      const chainedMoveOutHash = computeReportChainedHash(
        moveOutReport.reportNumber,
        moveOutReport.lockedAt.toISOString(),
        moveOutItemHashes
      );
      await prisma.inspectionReport.update({
        where: { id: moveOutReport.id },
        data: { chainedHash: chainedMoveOutHash },
      });
    }
  }

  // Seed sample in-app notifications
  console.log('🔔 Creating demo notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Report Cryptographically Locked',
        message: 'Move-in inspection for Akurdi Sector 26 PG Room sealed with SHA-256 chain.',
        type: 'LOCK',
        isRead: false,
        linkUrl: '/dashboard',
      },
      {
        userId: demoUser.id,
        title: 'Landlord Acknowledged Move-In Proof',
        message: 'Suresh Patil reviewed and digitally acknowledged the move-in inspection certificate.',
        type: 'ACKNOWLEDGMENT',
        isRead: false,
        linkUrl: '/dashboard',
      },
      {
        userId: demoUser.id,
        title: 'Move-Out Inspection Due Soon',
        message: 'Lease for Hinjewadi Megapolis Studio expires in 14 days. Schedule your walkthrough.',
        type: 'REMINDER',
        isRead: true,
        linkUrl: '/dashboard',
      },
      {
        userId: demoUser.id,
        title: 'Comparison Engine Ready',
        message: 'Move-in vs Move-out comparison for Wakad Datta Mandir Road 1BHK has calculated ₹0 unfair deduction.',
        type: 'COMPARISON',
        isRead: false,
        linkUrl: '/dashboard',
      },
    ],
  });

  console.log('✅ Database successfully seeded with full DepositLocker dataset!');
  console.log('Demo Credentials: demo@depositlocker.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
