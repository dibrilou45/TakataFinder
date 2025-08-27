'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Bandeau promotionnel Windsurf */}
      <div className="bg-teal-600 text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base">
          🚀 Ce site a été généré sans coder grâce à <strong>Windsurf</strong> ! 
          Découvre comment créer tes propres applications IA sur{' '}
          <a 
            href="https://windsurfvibes.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-teal-200 font-semibold"
          >
            windsurfvibes.io
          </a>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">TakataFinder</h1>
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/vehicules-concernes" className="text-sm text-gray-600 hover:text-gray-900">
                Véhicules concernés
              </Link>
              <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                Accueil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de confidentialité
          </h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Collecte des données
            </h2>
            <p className="mb-6 text-gray-600">
              TakataFinder ne collecte <strong>aucune donnée personnelle</strong>. 
              Votre plaque d'immatriculation est traitée uniquement en mémoire 
              pour obtenir le VIN correspondant via l'API CarsXE, puis immédiatement supprimée.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Traitement des données
            </h2>
            <p className="mb-6 text-gray-600">
              Le processus de vérification fonctionne comme suit :
            </p>
            <ul className="mb-6 text-gray-600 list-disc pl-6">
              <li>Vous saisissez votre plaque d'immatriculation</li>
              <li>Nous l'envoyons à l'API CarsXE pour obtenir le VIN</li>
              <li>Nous interrogeons les bases de rappels avec ce VIN</li>
              <li>Nous vous affichons le résultat</li>
              <li>Toutes les données sont supprimées de la mémoire</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Conservation des données
            </h2>
            <p className="mb-6 text-gray-600">
              <strong>Aucune donnée n'est conservée</strong>. Ni votre plaque d'immatriculation, 
              ni votre VIN, ni les informations de votre véhicule ne sont stockées dans 
              nos systèmes ou bases de données.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Logs et métriques
            </h2>
            <p className="mb-6 text-gray-600">
              Nous conservons uniquement des métriques agrégées et anonymes :
            </p>
            <ul className="mb-6 text-gray-600 list-disc pl-6">
              <li>Nombre de vérifications effectuées</li>
              <li>Taux de succès/échec des requêtes</li>
              <li>Temps de réponse moyen</li>
              <li>Répartition des statuts (🟢/🟡/🔴)</li>
            </ul>
            <p className="mb-6 text-gray-600">
              Ces données ne permettent pas d'identifier un utilisateur ou un véhicule spécifique.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cookies et tracking
            </h2>
            <p className="mb-6 text-gray-600">
              TakataFinder n'utilise aucun cookie de tracking ou de profilage. 
              Seuls les cookies techniques nécessaires au fonctionnement du site 
              (session, préférences) peuvent être utilisés.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Partage avec des tiers
            </h2>
            <p className="mb-6 text-gray-600">
              Vos données ne sont partagées qu'avec :
            </p>
            <ul className="mb-6 text-gray-600 list-disc pl-6">
              <li><strong>CarsXE API</strong> : pour le décodage VIN (traitement sécurisé)</li>
              <li><strong>Aucun autre tiers</strong> : pas de revente, partage ou analyse</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Sécurité
            </h2>
            <p className="mb-6 text-gray-600">
              Toutes les communications sont chiffrées (HTTPS). Les requêtes vers 
              les APIs externes sont sécurisées et limitées en débit pour éviter les abus.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Vos droits (RGPD)
            </h2>
            <p className="mb-6 text-gray-600">
              Étant donné que nous ne conservons aucune donnée personnelle, 
              les droits RGPD (accès, rectification, suppression, portabilité) 
              ne s'appliquent pas dans le cadre de TakataFinder.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Contact
            </h2>
            <p className="mb-6 text-gray-600">
              Pour toute question concernant cette politique de confidentialité 
              ou le traitement de vos données, vous pouvez nous contacter via 
              les liens disponibles sur le site.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Modifications
            </h2>
            <p className="mb-6 text-gray-600">
              Cette politique peut être mise à jour pour refléter les changements 
              dans nos pratiques ou la réglementation. La date de dernière 
              modification sera indiquée en bas de cette page.
            </p>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/">
              Vérifier mon véhicule en toute confidentialité
            </Link>
          </Button>
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
              <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
