'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ExternalLink } from 'lucide-react';
import { AffectedVehicle } from '@/types';

// Mock data for affected vehicles (as per spec)
const AFFECTED_VEHICLES: AffectedVehicle[] = [
  { make: 'BMW', model: 'Série 3', years: '2000-2006', status: 'stop-drive' },
  { make: 'BMW', model: 'X5', years: '2007-2012', status: 'recall' },
  { make: 'Honda', model: 'Civic', years: '2001-2005', status: 'stop-drive' },
  { make: 'Honda', model: 'Accord', years: '2003-2007', status: 'recall' },
  { make: 'Honda', model: 'CR-V', years: '2002-2006', status: 'recall' },
  { make: 'Toyota', model: 'Corolla', years: '2003-2008', status: 'recall' },
  { make: 'Toyota', model: 'RAV4', years: '2006-2012', status: 'recall' },
  { make: 'Nissan', model: 'Sentra', years: '2007-2012', status: 'recall' },
  { make: 'Nissan', model: 'Altima', years: '2002-2006', status: 'stop-drive' },
  { make: 'Mazda', model: 'RX-8', years: '2004-2008', status: 'recall' },
  { make: 'Mazda', model: 'Mazda6', years: '2003-2008', status: 'recall' },
  { make: 'Subaru', model: 'Legacy', years: '2005-2009', status: 'recall' },
  { make: 'Subaru', model: 'Outback', years: '2005-2009', status: 'recall' },
  { make: 'Ford', model: 'Ranger', years: '2004-2006', status: 'stop-drive' },
  { make: 'Ford', model: 'Mustang', years: '2005-2014', status: 'recall' },
  { make: 'Chrysler', model: '300', years: '2005-2010', status: 'recall' },
  { make: 'Dodge', model: 'Charger', years: '2006-2010', status: 'recall' },
  { make: 'Mitsubishi', model: 'Lancer', years: '2004-2007', status: 'recall' },
  { make: 'Acura', model: 'TL', years: '2002-2003', status: 'stop-drive' },
  { make: 'Acura', model: 'CL', years: '2001-2003', status: 'stop-drive' },
];

interface AffectedTableProps {
  onCheckPlate?: (make: string, model: string) => void;
}

export function AffectedTable({ onCheckPlate }: AffectedTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('all');

  const uniqueMakes = useMemo(() => {
    const makes = Array.from(new Set(AFFECTED_VEHICLES.map(v => v.make))).sort();
    return makes;
  }, []);

  const filteredVehicles = useMemo(() => {
    return AFFECTED_VEHICLES.filter(vehicle => {
      const matchesSearch = searchTerm === '' || 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMake = selectedMake === 'all' || vehicle.make === selectedMake;
      
      return matchesSearch && matchesMake;
    });
  }, [searchTerm, selectedMake]);

  const getStatusBadge = (status: AffectedVehicle['status']) => {
    switch (status) {
      case 'stop-drive':
        return <Badge variant="destructive">🔴 Stop Drive</Badge>;
      case 'recall':
        return <Badge variant="secondary">🟡 Rappel</Badge>;
      case 'to-confirm':
        return <Badge variant="outline">⚪ À confirmer</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Véhicules concernés par les rappels Takata</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Liste indicative. Vérifiez par plaque/VIN pour confirmation.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par marque ou modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedMake} onValueChange={setSelectedMake}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les marques</SelectItem>
                {uniqueMakes.map(make => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredVehicles.length} véhicule(s) trouvé(s)
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Constructeur</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Années</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucun véhicule trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <TableRow key={`${vehicle.make}-${vehicle.model}-${index}`}>
                    <TableCell className="font-medium">{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.years}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCheckPlate?.(vehicle.make, vehicle.model)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Vérifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> Cette liste est indicative et non exhaustive. 
            Pour une vérification précise, utilisez toujours la recherche par plaque d'immatriculation. 
            Les rappels peuvent évoluer et certains véhicules peuvent avoir été réparés.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
