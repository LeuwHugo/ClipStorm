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
              Ready to Create
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}Viral Content?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Join thousands of content creators who are already using ClipWave 
              to scale their content and grow their audiences. Start your journey today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Browse Editors
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24h</div>
              <div className="text-muted-foreground">Average Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$0.05</div>
              <div className="text-muted-foreground">Starting Price/1K Views</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}