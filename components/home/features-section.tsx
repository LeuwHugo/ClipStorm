'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Clock, 
  Star, 
  TrendingUp, 
  Users,
  Video,
  Euro,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Search,
    title: 'Création de Campagnes Simple',
    description: 'Créez des campagnes YouTube en 4 champs seulement : titre, URL, budget, durée et CPMV.',
    color: 'text-blue-600'
  },
  {
    icon: Zap,
    title: 'Codes de Tracking Uniques',
    description: 'Génération automatique de codes de tracking alphanumériques pour suivre vos clips.',
    color: 'text-yellow-600'
  },
  {
    icon: TrendingUp,
    title: 'Validation TikTok Automatique',
    description: 'Système de validation basique des clips TikTok avec vérification des codes de tracking.',
    color: 'text-green-600'
  },
  {
    icon: Shield,
    title: 'Paiements Stripe Connect',
    description: 'Paiements sécurisés via Stripe Connect avec escrow automatique de 7 jours.',
    color: 'text-purple-600'
  },
  {
    icon: Star,
    title: 'Dashboard Dual',
    description: 'Interface séparée pour créateurs (campagnes, budget) et clippers (clips, gains).',
    color: 'text-orange-600'
  },
  {
    icon: Euro,
    title: 'Paiement par Vue',
    description: 'Système CPMV transparent : payez selon les vues générées par vos clips.',
    color: 'text-emerald-600'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Fonctionnalités MVP pour
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {" "}Clips Viraux
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Notre plateforme MVP connecte créateurs et clippers avec un système simple et efficace 
            pour générer du contenu viral et des revenus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-purple-600/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}