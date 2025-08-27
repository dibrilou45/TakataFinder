import { TakataRecall, TakataStatus } from '@/types';

// Keywords to detect Takata-related recalls
const TAKATA_KEYWORDS = /(takata|psan|psdi|inflator|air ?bag inflator|rupture|explode)/i;

// Keywords to detect Stop Drive severity
const STOP_DRIVE_KEYWORDS = /(do not drive|stop drive|ne pas conduire|danger)/i;

/**
 * Classifies recalls to determine Takata impact and severity
 */
export function classifyTakataStatus(recalls: TakataRecall[]): TakataStatus {
  const takataRecalls = recalls.filter(recall => 
    TAKATA_KEYWORDS.test(`${recall.component} ${recall.summary} ${recall.remedy}`)
  );

  if (takataRecalls.length === 0) {
    return {
      impacted: false,
      severity: 'green',
      recalls: []
    };
  }

  // Check for Stop Drive severity
  const hasStopDrive = takataRecalls.some(recall =>
    STOP_DRIVE_KEYWORDS.test(`${recall.summary} ${recall.remedy}`)
  );

  return {
    impacted: true,
    severity: hasStopDrive ? 'red' : 'yellow',
    recalls: takataRecalls
  };
}

/**
 * Generates advice based on Takata status
 */
export function generateAdvice(severity: 'green' | 'yellow' | 'red', make: string): string {
  switch (severity) {
    case 'red':
      return "Ne conduisez pas ce véhicule. Contactez immédiatement le constructeur.";
    case 'yellow':
      return "Prenez rendez-vous avec votre constructeur pour le remplacement gratuit de l'airbag.";
    case 'green':
    default:
      return "Aucun rappel Takata détecté pour ce véhicule. Vérifiez régulièrement les rappels constructeur.";
  }
}

/**
 * Validates French license plate format
 */
export function validateFrenchPlate(plate: string): boolean {
  // Format: AA-123-AA or AA123AA
  const frenchPattern = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/;
  return frenchPattern.test(plate.toUpperCase().replace(/\s/g, ''));
}

/**
 * Validates US license plate format (simplified)
 */
export function validateUSPlate(plate: string): boolean {
  // Simplified US format validation (varies by state)
  const usPattern = /^[A-Z0-9]{2,8}$/;
  return usPattern.test(plate.toUpperCase().replace(/[\s-]/g, ''));
}

/**
 * Validates license plate based on country
 */
export function validatePlate(plate: string, country: 'FR' | 'US'): boolean {
  const cleanPlate = plate.trim();
  if (!cleanPlate) return false;

  switch (country) {
    case 'FR':
      return validateFrenchPlate(cleanPlate);
    case 'US':
      return validateUSPlate(cleanPlate);
    default:
      return false;
  }
}

/**
 * Formats license plate for display
 */
export function formatPlate(plate: string, country: 'FR' | 'US'): string {
  const cleanPlate = plate.toUpperCase().replace(/[\s-]/g, '');
  
  if (country === 'FR' && cleanPlate.length === 7) {
    return `${cleanPlate.slice(0, 2)}-${cleanPlate.slice(2, 5)}-${cleanPlate.slice(5, 7)}`;
  }
  
  return cleanPlate;
}
