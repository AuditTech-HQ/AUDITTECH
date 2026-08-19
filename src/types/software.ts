export type CommercialStatus = 'active' | 'beta' | 'legacy';

export type MatchResult =
  | 'MATCH'
  | 'MISMATCH'
  | 'UNKNOWN';

export type CompanySize =
  | 'startup'
  | 'small'
  | 'medium'
  | 'enterprise';

export type PricingModel =
  | 'free'
  | 'freemium'
  | 'subscription'
  | 'usage_based'
  | 'custom'
  | 'unknown';

export type BillingPeriod =
  | 'monthly'
  | 'annual'
  | 'usage'
  | 'unknown';

export type SoftwareCategory =
  | 'ai'
  | 'crm'
  | 'automation'
  | 'productivity'
  | 'marketing'
  | 'support'
  | 'finance'
  | 'project-management'
  | 'hr'
  | 'analytics'
  | 'security'
  | 'other';

export interface Evidence {
  sourceUrl: string;
  sourceType:
    | 'official'
    | 'pricing'
    | 'documentation'
    | 'support'
    | 'other';
  checkedAt: string;
}

export interface Pricing {
  model: PricingModel;
  currency: 'EUR' | 'USD' | 'GBP';
  billingPeriod: BillingPeriod;
  startingPrice?: number;
  priceVerifiedAt?: string;
  evidence?: Evidence[];
}

export interface Software {
  id: string;
  name: string;
  commercialStatus: CommercialStatus;
  category: SoftwareCategory;
  targetCompanySize: CompanySize[];
  primaryGoals: string[];
  pricing: Pricing;
  verifiedAt: string;
  evidence: Evidence[];
  affiliateUrl?: string;
}

export interface FinderCriteria {
  category: SoftwareCategory;
  companySize: CompanySize;
  goal: string;
  maxBudget?: number;
}