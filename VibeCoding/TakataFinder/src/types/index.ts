export interface PlateCheckRequest {
  plate: string;
  country: 'FR' | 'US';
}

export interface TakataRecall {
  id: string;
  date: string;
  component: string;
  summary: string;
  remedy: string;
  source: 'CarsXE' | 'Public';
}

export interface TakataStatus {
  impacted: boolean;
  severity: 'green' | 'yellow' | 'red';
  recalls: TakataRecall[];
}

export interface NextSteps {
  manufacturerUrl?: string;
  advice: string;
}

export interface PlateCheckResponse {
  status: 'ok';
  vin: string;
  make: string;
  model: string;
  year: number;
  takata: TakataStatus;
  nextSteps: NextSteps;
}

export interface PlateCheckError {
  error: 'INVALID_PLATE' | 'VIN_NOT_FOUND' | 'UPSTREAM_UNAVAILABLE';
}

export interface CarsXEPlateResponse {
  success: boolean;
  data?: {
    vin?: string;
    make?: string;
    model?: string;
    year?: string;
    engine?: string;
    fuel?: string;
    // Format français SIV
    marque?: string;
    modele?: string;
    libelleModele?: string;
    datePremiereMiseCirculation?: string;
    numSerieMoteur?: string;
  };
  message?: string;
}

export interface CarsXERecallResponse {
  success: boolean;
  data?: Array<{
    recall_id: string;
    recall_date: string;
    component: string;
    summary: string;
    remedy: string;
    manufacturer: string;
  }>;
  message?: string;
}

export interface AffectedVehicle {
  make: string;
  model: string;
  years: string;
  status: 'stop-drive' | 'recall' | 'to-confirm';
}

export const MANUFACTURER_URLS: Record<string, string> = {
  'BMW': 'https://www.bmw.fr/fr/topics/owners/service/recall.html',
  'Mercedes-Benz': 'https://www.mercedes-benz.fr/passions/innovation-et-technologie/securite/rappels.html',
  'Audi': 'https://www.audi.fr/fr/web/fr/customer-area/service-maintenance/recall.html',
  'Volkswagen': 'https://www.volkswagen.fr/fr/service-client/rappels.html',
  'Peugeot': 'https://www.peugeot.fr/univers-peugeot/services/rappels-constructeur.html',
  'Citroën': 'https://www.citroen.fr/univers-citroen/services/rappels-constructeur.html',
  'Renault': 'https://www.renault.fr/services/rappels-constructeur.html',
  'Toyota': 'https://www.toyota.fr/service-client/rappels',
  'Honda': 'https://www.honda.fr/cars/owners/recalls.html',
  'Nissan': 'https://www.nissan.fr/proprietaires/service-entretien/rappels.html',
  'Ford': 'https://www.ford.fr/support/recalls',
  'Opel': 'https://www.opel.fr/outils/rappels-produits.html',
  'Mazda': 'https://www.mazda.fr/proprietaires/service-apres-vente/rappels/',
  'Subaru': 'https://www.subaru.fr/service-client/rappels-constructeur',
  'Mitsubishi': 'https://www.mitsubishi-motors.fr/service-client/rappels-constructeur',
};
