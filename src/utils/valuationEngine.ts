import { PropertyData, ValuationAdjustment, ValuationOutput } from '../types/property';
import { INDIAN_CITIES_CIRCLE_DATA } from '../data/circleRates';

export function calculatePropertyValuation(data: PropertyData): ValuationOutput {
  const isCommercial = data.propertyCategory === 'commercial';

  // Area determination:
  // For comparison & cost: residential apartments use superBuiltUpArea, villas use permissibleBuiltUp or builtUpArea
  const effectiveArea = isCommercial
    ? (data.builtUpArea || data.carpetArea || 2000)
    : (data.superBuiltUpArea || (data.carpetArea ? data.carpetArea * 1.25 : 1200));

  // -------------------------------------------------------------
  // METHOD 1: MARKET COMPARISON APPROACH
  // Formula: V = A * R_adjusted
  // -------------------------------------------------------------
  const adjustmentsList: ValuationAdjustment[] = [];

  // 1. Location / Neighbourhood
  if (data.localityType === 'Premium') {
    adjustmentsList.push({
      factor: 'Premium Locality Catchment',
      impactPercentage: 6.0,
      description: 'High-income demographic profile and superior civic amenities',
      isFavourable: true,
    });
  } else if (data.localityType === 'Developing') {
    adjustmentsList.push({
      factor: 'Developing Locality Discount',
      impactPercentage: -4.0,
      description: 'Infrastructure still maturing; slight liquidity markdown',
      isFavourable: false,
    });
  }

  // 2. Road Width & Connectivity
  if (data.roadWidth >= 60) {
    adjustmentsList.push({
      factor: `Wide Road Access (${data.roadWidth} ft)`,
      impactPercentage: 4.5,
      description: 'Wide vehicular right-of-way enhances accessibility and future commercial potential',
      isFavourable: true,
    });
  } else if (data.roadWidth <= 20) {
    adjustmentsList.push({
      factor: `Narrow Road Access (${data.roadWidth} ft)`,
      impactPercentage: -5.0,
      description: 'Restricted vehicular mobility and parking congestion',
      isFavourable: false,
    });
  }

  // 3. Corner Plot
  if (data.cornerPlot) {
    adjustmentsList.push({
      factor: 'Corner Plot Configuration',
      impactPercentage: 4.0,
      description: 'Dual road frontage, enhanced natural illumination, and premium curb appeal',
      isFavourable: true,
    });
  }

  // 4. Metro Proximity
  if (data.metroProximity === 'Under 500m') {
    adjustmentsList.push({
      factor: 'Immediate Metro Proximity (<500m)',
      impactPercentage: 3.5,
      description: 'Walkable transit hub creates strong tenant and commuter absorption',
      isFavourable: true,
    });
  } else if (data.metroProximity === 'No Metro' && data.cityTier === 'Metro') {
    adjustmentsList.push({
      factor: 'Sub-optimal Rapid Transit Access',
      impactPercentage: -2.5,
      description: 'Absence of metro rail connectivity within 3km radius',
      isFavourable: false,
    });
  }

  // 5. Building Age Depreciation Adjustment
  if (data.buildingAge > 3) {
    const ageImpact = -Math.min(25, (data.buildingAge - 3) * 0.9);
    adjustmentsList.push({
      factor: `Building Age Adjustment (${data.buildingAge} yrs)`,
      impactPercentage: Number(ageImpact.toFixed(1)),
      description: 'Wear and tear relative to new construction benchmarks',
      isFavourable: false,
    });
  } else if (data.buildingAge <= 1) {
    adjustmentsList.push({
      factor: 'Brand New / Just Completed Construction',
      impactPercentage: 3.0,
      description: 'Zero immediate capital expenditure and modern design specification',
      isFavourable: true,
    });
  }

  // 6. Structural & Construction Quality
  if (data.structuralCondition === 'Excellent (Well Maintained)') {
    adjustmentsList.push({
      factor: 'Superior Structural Maintenance',
      impactPercentage: 3.0,
      description: 'Immaculately maintained building with no dampness or structural distress',
      isFavourable: true,
    });
  } else if (data.structuralCondition === 'Poor / Distressed') {
    adjustmentsList.push({
      factor: 'Structural Deterioration Penalty',
      impactPercentage: -10.0,
      description: 'Requires substantial structural retrofitting and waterproofing work',
      isFavourable: false,
    });
  }

  // 7. Legal & Regulatory Clearances
  if (data.occupancyCertificate !== 'Occupancy Certificate (OC) Issued') {
    adjustmentsList.push({
      factor: 'Missing / Pending Occupancy Certificate (OC)',
      impactPercentage: -8.0,
      description: 'Incomplete municipal statutory clearance; hampers bank loan approval',
      isFavourable: false,
    });
  }

  if (data.litigationStatus !== 'Nil / Zero Pending Litigation in Courts') {
    adjustmentsList.push({
      factor: 'Pending Court Litigation / Title Risk',
      impactPercentage: -18.0,
      description: 'Active legal dispute severely dampens open-market transaction liquidity',
      isFavourable: false,
    });
  }

  // 8. Commercial vs Residential Specifics
  if (isCommercial) {
    if (data.dailyFootfall === 'Ultra-High (High-Street / Metro Junction > 10,000/day)' || data.visibilityScore === 'Maximum (Corner / Main Boulevard)') {
      adjustmentsList.push({
        factor: 'High-Footfall & Prime Street Exposure',
        impactPercentage: 7.0,
        description: 'Prime retail prominence commanding premium lease rentals',
        isFavourable: true,
      });
    }
    if (data.commercialFloor === 'Ground Floor (Prime Retail)') {
      adjustmentsList.push({
        factor: 'Ground Floor Commercial Premium',
        impactPercentage: 10.0,
        description: 'Maximum customer walk-in conversion and brand signage visibility',
        isFavourable: true,
      });
    } else if (data.commercialFloor === 'Basement') {
      adjustmentsList.push({
        factor: 'Basement Floor Location Discount',
        impactPercentage: -12.0,
        description: 'Reduced footfall and reliance on artificial lighting/ventilation',
        isFavourable: false,
      });
    }
    if (data.tenantProfile === 'Blue-chip MNC / Fortune 500') {
      adjustmentsList.push({
        factor: 'AAA Blue-Chip Tenant Covenant',
        impactPercentage: 5.0,
        description: 'Institutional grade covenant with near-zero rental default probability',
        isFavourable: true,
      });
    }
  } else {
    // Residential specifics
    if (data.facingDirection === 'North-East' || data.facingDirection === 'East') {
      adjustmentsList.push({
        factor: `Preferred Facing (${data.facingDirection}) & Vastu Alignment`,
        impactPercentage: 2.5,
        description: 'High buyer orientation preference with natural morning sunlight',
        isFavourable: true,
      });
    }
    if (data.parkingType === 'Stilt Covered + Basement Dedicated' && (data.dedicatedParkingSlots || 0) >= 2) {
      adjustmentsList.push({
        factor: 'Multiple Dedicated Covered Parking Bays',
        impactPercentage: 3.5,
        description: 'Covered stilt/basement parking spaces in high vehicle-density zone',
        isFavourable: true,
      });
    }
    if (data.floorOwnershipRights === 'Approved Floor Rights with Roof Rights') {
      adjustmentsList.push({
        factor: 'Exclusive Roof / Terrace Rights',
        impactPercentage: 6.0,
        description: 'Exclusive usage rights of private terrace garden and solar installation',
        isFavourable: true,
      });
    }
  }

  // Sum of adjustments
  const netAdjustmentPercentage = adjustmentsList.reduce((acc, curr) => acc + curr.impactPercentage, 0);
  const baseRate = data.comparableMarketRatePerSqFt || 6000;
  const adjustedMarketRatePerSqFt = Math.round(baseRate * (1 + netAdjustmentPercentage / 100));
  const marketComparisonValue = Math.round(effectiveArea * adjustedMarketRatePerSqFt);

  // -------------------------------------------------------------
  // METHOD 2: INCOME CAPITALISATION APPROACH
  // Formula: V = NOI / Cap Rate
  // -------------------------------------------------------------
  const monthlyRent = data.monthlyRent || (isCommercial ? data.monthlyContractualRent || 100000 : 30000);
  const grossAnnualRent = monthlyRent * 12;
  const vacancyRatePct = data.vacancyRatePct !== undefined ? data.vacancyRatePct : (isCommercial ? 4.0 : 3.0);
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRatePct / 100);

  // Operating Expenses: property tax, insurance, maintenance, management reserve
  const annualOperatingExpensesTotal = data.annualOperatingExpenses || (
    (data.annualMaintenanceCost || 30000) + 
    (data.annualPropertyTax || 15000) + 
    (data.annualInsurance || 8000)
  );

  const netOperatingIncome = Math.max(0, effectiveGrossIncome - annualOperatingExpensesTotal);
  const capRateUsed = data.marketCapRate || (isCommercial ? 7.5 : 4.0); // e.g. 7.5% for commercial, 4.0% for residential
  const incomeCapitalisationValue = capRateUsed > 0 
    ? Math.round(netOperatingIncome / (capRateUsed / 100))
    : marketComparisonValue;

  // Cap Rate Sensitivity Analysis (e.g., -1%, -0.5%, Base, +0.5%, +1%)
  const capRateSensitivity = [
    { capRate: Number((capRateUsed - 1.0).toFixed(1)), value: Math.round(netOperatingIncome / ((capRateUsed - 1.0) / 100)) },
    { capRate: Number((capRateUsed - 0.5).toFixed(1)), value: Math.round(netOperatingIncome / ((capRateUsed - 0.5) / 100)) },
    { capRate: Number(capRateUsed.toFixed(1)), value: incomeCapitalisationValue },
    { capRate: Number((capRateUsed + 0.5).toFixed(1)), value: Math.round(netOperatingIncome / ((capRateUsed + 0.5) / 100)) },
    { capRate: Number((capRateUsed + 1.0).toFixed(1)), value: Math.round(netOperatingIncome / ((capRateUsed + 1.0) / 100)) },
  ];

  // -------------------------------------------------------------
  // METHOD 3: COST APPROACH (REPLACEMENT COST METHOD)
  // Formula: V = L + (RC - D - O)
  // -------------------------------------------------------------
  const landRate = data.landRatePerSqFt || (baseRate * 0.7);
  const plotArea = data.plotArea || 2000;
  const totalLandValue = plotArea * landRate;
  
  // Permissible Built-up Area = Plot Area * Permitted FAR
  const permissibleBuiltUpArea = Math.round(plotArea * (data.permittedFAR || 2.0));

  // If subject property is an apartment/floor unit, allocate pro-rata land share (UDS)
  let allocatedLandValue = totalLandValue;
  if (!isCommercial && (data.residentialType === 'Flat / Apartment' || data.residentialType === 'Builder Floor')) {
    const totalBuildingBuiltArea = Math.max(permissibleBuiltUpArea, effectiveArea * 4);
    allocatedLandValue = Math.round(totalLandValue * (effectiveArea / totalBuildingBuiltArea));
  } else if (isCommercial && data.commercialCategory !== 'Warehouse / Logistics') {
    const totalBuildingBuiltArea = Math.max(permissibleBuiltUpArea, effectiveArea * 5);
    allocatedLandValue = Math.round(totalLandValue * (effectiveArea / totalBuildingBuiltArea));
  }

  const replacementCostPerSqFt = data.currentReplacementConstructionCostPerSqFt || (isCommercial ? 3600 : 2800);
  const replacementCostBuilding = Math.round(effectiveArea * replacementCostPerSqFt);

  // Depreciation: Straight line adjusted for structural condition
  const economicLife = data.totalEconomicLife || 60;
  const age = Math.min(data.buildingAge || 0, economicLife);
  const conditionFactor = data.structuralCondition === 'Excellent (Well Maintained)' ? 0.85
    : data.structuralCondition === 'Good' ? 1.0
    : data.structuralCondition === 'Average / Minor Repairs' ? 1.2
    : 1.5;
  
  const physicalDepreciation = Math.round(replacementCostBuilding * (age / economicLife) * conditionFactor);
  
  // Functional and Economic Obsolescence
  let obsolescencePct = 0.04;
  if (data.ceilingHeight && data.ceilingHeight < 9.5) obsolescencePct += 0.03;
  if (data.liftAvailability === 'No Lift' && (data.totalFloors || 1) >= 4) obsolescencePct += 0.05;
  if (data.parkingType === 'Common / Street Parking') obsolescencePct += 0.03;
  const functionalObsolescence = Math.round(replacementCostBuilding * obsolescencePct);

  const depreciatedBuildingValue = Math.max(0, replacementCostBuilding - physicalDepreciation - functionalObsolescence - (data.renovationCostRequired || 0));
  const costApproachValue = Math.round(allocatedLandValue + depreciatedBuildingValue);

  // -------------------------------------------------------------
  // GOVERNMENT CIRCLE RATE & REGISTRATION CHARGES
  // -------------------------------------------------------------
  const cityData = INDIAN_CITIES_CIRCLE_DATA[data.city];
  const circleRate = data.circleRatePerSqFt || (cityData ? cityData.localities[0].circleRatePerSqFt : 5000);
  const circleRateValue = Math.round(effectiveArea * circleRate);
  const stampDutyRate = cityData ? cityData.stampDutyPct : 6.0;
  const regFeeRate = cityData ? cityData.registrationFeePct : 1.0;
  const estimatedStampDuty = Math.round(circleRateValue * (stampDutyRate / 100));
  const estimatedRegistrationFee = Math.round(circleRateValue * (regFeeRate / 100));

  // -------------------------------------------------------------
  // RECONCILIATION & FINAL FAIR MARKET VALUE (FMV)
  // Weighted reconciliation according to asset class
  // -------------------------------------------------------------
  const weighting = isCommercial
    ? { comparison: 0.25, income: 0.65, cost: 0.10 }
    : { comparison: 0.60, income: 0.15, cost: 0.25 };

  const fairMarketValue = Math.round(
    marketComparisonValue * weighting.comparison +
    incomeCapitalisationValue * weighting.income +
    costApproachValue * weighting.cost
  );

  const circleRateDifferencePct = circleRateValue > 0
    ? Number((((fairMarketValue - circleRateValue) / circleRateValue) * 100).toFixed(1))
    : 0;

  // Strategic Liquidation / Quick-Sale Value (~15% markdown for 30-day liquidity)
  const quickSaleValue = Math.round(fairMarketValue * 0.85);

  const expectedPriceRange = {
    conservative: Math.round(fairMarketValue * 0.94),
    fairMarket: fairMarketValue,
    optimistic: Math.round(fairMarketValue * 1.06),
  };

  // Yields
  const grossRentalYield = fairMarketValue > 0 ? Number(((grossAnnualRent / fairMarketValue) * 100).toFixed(2)) : 0;
  const netRentalYield = fairMarketValue > 0 ? Number(((netOperatingIncome / fairMarketValue) * 100).toFixed(2)) : 0;
  const capitalisationRate = fairMarketValue > 0 ? Number(((netOperatingIncome / fairMarketValue) * 100).toFixed(2)) : 0;

  // Legal Risk Assessment
  const legalRiskDetails: string[] = [];
  if (data.saleDeedStatus !== 'Verified & Registered Sale Deed') {
    legalRiskDetails.push('Unregistered or pending sale deed requires title validation');
  }
  if (data.occupancyCertificate !== 'Occupancy Certificate (OC) Issued') {
    legalRiskDetails.push('Missing Occupancy Certificate (OC) poses municipal compliance risk');
  }
  if (data.litigationStatus !== 'Nil / Zero Pending Litigation in Courts') {
    legalRiskDetails.push('Active legal dispute flagged in Sub-Registrar / Court records');
  }
  if (data.encumbrances !== 'Nil / Clear') {
    legalRiskDetails.push('Active mortgage / encumbrance requires bank release NOC before conveyance');
  }

  let legalRiskScore: 'Low Risk (Clear Title)' | 'Moderate Risk (Minor Approvals Due)' | 'High Risk (Disputes/No OC)' = 'Low Risk (Clear Title)';
  if (legalRiskDetails.length >= 2 || data.litigationStatus !== 'Nil / Zero Pending Litigation in Courts') {
    legalRiskScore = 'High Risk (Disputes/No OC)';
  } else if (legalRiskDetails.length === 1) {
    legalRiskScore = 'Moderate Risk (Minor Approvals Due)';
  }

  // 10-Year Wealth & Cash Flow Projection
  const appreciationRate = (data.expectedAppreciationRatePct || (isCommercial ? 7.5 : 8.5)) / 100;
  const rentalGrowthRate = isCommercial ? 0.05 : 0.055; // 5% - 5.5% annual rental growth
  const initialInvestment = fairMarketValue;

  const tenYearForecast = [];
  let currentValue = fairMarketValue;
  let currentRent = grossAnnualRent;
  let cumulativeCashFlow = 0;

  for (let yr = 1; yr <= 10; yr++) {
    currentValue = Math.round(currentValue * (1 + appreciationRate));
    currentRent = Math.round(currentRent * (1 + rentalGrowthRate));
    const annualNetCash = Math.round(currentRent * 0.82); // net after tax & upkeep
    cumulativeCashFlow += annualNetCash;
    const capitalGain = currentValue - initialInvestment;
    const totalReturn = capitalGain + cumulativeCashFlow;
    const cumulativeReturnPct = initialInvestment > 0 ? Number(((totalReturn / initialInvestment) * 100).toFixed(1)) : 0;

    tenYearForecast.push({
      year: yr,
      propertyValue: currentValue,
      annualRent: currentRent,
      netCashFlow: annualNetCash,
      cumulativeReturnPct,
    });
  }

  return {
    marketComparisonValue,
    adjustedMarketRatePerSqFt,
    netAdjustmentPercentage: Number(netAdjustmentPercentage.toFixed(1)),
    adjustmentsList,

    grossAnnualRent,
    effectiveGrossIncome: Math.round(effectiveGrossIncome),
    annualOperatingExpensesTotal,
    netOperatingIncome: Math.round(netOperatingIncome),
    capRateUsed,
    incomeCapitalisationValue,
    capRateSensitivity,

    landValue: allocatedLandValue,
    permissibleBuiltUpArea,
    replacementCostBuilding,
    physicalDepreciation,
    functionalObsolescence,
    depreciatedBuildingValue,
    costApproachValue,

    circleRateValue,
    circleRateDifferencePct,
    estimatedStampDuty,
    estimatedRegistrationFee,

    fairMarketValue,
    weighting,

    quickSaleValue,
    expectedPriceRange,

    grossRentalYield,
    netRentalYield,
    capitalisationRate,
    legalRiskScore,
    legalRiskDetails,

    tenYearForecast,
  };
}

export function formatINR(val: number): string {
  if (val >= 10000000) {
    const crores = val / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}
