'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlateForm } from '@/components/PlateForm';
import { ResultCard } from '@/components/ResultCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { PlateCheckResponse, PlateCheckError } from '@/types';

export default function Home() {
  const [result, setResult] = useState<PlateCheckResponse | PlateCheckError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResult = (data: PlateCheckResponse | PlateCheckError) => {
    setResult(data);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const resetForm = () => {
    setResult(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TakataFinder</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/vehicules-concernes" className="text-gray-600 hover:text-gray-900">
                Véhicules concernés
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TakataFinder — Vérifiez votre airbag en 10 s
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Entrez votre plaque. On vous dit si votre véhicule est concerné.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Form or Result */}
          {!result ? (
            <div className="space-y-8">
              <PlateForm onResult={handleResult} onLoading={handleLoading} />
              
              {isLoading && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Vérification en cours...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Button onClick={resetForm} variant="outline">
                  Nouvelle vérification
                </Button>
              </div>
              <ResultCard result={result} />
            </div>
          )}

          {/* Benefits Section */}
          {!result && (
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vérification rapide</h3>
                  <p className="text-gray-600">
                    Résultat immédiat en saisissant simplement votre plaque d'immatriculation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sources officielles</h3>
                  <p className="text-gray-600">
                    Données fiables via VIN et bases de rappels constructeurs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sécurité prioritaire</h3>
                  <p className="text-gray-600">
                    Identification des véhicules "Stop Drive" nécessitant un arrêt immédiat
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trust Section */}
          {!result && (
            <div className="bg-white rounded-lg p-8 mt-16">
              <h2 className="text-2xl font-bold text-center mb-6">Sources fiables</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Données techniques</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• API CarsXE pour décodage VIN</li>
                    <li>• Bases de rappels officielles</li>
                    <li>• Mise à jour en temps réel</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Confidentialité</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Aucune conservation des plaques</li>
                    <li>• Traitement en mémoire uniquement</li>
                    <li>• Conforme RGPD</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">TakataFinder</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Politique de confidentialité
              </Link>
              <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              <a 
                href="https://www.nhtsa.gov/recalls" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                Sources officielles <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Toujours confirmer sur le site constructeur. Remplacement gratuit.
          </div>
        </div>
      </footer>

      {/* Bandeau promotionnel Windsurf */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base">
          🚀 Ce site a été généré sans coder grâce à <strong>Windsurf</strong> ! 
          Découvre comment créer tes propres applications IA sur{' '}
          <a 
            href="https://windsurfvibes.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-200 font-semibold"
          >
            windsurfvibes.io
          </a>
        </p>
      </div>
    </div>
  );
}
