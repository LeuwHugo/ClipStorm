'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit mx-auto">
                🎬 MVP - Plateforme de Clips Viraux
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Créez des Campagnes et
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {" "}Générez des Clips Viraux
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Plateforme MVP pour connecter créateurs et clippers. Créez des campagnes YouTube, 
                soumettez des clips TikTok avec codes de tracking, et payez selon les vues générées.
              </p>
            </div>

            {/* Conditional Button */}
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Accéder au tableau de bord
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/campaigns">
                    Voir les campagnes
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5+</div>
              <div className="text-muted-foreground">Campagnes créées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Clips soumis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500€+</div>
              <div className="text-muted-foreground">GMV cible</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}