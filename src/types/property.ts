export type PropertyCategory = 'residential' | 'commercial';

export type CityTier = 'Metro' | 'Tier 1' | 'Tier 2' | 'Tier 3';
export type LocalityType = 'Premium' | 'Developed' | 'Developing' | 'Suburban';
export type RoadConnectivity = 'Main Road' | 'Internal Road' | 'Arterial Corridor';
export type MetroProximity = 'Under 500m' | '500m - 1km' | '1km - 3km' | '3km+' | 'No Metro';
export type LandShape = 'Rectangular' | 'Square' | 'Irregular' | 'L-Shaped' | 'Trapezoidal';
export type LandUse = 'Residential' | 'Commercial' | 'Mixed Use' | 'Industrial' | 'Institutional';
export type LandOwnership = 'Freehold' | 'Leasehold';
export type ConstructionQuality = 'Premium / Grade-A' | 'Standard / Grade-B' | 'Budget / Low-Cost';
export type StructuralCondition = 'Excellent (Well Maintained)' | 'Good' | 'Average / Minor Repairs' | 'Poor / Distressed';
export type FlooringType = 'Italian Marble / Imported Stone' | 'Indian Marble / Granite' | 'Vitrified Tiles' | 'Cement / IPS';
export type FacingDirection = 'North' | 'East' | 'North-East' | 'North-West' | 'South' | 'South-East' | 'West' | 'South-West';

export type ResidentialType = 'Flat / Apartment' | 'Independent House / Kothi' | 'Villa' | 'Builder Floor' | 'Residential Plot';
export type BHKType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | '5+ BHK / Penthouse';

export type CommercialCategory = 
  | 'Grade-A Corporate Office' 
  | 'Retail Shop' 
  | 'High-Street Showroom' 
  | 'Warehouse / Logistics' 
  | 'Industrial Building' 
  | 'Co-working / Business Center';

export type BusinessDistrictType = 
  | 'Central Business District (CBD)' 
  | 'Secondary Business District (SBD)' 
  | 'High-Street Retail Market' 
  | 'IT / Tech Corridor' 
  | 'Logistics / Industrial Hub';

export type DailyFootfall = 
  | 'Ultra-High (High-Street / Metro Junction > 10,000/day)' 
  | 'High (3,000 - 10,000/day)' 
  | 'Moderate (1,000 - 3,000/day)' 
  | 'Low / Destination Only';

export type CommercialFloor = 
  | 'Ground Floor (Prime Retail)' 
  | '1st Floor / Mezzanine' 
  | '2nd - 5th Floor' 
  | 'High Floor (6th+)' 
  | 'Basement';

export type TenantProfile = 
  | 'Blue-chip MNC / Fortune 500' 
  | 'National Retail / Bank Anchor' 
  | 'Regional Corporate' 
  | 'Independent SME';

export interface PropertyData {
  id: string;
  name: string;
  propertyCategory: PropertyCategory;
  city: string;
  cityTier: CityTier;
  locality: string;
  localityType: LocalityType;
  roadConnectivity: RoadConnectivity;
  roadWidth: number; // in feet
  metroProximity: MetroProximity;
  railwayDistanceKm: number;
  airportDistanceKm: number;
  highwayDistanceKm: number;
  neighbourhoodType: string;
  safetyIndex: 'High (Gated/Patrolled)' | 'Moderate' | 'Average' | 'Low';
  pollutionIndex: 'Low / Green Belt' | 'Moderate' | 'High / Congested';
  publicTransport: 'Excellent' | 'Good' | 'Average' | 'Poor';
  schoolsNearby: boolean;
  hospitalsNearby: boolean;
  shoppingHubsNearby: boolean;
  employmentHubs: 'Major IT/Corporate Park (<2km)' | 'Moderate (<5km)' | 'Distant (>10km)';
  futureDevelopment: 'High (Upcoming Metro / Expressway / SEZ)' | 'Moderate' | 'Stable / Mature';

  // Land Parameters
  plotArea: number; // in sq ft
  plotLength: number; // in ft
  plotWidth: number; // in ft
  landShape: LandShape;
  roadFrontage: number; // in ft
  cornerPlot: boolean;
  roadFacingType: 'Main Road Facing' | 'Internal Road Facing';
  landUse: LandUse;
  landOwnership: LandOwnership;
  leaseTermRemainingYears?: number;
  permittedFAR: number; // e.g. 2.0
  groundCoveragePct: number; // e.g. 50%
  setbacksFront: number; // in ft
  landTopography: 'Level / Flat' | 'Slight Slope' | 'Steep / Uneven';
  soilCondition: 'Hard Rock / High Bearing' | 'Good Sandy/Loam' | 'Clay / Low Bearing' | 'Reclaimed';
  encumbrances: 'Nil / Clear' | 'Active Bank Mortgage' | 'Legal Lien / Caution';
  easements: 'None' | 'Right of Way / Utility Line';
  developmentPotential: 'High (Transferable Development Rights/FAR available)' | 'Full Built' | 'Restricted';
  landRatePerSqFt: number; // in INR

