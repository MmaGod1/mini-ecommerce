export const COUNTRIES = ["Nigeria", "Ghana", "Cameroon"] as const;

export const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory",
];

export const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];

export const CAMEROON_REGIONS = [
  "Adamawa", "Centre", "East", "Far North", "Littoral", "North", "North-West", "South", "South-West", "West",
];

export function statesForCountry(country: string): string[] {
  if (country === "Ghana") return GHANA_REGIONS;
  if (country === "Cameroon") return CAMEROON_REGIONS;
  return NIGERIA_STATES;
}