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
  DollarSign,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Search,
    title: 'Find Perfect Editors',
    description: 'Browse through our curated marketplace of skilled video editors specializing in short-form content.',
    color: 'text-blue-600'
  },
  {
    icon: Zap,
    title: 'Lightning Fast Delivery',
    description: 'Get your edited videos in as little as 24 hours with our network of professional editors.',
    color: 'text-yellow-600'
  },
  {
    icon: TrendingUp,
    title: 'Viral-Ready Content',
    description: 'Our editors know what makes content go viral on TikTok, Instagram Reels, and YouTube Shorts.',
    color: 'text-green-600'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected transactions with escrow payments. Only pay when you\'re completely satisfied.',
    color: 'text-purple-600'
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'All editors are vetted and rated by the community. See portfolios and reviews before hiring.',
    color: 'text-orange-600'
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Clear, upfront pricing based on video views. No hidden fees or surprise charges.',
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
            Everything You Need to Create
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {" "}Viral Content
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools and talent you need to transform your raw footage 
            into engaging short-form content that drives results.
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