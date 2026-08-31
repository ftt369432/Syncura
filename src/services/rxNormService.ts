/**
 * Live NLM RxNorm REST API Service
 * Queries official National Library of Medicine endpoints for drug normalization,
 * NDC validation, and standard RxCUI resolution.
 */

export interface RxNormDrugMatch {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
}

export class RxNormService {
  private static BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

  /**
   * Searches RxNorm for drug concepts matching a medication name
   */
  static async searchDrugByName(drugName: string): Promise<RxNormDrugMatch[]> {
    try {
      const cleanName = encodeURIComponent(drugName.trim());
      const response = await fetch(`${this.BASE_URL}/drugs.json?name=${cleanName}`);
      
      if (!response.ok) {
        throw new Error(`RxNorm request failed: ${response.status}`);
      }

      const data = await response.json();
      const drugGroup = data.drugGroup;

      if (!drugGroup || !drugGroup.conceptGroup) {
        return [];
      }

      const matches: RxNormDrugMatch[] = [];
      for (const group of drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const prop of group.conceptProperties) {
            matches.push({
              rxcui: prop.rxcui,
              name: prop.name,
              synonym: prop.synonym,
              tty: prop.tty,
            });
          }
        }
      }

      return matches;
    } catch (error) {
      console.error('RxNorm search error:', error);
      return [];
    }
  }

  /**
   * Finds RxCUI by National Drug Code (NDC)
   */
  static async findByNDC(ndcCode: string): Promise<string | null> {
    try {
      const cleanNdc = ndcCode.replace(/[^0-9]/g, '');
      const response = await fetch(`${this.BASE_URL}/rxcui.json?idtype=NDC&id=${cleanNdc}`);
      
      if (!response.ok) return null;
      const data = await response.json();
      
      const rxcui = data.idGroup?.rxnormId?.[0];
      return rxcui || null;
    } catch (error) {
      console.error('RxNorm NDC lookup error:', error);
      return null;
    }
  }

  /**
   * Checks for drug-drug interactions between a list of RxCUIs
   */
  static async checkInteractions(rxcuis: string[]): Promise<Array<{ description: string; severity: string }>> {
    if (rxcuis.length < 2) return [];

    try {
      const rxcuiList = rxcuis.join('+');
      const response = await fetch(`${this.BASE_URL}/interaction/list.json?rxcuis=${rxcuiList}`);
      
      if (!response.ok) return [];
      const data = await response.json();

      const interactions: Array<{ description: string; severity: string }> = [];
      const fullInteractionTypeGroup = data.fullInteractionTypeGroup;

      if (fullInteractionTypeGroup) {
        for (const group of fullInteractionTypeGroup) {
          if (group.fullInteractionType) {
            for (const item of group.fullInteractionType) {
              if (item.interactionPair) {
                for (const pair of item.interactionPair) {
                  interactions.push({
                    description: pair.description || 'Interaction detected',
                    severity: pair.severity || 'high',
                  });
                }
              }
            }
          }
        }
      }

      return interactions;
    } catch (error) {
      console.error('RxNorm interaction check error:', error);
      return [];
    }
  }
}