  // Building & Construction Parameters
  buildingAge: number; // in years
  totalEconomicLife: number; // in years (e.g. 60)
  constructionQuality: ConstructionQuality;
  structuralCondition: StructuralCondition;
  foundationType: string;
  flooring: FlooringType;
  wallsFinishing: string;
  roofType: string;
  doorsWindows: string;
  electricalCondition: string;
  plumbingCondition: string;
  bathroomsCount: number;
  bathroomsQuality: 'Luxury Branded Fittings' | 'Standard Branded' | 'Basic';
  kitchenType: string;
  ceilingHeight: number; // in ft
  liftAvailability: 'High-speed Branded Passenger + Service Lifts' | 'Standard Lift' | 'No Lift';
  parkingType: 'Stilt Covered + Basement Dedicated' | 'Open Dedicated' | 'Common / Street Parking';
  fireSafety: 'Full Compliance (Sprinklers, Hydrants, Smoke Detectors, Dual Staircase)' | 'Basic Extinguishers' | 'Non-Compliant';
  waterSupply: '24/7 Municipal Corporation + Dedicated Borewell' | 'Municipal Only' | 'Tanker Dependent';
  powerBackup: '100% Full Load DG Backup' | 'Partial / Common Areas' | 'Individual Inverter' | 'None';
  maintenanceCondition: 'Maintained by Professional Facility Agency' | 'Resident RWA Managed' | 'Self / Neglected';
  renovationCostRequired: number; // in INR
  currentReplacementConstructionCostPerSqFt: number; // in INR

  // Legal & Documentation Parameters
  saleDeedStatus: 'Verified & Registered Sale Deed' | 'Agreement to Sell / GPA' | 'Under Mutation';
  titleChainVerification: 'Clear 30+ Year Title Search Available' | 'Chain Incomplete' | 'Under Legal Review';
  registrationStatus: 'Duly Registered at Sub-Registrar Office' | 'Pending Registration';
  encumbranceCertificate: 'Nil Encumbrance (Form 15 Issued)' | 'Encumbrance Found (Form 16)' | 'Not Applied';
  approvedLandUseClassification: 'Conforming / Sanctioned Land Use' | 'Mixed-Use Regularized' | 'Non-Conforming';
  sanctionedBuildingPlan: 'Approved by Municipal / Development Authority' | 'Deviations < 10%' | 'Unapproved Deviations';
  occupancyCertificate: 'Occupancy Certificate (OC) Issued' | 'Applied / Deemed OC' | 'Pending / No OC';
  completionCertificate: 'Completion Certificate (CC) Available' | 'In Process' | 'Not Issued';
  propertyTaxReceipts: 'All Dues Paid up-to-date with Receipts' | 'Current Year Pending' | 'Long-term Arrears';
  utilityDuesClear: boolean;
  mortgageNOC: 'No Mortgage / Bank NOC in Hand' | 'Active Loan (Bank Release Required)';
  litigationStatus: 'Nil / Zero Pending Litigation in Courts' | 'Family Partition / Title Dispute Pending';
  reraRegistration: 'RERA Registered & Active' | 'RERA Exempted (< 8 units/500 sqm)' | 'RERA Non-Compliant';
  leaseDeedStatus: 'Long-term Registered Lease Deed' | 'Short-term Notarized' | 'Freehold (N/A)';
  societyNOC: 'Society NOC / Transfer Permission Granted' | 'Pending NOC' | 'Independent (N/A)';
  floorOwnershipRights: 'Approved Floor Rights with Roof Rights' | 'Floor Rights only' | 'Undivided Share of Land (UDS)';

  // Residential Specific Parameters (when propertyCategory === 'residential')
  residentialType?: ResidentialType;
  bhk?: BHKType;
  carpetArea?: number; // sq ft
  builtUpArea?: number; // sq ft
  superBuiltUpArea?: number; // sq ft
  floorNumber?: number;
  totalFloors?: number;
  facingDirection?: FacingDirection;
  vastuCompliance?: 'Fully Vastu Compliant' | 'Partially Compliant' | 'Non-Compliant / Irrelevant';
  balconyCount?: number;
  balconyAreaSqFt?: number;
  ventilationRating?: 'Cross Ventilation / 3 Sides Open' | 'Good 2 Sides Open' | 'Standard 1 Side Open';
  naturalLighting?: 'Abundant Direct Sunlight' | 'Good' | 'Average / Low Light';
  privacyLevel?: 'High (No Overlooking Units)' | 'Moderate' | 'Low / Overlooked';
  societyFacilities?: string[];
  securityInfrastructure?: string[];
  dedicatedParkingSlots?: number;
  monthlyMaintenanceCharges?: number;
  occupancyStatus?: 'Vacant Possession' | 'Owner Occupied' | 'Tenant Occupied';
  rentalDemandLocality?: 'Very High' | 'High' | 'Moderate' | 'Low';
  resaleDemandLocality?: 'High Liquidity (< 45 days)' | 'Moderate (45-90 days)' | 'Slow (> 90 days)';

