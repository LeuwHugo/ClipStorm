'use client';

import { motion } from 'framer-motion';
import { Search, MessageCircle, Video, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Search,
    title: 'Créez une Campagne',
    description: 'Créez une campagne YouTube avec titre, URL, budget, durée et CPMV. Code de tracking généré automatiquement.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageCircle,
    title: 'Soumettez des Clips',
    description: 'Les clippers soumettent des clips TikTok avec le code de tracking dans la description.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Video,
    title: 'Validation Automatique',
    description: 'Système vérifie automatiquement les clips et calcule les paiements selon les vues générées.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Star,
    title: 'Paiements Automatiques',
    description: 'Paiements Stripe Connect automatiques après 7 jours d\'escrow selon les performances.',
    color: 'from-orange-500 to-orange-600'
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Comment ça marche
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Processus simple en 4 étapes pour connecter créateurs et clippers. 
            Du brief au paiement automatique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="h-full text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent transform -translate-y-1/2 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}