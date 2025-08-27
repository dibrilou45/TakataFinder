'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Search } from 'lucide-react';
import { validatePlate, formatPlate } from '@/lib/takata';
import { PlateCheckRequest, PlateCheckResponse, PlateCheckError } from '@/types';

interface PlateFormProps {
  onResult: (result: PlateCheckResponse | PlateCheckError) => void;
  onLoading: (loading: boolean) => void;
}

export function PlateForm({ onResult, onLoading }: PlateFormProps) {
  const [plate, setPlate] = useState('');
  const [country, setCountry] = useState<'FR' | 'US'>('FR');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!plate.trim()) {
      setError('Veuillez saisir une plaque d\'immatriculation');
      return;
    }

    if (!validatePlate(plate, country)) {
      setError(country === 'FR' 
        ? 'Format invalide. Exemple: AA-123-AA' 
        : 'Format invalide. Exemple: ABC1234'
      );
      return;
    }

    if (!consent) {
      setError('Vous devez confirmer être autorisé à vérifier ce véhicule');
      return;
    }

    onLoading(true);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plate: plate.trim(),
          country
        } as PlateCheckRequest),
      });

      const data = await response.json();
      onResult(data);
    } catch (error) {
      onResult({ error: 'UPSTREAM_UNAVAILABLE' });
    } finally {
      onLoading(false);
    }
  };

  const handlePlateChange = (value: string) => {
    setPlate(value);
    setError('');
  };

  const getPlaceholder = () => {
    return country === 'FR' ? 'AA-123-AA' : 'ABC1234';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium">
              Pays
            </label>
            <Select value={country} onValueChange={(value: 'FR' | 'US') => setCountry(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">🇫🇷 France</SelectItem>
                <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="plate" className="text-sm font-medium">
              Plaque d'immatriculation
            </label>
            <Input
              id="plate"
              type="text"
              placeholder={getPlaceholder()}
              value={plate}
              onChange={(e) => handlePlateChange(e.target.value)}
              className="uppercase"
              maxLength={country === 'FR' ? 9 : 8}
            />
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-xs text-gray-600">
              Je suis propriétaire ou autorisé à vérifier ce véhicule
            </label>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!consent}>
            <Search className="h-4 w-4 mr-2" />
            Vérifier la sécurité
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
