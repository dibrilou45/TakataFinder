'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, ArrowLeft, ExternalLink } from 'lucide-react';

export default function FAQ() {
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
              <Link href="/vehicules-concernes" className="text-gray-600 hover:text-gray-900">
                Véhicules concernés
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

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h1>
          <p className="text-lg text-gray-600">
            Tout ce que vous devez savoir sur les rappels Takata et TakataFinder
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-lg shadow-sm">
          <Accordion type="single" collapsible className="p-6">
            <AccordionItem value="what-is-takata">
              <AccordionTrigger className="text-left">
                Qu'est-ce que le problème Takata ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Takata était un équipementier automobile japonais qui fabriquait des airbags. 
                  Certains de leurs inflateurs d'airbags peuvent se rompre lors du déploiement, 
                  projetant des fragments métalliques dangereux dans l'habitacle.
                </p>
                <p>
                  Ce défaut a causé des blessures graves et des décès, entraînant le plus grand 
                  rappel automobile de l'histoire avec des millions de véhicules concernés dans le monde.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="why-vin">
              <AccordionTrigger className="text-left">
                Pourquoi utiliser le VIN plutôt que juste la plaque ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Le VIN (Vehicle Identification Number) contient des informations précises sur 
                  le véhicule : modèle exact, année de fabrication, usine de production, etc.
                </p>
                <p>
                  Les rappels Takata concernent des véhicules fabriqués dans des périodes et 
                  usines spécifiques. Seul le VIN permet une identification précise et fiable.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stop-drive">
              <AccordionTrigger className="text-left">
                Que signifie "Stop Drive" ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  "Stop Drive" signifie que le véhicule ne doit <strong>absolument pas être conduit</strong> 
                  jusqu'à ce que l'airbag soit remplacé. Le risque de rupture de l'inflateur est 
                  considéré comme imminent et dangereux.
                </p>
                <p>
                  Si votre véhicule est marqué "Stop Drive", contactez immédiatement votre 
                  constructeur pour organiser le remorquage et la réparation gratuite.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="free-replacement">
              <AccordionTrigger className="text-left">
                Le remplacement est-il vraiment gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Oui, absolument. Les constructeurs automobiles sont légalement tenus de 
                  réparer gratuitement tous les défauts couverts par un rappel de sécurité.
                </p>
                <p>
                  Cela inclut les pièces, la main-d'œuvre, et parfois même le véhicule de 
                  remplacement pendant la réparation. Aucun frais ne doit vous être facturé.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-privacy">
              <AccordionTrigger className="text-left">
                Que faites-vous de mes données ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  TakataFinder ne conserve <strong>aucune donnée personnelle</strong>. 
                  Votre plaque d'immatriculation est traitée en mémoire uniquement pour 
                  obtenir le VIN, puis immédiatement supprimée.
                </p>
                <p>
                  Nous ne stockons ni la plaque, ni le VIN, ni aucune information sur votre véhicule. 
                  Le service est entièrement conforme au RGPD.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="accuracy">
              <AccordionTrigger className="text-left">
                Les résultats sont-ils fiables ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  TakataFinder utilise des sources officielles (API CarsXE, bases de rappels constructeurs) 
                  pour fournir des informations précises et à jour.
                </p>
                <p>
                  Cependant, nous recommandons toujours de confirmer le résultat sur le site 
                  officiel de votre constructeur, car les rappels peuvent évoluer.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="not-found">
              <AccordionTrigger className="text-left">
                Que faire si mon véhicule n'est pas trouvé ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Vérifiez d'abord que la plaque et le pays sont corrects. Les formats 
                  acceptés sont AA-123-AA pour la France et ABC1234 pour les États-Unis.
                </p>
                <p>
                  Si le problème persiste, contactez directement votre constructeur avec 
                  votre VIN (visible sur votre carte grise) pour vérifier les rappels.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="regular-check">
              <AccordionTrigger className="text-left">
                Dois-je vérifier régulièrement ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Oui, il est recommandé de vérifier périodiquement car de nouveaux rappels 
                  peuvent être émis. Les constructeurs découvrent parfois de nouveaux lots 
                  d'airbags défectueux.
                </p>
                <p>
                  Vérifiez au moins une fois par an, ou si vous recevez une notification 
                  de votre constructeur.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="countries">
              <AccordionTrigger className="text-left">
                Quels pays sont supportés ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p className="mb-3">
                  Actuellement, TakataFinder supporte la France (priorité) et les États-Unis (alpha). 
                  D'autres pays européens pourraient être ajoutés selon la demande.
                </p>
                <p>
                  Pour les autres pays, consultez directement le site de votre constructeur 
                  ou les autorités de sécurité routière locales.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Besoin d'aide supplémentaire ?
          </h2>
          <p className="text-gray-600 mb-6">
            Pour des questions spécifiques à votre véhicule, contactez directement votre constructeur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a 
                href="https://www.nhtsa.gov/recalls" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                NHTSA (US) <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a 
                href="https://www.securite-routiere.gouv.fr/dangers-de-la-route/defaillances-du-vehicule/rappels-constructeur" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Sécurité Routière (FR) <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/">
              Vérifier mon véhicule
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
              <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Politique de confidentialité
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
