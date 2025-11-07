'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Euro, Shield, Clock, Star, Type, Link as LinkIcon, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CreateCampaignClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Créez des
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {" "}Campagnes YouTube
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Créez des campagnes YouTube en 4 champs seulement et connectez-vous avec des clippers 
            qui transformeront votre contenu en clips TikTok viraux avec codes de tracking.
          </p>
        </motion.div>

        {/* MVP Fields Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Création Ultra-Simple en
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}4 Champs Seulement
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Notre MVP simplifie la création de campagnes pour un démarrage rapide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Type className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Titre</h3>
                <p className="text-sm text-muted-foreground">
                  Nom de votre campagne
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold mb-2">URL YouTube</h3>
                <p className="text-sm text-muted-foreground">
                  Lien vers votre vidéo source
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Montant minimum 20€
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Durée</h3>
                <p className="text-sm text-muted-foreground">
                  Maximum 30 jours
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Codes de Tracking</h3>
              <p className="text-muted-foreground">
                Codes de tracking uniques générés automatiquement pour suivre les performances de vos clips.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Validation Automatique</h3>
              <p className="text-muted-foreground">
                Système de validation automatique des clips TikTok avec vérification des codes de tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Euro className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement par Vue</h3>
              <p className="text-muted-foreground">
                Système CPMV transparent : payez selon les vues générées par vos clips TikTok.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold mb-4">Prêt à Tester Notre MVP ?</h2>
              <p className="text-muted-foreground mb-6">
                Créez votre première campagne YouTube en 4 champs seulement et connectez-vous avec des clippers TikTok.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/campaigns">
                  <Button size="lg" className="w-full sm:w-auto">
                    Créer une Campagne
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/campaigns">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Voir les Campagnes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 