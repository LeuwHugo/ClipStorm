'use client';

import { motion } from 'framer-motion';
import { Search, MessageCircle, Video, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Search,
    title: 'Find Your Editor',
    description: 'Browse our marketplace of skilled video editors. Filter by style, price, and turnaround time.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageCircle,
    title: 'Share Your Vision',
    description: 'Upload your raw footage and brief. Communicate directly with your chosen editor.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Video,
    title: 'Get Your Clips',
    description: 'Receive professionally edited videos optimized for maximum engagement and virality.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Star,
    title: 'Go Viral',
    description: 'Post your content and watch the views roll in. Rate your editor and build long-term partnerships.',
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
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get professional video edits in just a few simple steps. 
            From concept to viral content in record time.
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