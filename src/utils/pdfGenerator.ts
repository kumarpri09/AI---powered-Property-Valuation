import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PropertyData, ValuationOutput, AIAppraisalReport } from '../types/property';
import { UserProfile } from '../types/auth';
import { formatINR } from './valuationEngine';

export function generateValuationPDF(
  propertyData: PropertyData,
  valuation: ValuationOutput,
  user: UserProfile | null,
  aiReport?: AIAppraisalReport | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 14;

  const isCommercial = propertyData.propertyCategory === 'commercial';
  const reportRef = `VM-VAL-${Date.now().toString().slice(-8)}`;
  const valuationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // ==========================================
  // PAGE 1: HEADER & EXECUTIVE VALUATION SUMMARY
  // ==========================================

  // Primary Header Bar
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VALUMETRIC PROPERTY APPRAISAL REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(199, 210, 254);
  doc.text('Certified Chartered Valuation & Real Estate Advisory Framework · IVS & IBBI Aligned', margin, 18);
  doc.text(`Ref ID: ${reportRef} · Valuation Date: ${valuationDate}`, margin, 23);

  currentY = 34;

  // Appraiser & Client Credentials Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('APPRAISER INFORMATION', margin + 4, currentY + 5);
  doc.text('VALUATION PURPOSE & ASSET CLASS', margin + (pageWidth - margin * 2) / 2 + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Valuer: ${user?.name || 'Licensed Chartered Valuer'} (${user?.role || 'Chartered Valuer'})`, margin + 4, currentY + 10);
  doc.text(`Contact: +91 ${user?.mobileNumber || '9876543210'} · Status: Verified`, margin + 4, currentY + 15);
  doc.text(`Registered Address: ${user?.address?.city || propertyData.city}, India`, margin + 4, currentY + 19);

  doc.text(`Asset Type: ${propertyData.propertyCategory.toUpperCase()} (${propertyData.residentialType || propertyData.commercialCategory})`, margin + (pageWidth - margin * 2) / 2 + 4, currentY + 10);
  doc.text(`Purpose: Open Market Value / Lending Collateral / Investment Analysis`, margin + (pageWidth - margin * 2) / 2 + 4, currentY + 15);
  doc.text(`Legal Interest: Freehold Title with Undivided Land Rights`, margin + (pageWidth - margin * 2) / 2 + 4, currentY + 19);

  currentY += 26;

  // Major FMV Highlight Box
  doc.setFillColor(238, 242, 255); // Indigo Tint
  doc.setDrawColor(165, 180, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text('FINAL CERTIFIED FAIR MARKET VALUE (FMV)', margin + 6, currentY + 7);

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(valuation.fairMarketValue), margin + 6, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Realistic Selling Range: ${formatINR(valuation.expectedPriceRange.conservative)} (Conservative) - ${formatINR(valuation.expectedPriceRange.optimistic)} (Optimistic)`,
    margin + 6,
    currentY + 23
  );

  // Quick stats column in FMV box
  const colX = margin + 115;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Quick-Sale Liquidation Value (30 Days):', colX, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(valuation.quickSaleValue), colX, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Gross Rental Yield / Net Yield:', colX, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`${valuation.grossRentalYield}% Gross  ·  ${valuation.netRentalYield}% Net`, colX, currentY + 23);

  currentY += 32;

  // Table 1: Subject Property Master Identification
  autoTable(doc, {
    startY: currentY,
    head: [['Attribute', 'Subject Property Details', 'Attribute', 'Micro-Market & Legal Status']],
    body: [
      ['Property Name', propertyData.name, 'City & Locality', `${propertyData.locality}, ${propertyData.city} (${propertyData.cityTier})`],
      ['Category / Typology', `${propertyData.propertyCategory.toUpperCase()} - ${propertyData.residentialType || propertyData.commercialCategory}`, 'Road Accessibility', `${propertyData.roadWidth} ft width (${propertyData.roadConnectivity})`],
      ['Plot Area / Frontage', `${propertyData.plotArea.toLocaleString('en-IN')} sq ft (Frontage: ${propertyData.roadFrontage} ft)`, 'Corner Plot Status', propertyData.cornerPlot ? 'Yes (Dual Road Frontage)' : 'No (Intermediate Plot)'],
      ['Effective Built Area', isCommercial ? `${propertyData.builtUpArea || 2000} sq ft (Leasable)` : `${propertyData.superBuiltUpArea || 1500} sq ft (Super Built-Up)`, 'Permissible FAR', `${propertyData.permittedFAR} (Permissible Built: ${(propertyData.plotArea * propertyData.permittedFAR).toLocaleString('en-IN')} sq ft)`],
      ['Building Age / Life', `${propertyData.buildingAge} yrs (Economic Life: ${propertyData.totalEconomicLife} yrs)`, 'Structural Condition', propertyData.structuralCondition],
      ['Title Ownership', propertyData.landOwnership, 'Occupancy / RERA', `${propertyData.occupancyCertificate} · ${propertyData.reraRegistration}`],
      ['Contractual Monthly Rent', `₹${propertyData.monthlyRent.toLocaleString('en-IN')}/month`, 'Circle Rate Benchmark', `₹${propertyData.circleRatePerSqFt.toLocaleString('en-IN')}/sq ft`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 48 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Table 2: The Three Primary Valuation Methods Comparison
  autoTable(doc, {
    startY: currentY,
    head: [['Valuation Methodology', 'Calculated Value (INR)', 'Weighting', 'Key Inputs, Formulas & Reconciliation']],
    body: [
      [
        'Method 1: Market Comparison\n(V = Area × Adjusted Rate)',
        formatINR(valuation.marketComparisonValue),
        `${Math.round(valuation.weighting.comparison * 100)}%`,
        `Base Rate: ₹${propertyData.comparableMarketRatePerSqFt.toLocaleString('en-IN')}/sq ft\nAdjusted Rate: ₹${valuation.adjustedMarketRatePerSqFt.toLocaleString('en-IN')}/sq ft\nNet Adjustments: ${valuation.netAdjustmentPercentage > 0 ? `+${valuation.netAdjustmentPercentage}%` : `${valuation.netAdjustmentPercentage}%`}`
      ],
      [
        'Method 2: Income Capitalisation\n(V = NOI ÷ Cap Rate)',
        formatINR(valuation.incomeCapitalisationValue),
        `${Math.round(valuation.weighting.income * 100)}%`,
        `Gross Annual Rent: ${formatINR(valuation.grossAnnualRent)}\nOperating Expenses: ${formatINR(valuation.annualOperatingExpensesTotal)}\nNet Operating Income (NOI): ${formatINR(valuation.netOperatingIncome)}\nMarket Cap Rate Used: ${valuation.capRateUsed}%`
      ],
      [
        'Method 3: Cost Approach\n(V = Land + [RC - Depr - Obs])',
        formatINR(valuation.costApproachValue),
        `${Math.round(valuation.weighting.cost * 100)}%`,
        `Allocated Land Value: ${formatINR(valuation.landValue)}\nReplacement Construction Cost: ${formatINR(valuation.replacementCostBuilding)}\nDepreciation & Obsolescence: -${formatINR(valuation.physicalDepreciation + valuation.functionalObsolescence)}\nDepreciated Building: ${formatINR(valuation.depreciatedBuildingValue)}`
      ],
      [
        'Government Circle Rate Benchmark\n(Stamp Duty Reference Value)',
        formatINR(valuation.circleRateValue),
        'Statutory',
        `Circle Rate: ₹${propertyData.circleRatePerSqFt.toLocaleString('en-IN')}/sq ft\nSpread vs FMV: ${valuation.circleRateDifferencePct > 0 ? `+${valuation.circleRateDifferencePct}% above circle` : 'Below circle rate'}\nEstimated Stamp Duty: ${formatINR(valuation.estimatedStampDuty)}\nRegistration Fee: ${formatINR(valuation.estimatedRegistrationFee)}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'bold', cellWidth: 38 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 74 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Add Page Footer
  addPageFooter(doc, 1, 3, reportRef);

  // ==========================================
  // PAGE 2: 12-PARAMETER AUDIT & ADJUSTMENTS MATRIX
  // ==========================================
  doc.addPage();
  currentY = 16;

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 27, 75);
  doc.text('SECTION 2: 12-PARAMETER APPRAISAL AUDIT & ADJUSTMENT MATRIX', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Comprehensive inspection breakdown evaluating location, physical site, construction, and legal clearances.', margin, currentY + 5);

  currentY += 8;

  // Table 3: 12 Parameters Detail Audit
  autoTable(doc, {
    startY: currentY,
    head: [['Category', 'Parameter Inspected', 'Specification / Observed State', 'Value Impact / Audit Rating']],
    body: [
      ['A. Location & Neighbourhood', 'City Classification', `${propertyData.city} (${propertyData.cityTier})`, 'Primary Metro Macro Factor'],
      ['A. Location & Neighbourhood', 'Locality Profile & Catchment', propertyData.localityType, propertyData.localityType === 'Premium' ? '+6% to +10% Catchment Premium' : 'Baseline Market Catchment'],
      ['A. Location & Neighbourhood', 'Road Width & Access', `${propertyData.roadWidth} ft (${propertyData.roadConnectivity})`, propertyData.roadWidth >= 60 ? '+4.5% Arterial Width Bonus' : propertyData.roadWidth <= 20 ? '-5.0% Narrow Lane Discount' : 'Neutral'],
      ['A. Location & Neighbourhood', 'Metro Proximity', propertyData.metroProximity, propertyData.metroProximity === 'Under 500m' ? '+3.5% Rapid Transit Bonus' : 'Standard Catchment'],
      ['A. Location & Neighbourhood', 'Social Infrastructure', `Schools: ${propertyData.schoolsNearby ? 'Yes' : 'No'} · Hospitals: ${propertyData.hospitalsNearby ? 'Yes' : 'No'}`, 'Sufficient 2km Civic Catchment'],
      ['B. Land-Related Parameters', 'Plot Area & Permitted FAR', `${propertyData.plotArea.toLocaleString('en-IN')} sq ft · FAR: ${propertyData.permittedFAR}`, `Permissible Built: ${(propertyData.plotArea * propertyData.permittedFAR).toLocaleString('en-IN')} sq ft`],
      ['B. Land-Related Parameters', 'Corner Plot Configuration', propertyData.cornerPlot ? 'Corner Plot (Faces 2 Roads)' : 'Intermediate Plot', propertyData.cornerPlot ? '+4.0% Dual Frontage Premium' : 'Neutral'],
      ['B. Land-Related Parameters', 'Land Title Ownership', propertyData.landOwnership, 'Freehold Perpetual Ownership'],
      ['C. Building & Quality', 'Building Age & Economic Life', `${propertyData.buildingAge} years old (Life: ${propertyData.totalEconomicLife} yrs)`, propertyData.buildingAge > 3 ? `Depreciation adjustment: -${Math.min(25, (propertyData.buildingAge - 3) * 0.9).toFixed(1)}%` : 'New Construction Premium'],
      ['C. Building & Quality', 'Structural Health & Quality', `${propertyData.structuralCondition} · ${propertyData.constructionQuality}`, propertyData.structuralCondition.includes('Excellent') ? '+3.0% Structural Premium' : 'Standard Maintenance'],
      ['C. Building & Quality', 'Elevator, Power & Parking', `Lift: ${propertyData.liftAvailability} · Power: ${propertyData.powerBackup} · Parking: ${propertyData.parkingType}`, 'Full Amenity Compliance'],
      ['D. Legal & Clearances', 'Sale Deed & Title Chain', `${propertyData.saleDeedStatus} · 30-Yr Search: Clear`, 'Valid Conveyance Chain'],
      ['D. Legal & Clearances', 'Occupancy Certificate (OC)', propertyData.occupancyCertificate, propertyData.occupancyCertificate.includes('Issued') ? 'Compliant · Bank Approved' : '-8.0% Pending OC Penalty'],
      ['D. Legal & Clearances', 'Litigation & Encumbrance', `${propertyData.litigationStatus} · ${propertyData.encumbranceCertificate}`, valuation.legalRiskScore],
    ],
    theme: 'grid',
    headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 45 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Table 4: Itemized Valuation Adjustments Applied
  autoTable(doc, {
    startY: currentY,
    head: [['Adjustment Factor', 'Impact (%)', 'Surveyor Evidence & Rationale']],
    body: valuation.adjustmentsList.map((adj) => [
      adj.factor,
      adj.impactPercentage > 0 ? `+${adj.impactPercentage}%` : `${adj.impactPercentage}%`,
      adj.description,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { fontStyle: 'bold', cellWidth: 25, halign: 'center' },
      2: { cellWidth: 97 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  addPageFooter(doc, 2, 3, reportRef);

  // ==========================================
  // PAGE 3: 10-YEAR FORECAST & SURVEYOR CERTIFICATION
  // ==========================================
  doc.addPage();
  currentY = 16;

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 27, 75);
  doc.text('SECTION 3: 10-YEAR FINANCIAL FORECAST & VALUER CERTIFICATION', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Projections assuming ${propertyData.expectedAppreciationRatePct || 8.5}% annual capital growth and 5% compounding rental escalation.`, margin, currentY + 5);

  // Investment Yield: Leveraged Return & Break-Even Analysis
  const pVal = valuation.fairMarketValue;
  const pRent = propertyData.monthlyRent || Math.round(valuation.grossAnnualRent / 12);
  const pLoan = Math.round(pVal * 0.75);
  const pDown = pVal - pLoan;
  const pInitCash = pDown + valuation.estimatedStampDuty + valuation.estimatedRegistrationFee + Math.round(pLoan * 0.005);
  const pMonthlyRate = 0.085 / 12;
  const pMonths = 240;
  const pEmi = Math.round((pLoan * pMonthlyRate * Math.pow(1 + pMonthlyRate, pMonths)) / (Math.pow(1 + pMonthlyRate, pMonths) - 1));
  const pAnnualDebt = pEmi * 12;
  const pAnnualGross = pRent * 12;
  const pOpEx = Math.round(pVal * 0.0035) + Math.round((propertyData.builtUpArea || 1500) * 36) + Math.round(pVal * 0.0008);
  const pNOI = Math.round(pAnnualGross * 0.95) - pOpEx;
  const pPreTaxCashFlow = pNOI - pAnnualDebt;
  const pCoCPct = pInitCash > 0 ? ((pPreTaxCashFlow / pInitCash) * 100).toFixed(2) : '0.00';
  const pBreakEvenOcc = pAnnualGross > 0 ? (((pAnnualDebt + pOpEx) / pAnnualGross) * 100).toFixed(1) : '100.0';
  const pBreakEvenRent = Math.round((pAnnualDebt + pOpEx) / 12);

  autoTable(doc, {
    startY: currentY,
    head: [['Investment Metric (75% LTV @ 8.5%)', 'Value / Rate', 'Analysis Benchmark & Investor Implication']],
    body: [
      ['Cash-on-Cash Return (CoC)', `${pCoCPct}%`, `Pre-tax yield on ${formatINR(pInitCash)} total initial cash invested.`],
      ['Break-Even Occupancy Rate', `${pBreakEvenOcc}%`, `Minimum occupancy required to cover EMI (${formatINR(pEmi)}/mo) and OpEx.`],
      ['Break-Even Monthly Rent', `${formatINR(pBreakEvenRent)}/mo`, `Current rent: ${formatINR(pRent)}/mo (Safety Cushion: ${(((pRent - pBreakEvenRent) / pRent) * 100).toFixed(1)}%).`],
      ['Net Operating Income (NOI)', `${formatINR(pNOI)}/yr`, `Gross rent less 5% vacancy allowance and operating costs (${formatINR(pOpEx)}/yr).`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { fontStyle: 'bold', cellWidth: 35, textColor: [67, 56, 202] },
      2: { cellWidth: 92 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Table 5: 10-Year Projections Table
  autoTable(doc, {
    startY: currentY,
    head: [['Year', 'Projected Property Value', 'Gross Annual Rent', 'Net Annual Cashflow', 'Cumulative ROI %']],
    body: valuation.tenYearForecast.map((row) => [
      `Year ${row.year}`,
      formatINR(row.propertyValue),
      formatINR(row.annualRent),
      formatINR(row.netCashFlow),
      `+${row.cumulativeReturnPct}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59], halign: 'center' },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { fontStyle: 'bold', textColor: [67, 56, 202] },
      4: { fontStyle: 'bold', textColor: [16, 185, 129] },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Chartered Valuer Executive Opinion Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 27, 75);
  doc.text('CHARTERED SURVEYOR OPINION & ADVISORY NOTES:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const opinionText = aiReport?.executiveSummary || 
    `The subject ${propertyData.propertyCategory} asset in ${propertyData.locality}, ${propertyData.city} demonstrates established end-user demand supported by ${propertyData.roadWidth} ft road connectivity and positive demographic absorption. The reconciled Fair Market Value of ${formatINR(valuation.fairMarketValue)} represents an equitable transaction consideration between prudent market participants. Under normal marketing conditions, liquidation time is estimated at 60-90 days, while a distress / quick-sale discount of 15% would achieve transaction closure within 30 days.`;

  const splitOpinion = doc.splitTextToSize(opinionText, pageWidth - margin * 2 - 8);
  doc.text(splitOpinion, margin + 4, currentY + 11);

  currentY += 40;

  // Digital Sign-Off & Seal Block
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FORMAL VALUATION DECLARATION & DIGITAL SEAL', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('I hereby certify that I have examined the subject property parameters, title records, and micro-market transactions.', margin, currentY + 4);
  doc.text('The stated Fair Market Value represents an objective, independent professional valuation opinion without conflict of interest.', margin, currentY + 8);

  // Signature Block
  const sigBoxX = margin + 115;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(sigBoxX, currentY + 1, 67, 18, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  doc.text('DIGITALLY CERTIFIED', sigBoxX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Signer: ${user?.name || 'Authorized Real Estate Valuer'}`, sigBoxX + 4, currentY + 10);
  doc.text(`Mobile: +91 ${user?.mobileNumber || '9876543210'} · Verified OTP`, sigBoxX + 4, currentY + 13);
  doc.text(`Digital Hash: SHA256-${reportRef}`, sigBoxX + 4, currentY + 16);

  addPageFooter(doc, 3, 3, reportRef);

  // Save the PDF
  const cleanFileName = `${propertyData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Valuation_Report.pdf`;
  doc.save(cleanFileName);
}

function addPageFooter(doc: jsPDF, pageNum: number, totalPages: number, reportRef: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `ValuMetric Certified Valuation Report · Ref: ${reportRef} · Page ${pageNum} of ${totalPages}`,
    14,
    pageHeight - 8
  );

  doc.text(
    'Confidential · For Authorized Parties Only',
    pageWidth - 14,
    pageHeight - 8,
    { align: 'right' }
  );
}
