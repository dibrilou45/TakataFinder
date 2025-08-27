import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';
import { 
  PlateCheckRequest, 
  PlateCheckResponse, 
  PlateCheckError,
  CarsXEPlateResponse,
  CarsXERecallResponse,
  TakataRecall,
  MANUFACTURER_URLS 
} from '@/types';
import { 
  validatePlate, 
  classifyTakataStatus, 
  generateAdvice 
} from '@/lib/takata';

const PlateCheckSchema = z.object({
  plate: z.string().min(1, 'Plaque requise'),
  country: z.enum(['FR', 'US'], { message: 'Pays non supporté' })
});

const CARSXE_BASE_URL = 'https://api.carsxe.com/v2';
const API_KEY = process.env.CARSXE_API_KEY;
const MOCK_MODE = process.env.MOCK_MODE;

if (!API_KEY && MOCK_MODE !== 'true' && MOCK_MODE !== 'hybrid') {
  console.error('CARSXE_API_KEY not configured');
}

// Rate limiting (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '5');

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// Mock data for testing
const MOCK_VEHICLES = {
  'AA123BB': { vin: 'VF7XXXXXXXXXXXXXXX', make: 'Honda', model: 'Civic', year: 2004 },
  'BB456CC': { vin: 'WBXXXXXXXXXXXXXXXX', make: 'BMW', model: 'Série 3', year: 2003 },
  'CC789DD': { vin: 'JTXXXXXXXXXXXXXXXX', make: 'Toyota', model: 'Corolla', year: 2005 },
  'ABC1234': { vin: '1HXXXXXXXXXXXXXXXX', make: 'Honda', model: 'Accord', year: 2006 },
  'DEF5678': { vin: '5NXXXXXXXXXXXXXXXX', make: 'Nissan', model: 'Altima', year: 2004 }
};

const MOCK_RECALLS = {
  'VF7XXXXXXXXXXXXXXX': [
    {
      recall_id: 'NHTSA-2024-001',
      recall_date: '2024-05-15',
      component: 'Driver airbag inflator',
      summary: 'Takata airbag inflator may rupture during deployment, causing metal fragments to be propelled.',
      remedy: 'Replace airbag inflator. Contact Honda dealer immediately.',
      manufacturer: 'Honda'
    }
  ],
  'WBXXXXXXXXXXXXXXXX': [
    {
      recall_id: 'BMW-2024-002',
      recall_date: '2024-03-10',
      component: 'Passenger airbag inflator',
      summary: 'Do not drive - Takata inflator rupture risk. Stop driving immediately.',
      remedy: 'Replace airbag inflator immediately. Vehicle should not be driven.',
      manufacturer: 'BMW'
    }
  ],
  'JTXXXXXXXXXXXXXXXX': [
    {
      recall_id: 'TOYOTA-2024-003',
      recall_date: '2024-04-20',
      component: 'Side airbag inflator',
      summary: 'Takata airbag inflator recall - schedule replacement.',
      remedy: 'Replace airbag inflator at Toyota dealer.',
      manufacturer: 'Toyota'
    }
  ]
};

