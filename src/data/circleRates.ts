export interface CityCircleData {
  city: string;
  state: string;
  tier: 'Metro' | 'Tier 1' | 'Tier 2';
  guidanceSystem: string;
  stampDutyPct: number;
  registrationFeePct: number;
  localities: {
    name: string;
    category: string;
    circleRatePerSqFt: number;
    commercialMultiplier: number;
    averageMarketRatePerSqFt: number;
  }[];
}

export const INDIAN_CITIES_CIRCLE_DATA: Record<string, CityCircleData> = {
  'Delhi': {
    city: 'Delhi',
    state: 'NCT of Delhi',
    tier: 'Metro',
    guidanceSystem: 'Delhi Revenue Department Categorized Circle Rates (Categories A to H)',
    stampDutyPct: 6.0, // 4% for women, 6% for men
    registrationFeePct: 1.0,
    localities: [
      { name: 'Vasant Vihar / Golf Links / Jor Bagh', category: 'Category A', circleRatePerSqFt: 71900, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 85000 },
      { name: 'Greater Kailash / South Extension / Defence Colony', category: 'Category B', circleRatePerSqFt: 22800, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 32000 },
      { name: 'Vasant Kunj / Saket / Punjabi Bagh', category: 'Category C', circleRatePerSqFt: 14850, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 21000 },
      { name: 'Dwarka / Janakpuri / Preet Vihar', category: 'Category D', circleRatePerSqFt: 11880, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 15500 },
      { name: 'Rohini Sector 1-15 / Laxmi Nagar', category: 'Category E', circleRatePerSqFt: 6510, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 9200 },
      { name: 'Uttam Nagar / Dilshad Garden', category: 'Category F', circleRatePerSqFt: 5260, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 7100 },
      { name: 'Najafgarh / Narela Industrial', category: 'Category G', circleRatePerSqFt: 4320, commercialMultiplier: 3.0, averageMarketRatePerSqFt: 5800 },
    ],
  },
  'Mumbai': {
    city: 'Mumbai',
    state: 'Maharashtra',
    tier: 'Metro',
    guidanceSystem: 'IGR Maharashtra Annual Statement of Rates (Ready Reckoner)',
    stampDutyPct: 6.0, // 5% + 1% Metro Cess
    registrationFeePct: 1.0,
    localities: [
      { name: 'BKC (Bandra Kurla Complex)', category: 'CBD Commercial', circleRatePerSqFt: 42000, commercialMultiplier: 1.8, averageMarketRatePerSqFt: 55000 },
      { name: 'Bandra West / Khar West', category: 'Prime Residential', circleRatePerSqFt: 36500, commercialMultiplier: 1.6, averageMarketRatePerSqFt: 52000 },
      { name: 'Andheri East / Vikhroli (Embassy 247)', category: 'Commercial Corridor', circleRatePerSqFt: 14200, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 19500 },
      { name: 'Powai / Kanjurmarg', category: 'Developed Residential', circleRatePerSqFt: 16800, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 24000 },
      { name: 'Goregaon / Malad Link Road', category: 'Suburban Growth', circleRatePerSqFt: 13500, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 18000 },
    ],
  },
  'Bengaluru': {
    city: 'Bengaluru',
    state: 'Karnataka',
    tier: 'Metro',
    guidanceSystem: 'Kaveri 2.0 Department of Stamps and Registration Guidance Value',
    stampDutyPct: 5.6,
    registrationFeePct: 2.0,
    localities: [
      { name: 'Indiranagar / Koramangala 3rd Block', category: 'Prime Mixed-Use', circleRatePerSqFt: 13500, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 19000 },
      { name: 'Whitefield / Outer Ring Road (ORR)', category: 'Tech Corridor', circleRatePerSqFt: 7200, commercialMultiplier: 1.6, averageMarketRatePerSqFt: 11500 },
      { name: 'Electronic City Phase 1', category: 'IT Hub', circleRatePerSqFt: 4800, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 7200 },
      { name: 'Hebbal / Bellary Road', category: 'Airport Corridor', circleRatePerSqFt: 8400, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 13000 },
    ],
  },
  'Hyderabad': {
    city: 'Hyderabad',
    state: 'Telangana',
    tier: 'Metro',
    guidanceSystem: 'Telangana Registration & Stamps Department Market Value Rates',
    stampDutyPct: 7.5,
    registrationFeePct: 0.5,
    localities: [
      { name: 'Hitec City / Madhapur / Gachibowli', category: 'IT Financial District', circleRatePerSqFt: 6200, commercialMultiplier: 1.6, averageMarketRatePerSqFt: 11000 },
      { name: 'Jubilee Hills / Banjara Hills', category: 'Ultra Luxury Residential', circleRatePerSqFt: 9800, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 18500 },
      { name: 'Quthbullapur (Vajra Lakshmi Nilayam)', category: 'Developed Residential', circleRatePerSqFt: 4200, commercialMultiplier: 1.3, averageMarketRatePerSqFt: 7500 },
      { name: 'Kukatpally / Miyapur', category: 'Dense Urban Cluster', circleRatePerSqFt: 5100, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 8200 },
    ],
  },
  'Chennai': {
    city: 'Chennai',
    state: 'Tamil Nadu',
    tier: 'Metro',
    guidanceSystem: 'TNREGINET Registration Department Guideline Value',
    stampDutyPct: 7.0,
    registrationFeePct: 2.0,
    localities: [
      { name: 'OMR - Old Mahabalipuram Rd (International Tech Park)', category: 'IT Express Corridor', circleRatePerSqFt: 6500, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 9800 },
      { name: 'Sriperumbudur / Oragadam (Kerry Indev Logistics)', category: 'Industrial & Logistics', circleRatePerSqFt: 2200, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 3800 },
      { name: 'Anna Nagar / Nungambakkam', category: 'Prime CBD', circleRatePerSqFt: 11200, commercialMultiplier: 1.6, averageMarketRatePerSqFt: 16500 },
      { name: 'Velachery / Guindy', category: 'Transit Junction', circleRatePerSqFt: 7800, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 11000 },
    ],
  },
  'Jaipur': {
    city: 'Jaipur',
    state: 'Rajasthan',
    tier: 'Tier 1',
    guidanceSystem: 'DLC Rates - Registration and Stamps Department Rajasthan',
    stampDutyPct: 6.0,
    registrationFeePct: 1.0,
    localities: [
      { name: 'Mansarovar Extension (Shree Vinayak Homes 11)', category: 'Rapid Residential Growth', circleRatePerSqFt: 3800, commercialMultiplier: 1.4, averageMarketRatePerSqFt: 5400 },
      { name: 'C-Scheme / Civil Lines', category: 'Prime Commercial / VIP', circleRatePerSqFt: 9200, commercialMultiplier: 1.7, averageMarketRatePerSqFt: 14000 },
      { name: 'Jagatpura / Mahal Road', category: 'Education & Institutional', circleRatePerSqFt: 3200, commercialMultiplier: 1.3, averageMarketRatePerSqFt: 4600 },
      { name: 'Vaishali Nagar', category: 'Established Retail & Residential', circleRatePerSqFt: 6200, commercialMultiplier: 1.5, averageMarketRatePerSqFt: 9500 },
    ],
  },
};
