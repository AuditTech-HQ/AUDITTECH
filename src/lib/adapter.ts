import type {
  BillingPeriod,
  CommercialStatus,
  CompanySize,
  Evidence,
  PricingModel,
  Software,
  SoftwareCategory,
} from '../types/software';

const COMMERCIAL_STATUSES: CommercialStatus[] = [
  'active',
  'beta',
  'legacy',
];

const COMPANY_SIZES: CompanySize[] = [
  'startup',
  'small',
  'medium',
  'enterprise',
];

const PRICING_MODELS: PricingModel[] = [
  'free',
  'freemium',
  'subscription',
  'usage_based',
  'custom',
  'unknown',
];

const BILLING_PERIODS: BillingPeriod[] = [
  'monthly',
  'annual',
  'usage',
  'unknown',
];

const CATEGORIES: SoftwareCategory[] = [
  'ai',
  'crm',
  'automation',
  'productivity',
  'marketing',
  'support',
  'finance',
  'project-management',
  'hr',
  'analytics',
  'security',
  'other',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  if (!isString(value)) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && value.includes('T');
}

function isEvidence(value: unknown): value is Evidence {
  if (!isObject(value)) return false;

  return (
    isString(value.sourceUrl) &&
    value.sourceUrl.startsWith('https://') &&
    isString(value.sourceType) &&
    isIsoDate(value.checkedAt)
  );
}

function isEvidenceArray(value: unknown): value is Evidence[] {
  return Array.isArray(value) && value.every(isEvidence);
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

export function adaptSoftware(raw: unknown): Software | null {
  if (!isObject(raw)) return null;

  if (!isString(raw.id)) return null;
  if (!isString(raw.name)) return null;

  if (!isOneOf(raw.commercialStatus, COMMERCIAL_STATUSES)) {
    return null;
  }

  if (!isOneOf(raw.category, CATEGORIES)) {
    return null;
  }

  if (
    !Array.isArray(raw.targetCompanySize) ||
    !raw.targetCompanySize.every((size) =>
      isOneOf(size, COMPANY_SIZES),
    )
  ) {
    return null;
  }

  if (
    !Array.isArray(raw.primaryGoals) ||
    !raw.primaryGoals.every(isString)
  ) {
    return null;
  }

  if (!isObject(raw.pricing)) return null;

  if (!isOneOf(raw.pricing.model, PRICING_MODELS)) {
    return null;
  }

  if (
    !isOneOf(
      raw.pricing.billingPeriod,
      BILLING_PERIODS,
    )
  ) {
    return null;
  }

  if (
    raw.pricing.currency !== 'EUR' &&
    raw.pricing.currency !== 'USD' &&
    raw.pricing.currency !== 'GBP'
  ) {
    return null;
  }

  if (
    raw.pricing.startingPrice !== undefined &&
    (
      typeof raw.pricing.startingPrice !== 'number' ||
      !Number.isFinite(raw.pricing.startingPrice) ||
      raw.pricing.startingPrice < 0
    )
  ) {
    return null;
  }

  if (
    raw.pricing.priceVerifiedAt !== undefined &&
    !isIsoDate(raw.pricing.priceVerifiedAt)
  ) {
    return null;
  }

  if (!isIsoDate(raw.verifiedAt)) return null;

  if (!isEvidenceArray(raw.evidence)) return null;

  if (
    raw.pricing.evidence !== undefined &&
    !isEvidenceArray(raw.pricing.evidence)
  ) {
    return null;
  }

  if (
    raw.affiliateUrl !== undefined &&
    (
      !isString(raw.affiliateUrl) ||
      !raw.affiliateUrl.startsWith('https://')
    )
  ) {
    return null;
  }

  return {
    id: raw.id.trim(),
    name: raw.name.trim(),
    commercialStatus: raw.commercialStatus,
    category: raw.category,
    targetCompanySize: raw.targetCompanySize,
    primaryGoals: raw.primaryGoals,
    pricing: {
      model: raw.pricing.model,
      currency: raw.pricing.currency,
      billingPeriod: raw.pricing.billingPeriod,
      startingPrice: raw.pricing.startingPrice,
      priceVerifiedAt: raw.pricing.priceVerifiedAt,
      evidence: raw.pricing.evidence,
    },
    verifiedAt: raw.verifiedAt,
    evidence: raw.evidence,
    affiliateUrl: raw.affiliateUrl,
  };
}

export function adaptSoftwareRegistry(
  rawData: unknown[],
): Software[] {
  const registry = new Map<string, Software>();

  for (const raw of rawData) {
    const software = adaptSoftware(raw);

    if (!software) {
      continue;
    }

    if (registry.has(software.id)) {
      throw new Error(
        `Duplicate software ID detected: ${software.id}`,
      );
    }

    registry.set(software.id, software);
  }

  return Array.from(registry.values());
}