async function getVINFromPlate(plate: string, country: string): Promise<{
  vin: string;
  make: string;
  model: string;
  year: number;
}> {
  if (!API_KEY) {
    throw new Error('API configuration missing');
  }

  try {
    console.log(`Calling CarsXE API for plate: ${plate}, country: ${country}`);
    
    const response = await axios.get<CarsXEPlateResponse>(
      `${CARSXE_BASE_URL}/platedecoder`,
      {
        params: {
          key: API_KEY,
          plate: plate,
          state: country === 'FR' ? 'FR' : 'CA', // FR pour France, CA pour États-Unis (Californie par défaut)
          country: country.toLowerCase()
        },
        timeout: 10000
      }
    );

    console.log('CarsXE Response:', JSON.stringify(response.data, null, 2));

    if (!response.data.success) {
      console.error('CarsXE API returned success: false');
      throw new Error('VIN_NOT_FOUND');
    }

    // Pour les plaques françaises, toutes les données sont directement dans response.data
    const vehicleData = response.data as any;
    
    console.log('Vehicle data extracted:', vehicleData);
    
    // Vérifier si on a les champs essentiels - pour les plaques françaises, le VIN est dans extended_information
    const extendedInfo = vehicleData.extended_information || {};
    const vin = vehicleData.vin || extendedInfo.numSerieMoteur || '';
    const make = vehicleData.make || extendedInfo.marque || '';
    const model = vehicleData.model || extendedInfo.modele || extendedInfo.libelleModele || '';
    
    console.log('Extracted vehicle info:', { vin, make, model });
    
    if (!vin) {
      console.error('No VIN found in response');
      throw new Error('VIN_NOT_FOUND');
    }
    
    let year: number = 0;
    if (vehicleData.registration_year) {
      year = parseInt(vehicleData.registration_year);
    } else if (vehicleData.year) {
      year = parseInt(vehicleData.year);
    } else if (extendedInfo.datePremiereMiseCirculation) {
      // Format: DDMMYYYY -> extraire YYYY
      year = parseInt(extendedInfo.datePremiereMiseCirculation.slice(-4));
    } else if (extendedInfo.anneeSortie) {
      year = parseInt(extendedInfo.anneeSortie);
    }
    
    if (!vin || !make || !model || !year) {
      console.error('Missing required vehicle data:', { vin, make, model, year });
      throw new Error('VIN_NOT_FOUND');
    }
    
    return {
      vin,
      make,
      model,
      year
    };
  } catch (error: any) {
    console.error('CarsXE API Error:', error.message);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('UPSTREAM_UNAVAILABLE');
    }
    throw new Error('VIN_NOT_FOUND');
  }
}

async function getRecallsFromVIN(vin: string): Promise<TakataRecall[]> {
  if (!API_KEY) {
    console.log('No API key, returning empty recalls');
    return [];
  }

  try {
    console.log(`Calling CarsXE Recalls API for VIN: ${vin}`);
    
    const response = await axios.get<CarsXERecallResponse>(
      `${CARSXE_BASE_URL}/recalls`,
      {
        params: {
          key: API_KEY,
          vin: vin
        },
        timeout: 10000
      }
    );

    console.log('CarsXE Recalls Response:', JSON.stringify(response.data, null, 2));

    if (!response.data.success) {
      console.log('CarsXE Recalls API returned success: false', response.data.message);
      return [];
    }

    if (!response.data.data || response.data.data.length === 0) {
      console.log('No recalls found for this VIN');
      return [];
    }

    const recalls = response.data.data.map(recall => ({
      id: recall.recall_id,
      date: recall.recall_date,
      component: recall.component,
      summary: recall.summary,
      remedy: recall.remedy,
      source: 'CarsXE' as const
    }));

    console.log(`Found ${recalls.length} recalls`);
    return recalls;
  } catch (error: any) {
    console.error('Error fetching recalls:', error.message);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = PlateCheckSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_PLATE' },
        { status: 400 }
      );
    }

    const { plate, country } = validation.data;

    // Validate plate format
    if (!validatePlate(plate, country)) {
      return NextResponse.json(
        { error: 'INVALID_PLATE' },
        { status: 400 }
      );
    }

    try {
      // Get VIN from plate
      const vehicleInfo = await getVINFromPlate(plate, country);
      
      // Get recalls for VIN
      const recalls = await getRecallsFromVIN(vehicleInfo.vin);
      
      // Classify Takata status
      const takataStatus = classifyTakataStatus(recalls);
      
      // Generate advice and manufacturer URL
      const advice = generateAdvice(takataStatus.severity, vehicleInfo.make);
      const manufacturerUrl = MANUFACTURER_URLS[vehicleInfo.make];

      const response: PlateCheckResponse = {
        status: 'ok',
        vin: vehicleInfo.vin,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        takata: takataStatus,
        nextSteps: {
          manufacturerUrl,
          advice
        }
      };

      return NextResponse.json(response);

    } catch (error: any) {
      console.error('API Error:', error.message);
      
      if (error.message === 'VIN_NOT_FOUND') {
        return NextResponse.json(
          { error: 'VIN_NOT_FOUND' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'UPSTREAM_UNAVAILABLE' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'UPSTREAM_UNAVAILABLE' },
      { status: 503 }
    );
  }
}