  // Commercial Specific Parameters (when propertyCategory === 'commercial')
  commercialCategory?: CommercialCategory;
  businessDistrictType?: BusinessDistrictType;
  commercialFrontageWidth?: number; // in ft
  visibilityScore?: 'Maximum (Corner / Main Boulevard)' | 'High (Direct Road Exposure)' | 'Moderate' | 'Low / Rear Facing';
  dailyFootfall?: DailyFootfall;
  accessibilityTransit?: 'Immediate Metro & Bus (<200m)' | 'Under 1km' | 'Moderate Distance';
  commercialFloor?: CommercialFloor;
  clearCeilingHeight?: number; // in ft
  loadingFacilities?: 'Dedicated Heavy Truck Loading Docks' | 'Van / Light Vehicle Bay' | 'Shared Common' | 'None';
  goodsLift?: boolean;
  passengerLiftsCount?: number;
  sanctionedPowerLoadKva?: number; // in kVA
  hvacSystem?: 'Central Chilled Water Plant / VRV' | 'Ductable Split Units' | 'Individual Splits' | 'Natural / Mechanical Ventilation';
  fireComplianceCommercial?: 'NBC / Fire Dept Approved with Automatic Sprinklers & Dual Exit' | 'Basic Compliance' | 'Audit Due';
  parkingCustomerEmployee?: number;
  signageRights?: 'Prominent Building Top & Façade Totem' | 'Façade Shopfront Signage' | 'Lobby Directory Only';
  tenantProfile?: TenantProfile;
  leaseDurationYears?: number;
  remainingLockInMonths?: number;
  monthlyContractualRent?: number; // in INR
  rentEscalationPct?: number; // % every 3 years
  vacancyRatePct?: number; // %
  camChargesPerSqFt?: number; // INR/sq ft/month
  annualOperatingExpenses?: number; // in INR
  marketCapRate?: number; // in % (e.g. 7.5)
  tenantQualityRating?: 'Grade AAA (Zero Default Risk)' | 'Grade AA (Established)' | 'Grade A (Stable)' | 'Standard';

  // Market & Valuation inputs
  comparableMarketRatePerSqFt: number; // in INR
  circleRatePerSqFt: number; // in INR
  monthlyRent: number; // in INR
  annualMaintenanceCost: number; // in INR
  annualPropertyTax: number; // in INR
  annualInsurance: number; // in INR
  expectedAppreciationRatePct: number; // in %
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValuationAdjustment {
  factor: string;
  impactPercentage: number;
  description: string;
  isFavourable: boolean;
}

export interface ValuationOutput {
  // Method 1: Market Comparison
  marketComparisonValue: number;
  adjustedMarketRatePerSqFt: number;
  netAdjustmentPercentage: number;
  adjustmentsList: ValuationAdjustment[];

  // Method 2: Income Capitalisation
  grossAnnualRent: number;
  effectiveGrossIncome: number;
  annualOperatingExpensesTotal: number;
  netOperatingIncome: number;
  capRateUsed: number;
  incomeCapitalisationValue: number;
  capRateSensitivity: {
    capRate: number;
    value: number;
  }[];

  // Method 3: Cost Approach
  landValue: number;
  permissibleBuiltUpArea: number;
  replacementCostBuilding: number;
  physicalDepreciation: number;
  functionalObsolescence: number;
  depreciatedBuildingValue: number;
  costApproachValue: number;

  // Government Circle Rate
  circleRateValue: number;
  circleRateDifferencePct: number;
  estimatedStampDuty: number;
  estimatedRegistrationFee: number;

  // Reconciled Final Fair Market Value
  fairMarketValue: number;
  weighting: {
    comparison: number;
    income: number;
    cost: number;
  };

  // Strategic Outputs
  quickSaleValue: number; // ~15% discount for 30-day liquidity
  expectedPriceRange: {
    conservative: number;
    fairMarket: number;
    optimistic: number;
  };

  // Investment Metrics
  grossRentalYield: number; // %
  netRentalYield: number; // %
  capitalisationRate: number; // %
  legalRiskScore: 'Low Risk (Clear Title)' | 'Moderate Risk (Minor Approvals Due)' | 'High Risk (Disputes/No OC)';
  legalRiskDetails: string[];

  // 10-Year Projections
  tenYearForecast: {
    year: number;
    propertyValue: number;
    annualRent: number;
    netCashFlow: number;
    cumulativeReturnPct: number;
  }[];
}

export interface AIAppraisalReport {
  executiveSummary: string;
  methodologyCritique: string;
  keyStrengths: string[];
  riskFactors: string[];
  liquidityAndSaleStrategy: string;
  futureAppreciationForecast: string;
  valuerRecommendation: string;
}
