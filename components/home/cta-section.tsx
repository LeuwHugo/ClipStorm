'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Prêt à Tester Notre
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}MVP ?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Rejoignez notre plateforme MVP pour connecter créateurs et clippers. 
              Créez des campagnes, soumettez des clips et générez des revenus. Testez dès maintenant !
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Commencer Maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Voir les Campagnes
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <div className="text-muted-foreground">Champs Campagne</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">8</div>
              <div className="text-muted-foreground">Caractères Tracking</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">7j</div>
              <div className="text-muted-foreground">Escrow Automatique</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}