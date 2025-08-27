'use client';

import Link from 'next/link';
import { AffectedTable } from '@/components/AffectedTable';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function VehiculesConcernes() {
  const handleCheckPlate = (make: string, model: string) => {
    // Redirect to home with pre-filled info (could be enhanced with URL params)
    window.location.href = '/';
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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Accueil
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la vérification</span>
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Véhicules concernés par les rappels Takata
          </h1>
          <p className="text-lg text-gray-600">
            Liste indicative des modèles potentiellement affectés. 
            Utilisez la vérification par plaque pour un diagnostic précis.
          </p>
        </div>

        {/* Affected Vehicles Table */}
        <AffectedTable onCheckPlate={handleCheckPlate} />

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Information importante
          </h2>
          <div className="text-yellow-700 space-y-2">
            <p>
              Cette liste est <strong>indicative et non exhaustive</strong>. 
              Les rappels Takata peuvent concerner d'autres véhicules non listés ici.
            </p>
            <p>
              Pour une vérification précise et à jour, utilisez toujours la 
              <Link href="/" className="underline font-medium">
                recherche par plaque d'immatriculation
              </Link>.
            </p>
            <p>
              Les véhicules marqués "Stop Drive" 🔴 ne doivent pas être conduits 
              jusqu'à réparation complète.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vérifiez votre véhicule maintenant
            </h2>
            <p className="text-gray-600 mb-6">
              Obtenez un diagnostic précis en 10 secondes avec votre plaque d'immatriculation
            </p>
            <Button asChild size="lg">
              <Link href="/">
                Vérifier ma plaque
              </Link>
            </Button>
          </div>
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
            </div>
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
  )
}
