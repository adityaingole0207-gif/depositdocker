interface DepreciationResult {
  grossCost: number;
  fairDeduction: number;
  depreciationPercent: number;
  tenancyMonths: number;
  usefulLifeMonths: number;
  explanation: string;
}

const CATEGORY_LIFESPAN_MONTHS: Record<string, number> = {
  'Walls and Paint': 36, // 3 years standard repainting cycle
  'Flooring': 120,       // 10 years vitrified tiles
  'Ceiling': 60,         // 5 years false ceiling
  'Doors and Windows': 84, // 7 years timber / aluminium
  'Furniture': 60,       // 5 years wooden beds, wardrobes
  'Electrical': 60,      // 5 years switches, fans
  'Bathroom': 60,        // 5 years CP fittings, commodes
  'Kitchen/Balcony': 84, // 7 years granite counters, sinks
  'Safety': 84,          // 7 years safety doors, grills
};

export function calculateFairDeduction(
  category: string,
  typicalRepairCost: number,
  leaseStartDate: Date | string,
  leaseEndDate: Date | string
): DepreciationResult {
  const start = new Date(leaseStartDate).getTime();
  const end = new Date(leaseEndDate).getTime();
  const durationMs = Math.max(0, end - start);
  const tenancyMonths = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24 * 30.4375)));

  const usefulLifeMonths = CATEGORY_LIFESPAN_MONTHS[category] || 60;

  // Depreciation formula:
  // Age ratio = tenancyMonths / usefulLifeMonths
  // Capped at max 75% depreciation (salvage floor 25%)
  const rawDepreciation = Math.min(0.75, Math.max(0.1, tenancyMonths / usefulLifeMonths));
  const residualRatio = 1 - rawDepreciation;

  const fairDeduction = Math.round(typicalRepairCost * residualRatio);
  const depreciationPercent = Math.round(rawDepreciation * 100);

  return {
    grossCost: typicalRepairCost,
    fairDeduction,
    depreciationPercent,
    tenancyMonths,
    usefulLifeMonths,
    explanation: `${tenancyMonths} months tenancy out of ${usefulLifeMonths} months useful life applies a ${depreciationPercent}% depreciation credit. Tenant pays fair residual portion of ₹${fairDeduction.toLocaleString('en-IN')} rather than new replacement cost of ₹${typicalRepairCost.toLocaleString('en-IN')}.`,
  };
}
