'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, CheckCircle, AlertCircle, ExternalLink, Phone } from 'lucide-react';
import { PlateCheckResponse, PlateCheckError } from '@/types';

interface ResultCardProps {
  result: PlateCheckResponse | PlateCheckError;
}

export function ResultCard({ result }: ResultCardProps) {
  if ('error' in result) {
    return <ErrorCard error={result.error} />;
  }

  const { takata, make, model, year, vin, nextSteps } = result;
  const { severity, impacted, recalls } = takata;

  const getStatusConfig = () => {
    switch (severity) {
      case 'red':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          badge: 'destructive' as const,
          title: '🔴 STOP DRIVE - Ne pas conduire',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800'
        };
      case 'yellow':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          badge: 'secondary' as const,
          title: '🟡 Rappel Takata détecté',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'green':
      default:
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          badge: 'default' as const,
          title: '🟢 Aucun rappel Takata',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Stop Drive Alert Banner */}
      {severity === 'red' && (
        <div className="bg-red-600 text-white p-4 rounded-lg text-center font-semibold">
          ⚠️ Ne conduisez pas ce véhicule. Contactez immédiatement le constructeur.
        </div>
      )}

      <Card className={`${statusConfig.bgColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-2 ${statusConfig.textColor}`}>
              {statusConfig.icon}
              <span>{statusConfig.title}</span>
            </CardTitle>
            <Badge variant={statusConfig.badge}>
              {impacted ? 'Concerné' : 'Non concerné'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Vehicle Info */}
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Informations du véhicule</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Marque:</span> {make}</div>
              <div><span className="font-medium">Modèle:</span> {model}</div>
              <div><span className="font-medium">Année:</span> {year}</div>
              <div><span className="font-medium">VIN:</span> {vin.slice(0, 8)}***</div>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm">{nextSteps.advice}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {nextSteps.manufacturerUrl && (
              <Button asChild className="flex-1">
                <a href={nextSteps.manufacturerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Site constructeur
                </a>
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Prendre RDV
            </Button>
          </div>

          {/* Recall Details */}
          {recalls.length > 0 && (
            <Accordion type="single" collapsible className="bg-white rounded-lg">
              <AccordionItem value="recalls">
                <AccordionTrigger className="px-4">
                  Détails du rappel ({recalls.length})
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {recalls.map((recall, index) => (
                      <div key={recall.id} className="border-l-4 border-gray-200 pl-4">
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">ID:</span> {recall.id}</div>
                          <div><span className="font-medium">Date:</span> {recall.date}</div>
                          <div><span className="font-medium">Composant:</span> {recall.component}</div>
                          <div><span className="font-medium">Résumé:</span> {recall.summary}</div>
                          <div><span className="font-medium">Remède:</span> {recall.remedy}</div>
                          <div><span className="font-medium">Source:</span> {recall.source}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Footer Disclaimer */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Toujours confirmer sur le site constructeur. Remplacement gratuit.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  const getErrorMessage = () => {
    switch (error) {
      case 'INVALID_PLATE':
        return 'Format de plaque invalide. Vérifiez la saisie.';
      case 'VIN_NOT_FOUND':
        return 'Véhicule non trouvé dans la base CarsXE. Vérifiez la plaque et le pays, ou contactez directement votre constructeur.';
      case 'UPSTREAM_UNAVAILABLE':
        return 'Service CarsXE temporairement indisponible. Réessayez plus tard.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Trop de requêtes. Attendez une minute avant de réessayer.';
      default:
        return 'Une erreur est survenue. Réessayez plus tard.';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-red-50 border-red-200">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
        <p className="text-red-700">{getErrorMessage()}</p>
      </CardContent>
    </Card>
  );
}
