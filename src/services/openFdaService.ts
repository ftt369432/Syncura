/**
 * Live openFDA Drug API Service
 * Queries official FDA databases for drug label warnings, food interactions,
 * and contraindications.
 */

export interface OpenFdaDrugLabel {
  brandName?: string;
  genericName?: string;
  warnings?: string[];
  foodInteractions?: string[];
  dosageAndAdministration?: string[];
  contraindications?: string[];
}

export class OpenFdaService {
  private static BASE_URL = 'https://api.fda.gov/drug/label.json';

  /**
   * Fetches official FDA labeling information for a drug by generic or brand name
   */
  static async fetchDrugLabel(drugName: string): Promise<OpenFdaDrugLabel | null> {
    try {
      const cleanName = drugName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const query = `openfda.generic_name:"${cleanName}"+openfda.brand_name:"${cleanName}"`;
      const url = `${this.BASE_URL}?search=${encodeURIComponent(query)}&limit=1`;

      const response = await fetch(url);
      if (!response.ok) {
        // Fallback to broader wildcard search
        const fallbackUrl = `${this.BASE_URL}?search=openfda.substance_name:${encodeURIComponent(cleanName)}&limit=1`;
        const fbRes = await fetch(fallbackUrl);
        if (!fbRes.ok) return null;
        const fbData = await fbRes.json();
        return this.parseLabelResult(fbData.results?.[0]);
      }

      const data = await response.json();
      return this.parseLabelResult(data.results?.[0]);
    } catch (error) {
      console.warn('OpenFDA label lookup error:', error);
      return null;
    }
  }

  private static parseLabelResult(result: any): OpenFdaDrugLabel | null {
    if (!result) return null;

    return {
      brandName: result.openfda?.brand_name?.[0],
      genericName: result.openfda?.generic_name?.[0],
      warnings: result.warnings || result.warnings_and_cautions,
      foodInteractions: result.food_safety_warning || result.information_for_patients,
      dosageAndAdministration: result.dosage_and_administration,
      contraindications: result.contraindications,
    };
  }
}
