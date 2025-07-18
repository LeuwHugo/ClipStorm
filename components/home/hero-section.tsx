'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                🚀 The Future of Content Creation
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Turn Your Content Into
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {" "}Viral Clips
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect with skilled video editors who specialize in creating viral TikToks, 
                Instagram Reels, and YouTube Shorts. Get professional edits that drive views and engagement.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Browse Editors
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">10K+</div>
                  <div className="text-sm text-muted-foreground">Creators</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">50K+</div>
                  <div className="text-sm text-muted-foreground">Videos Created</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Video Preview */}
              <div className="relative bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
                <div className="aspect-[9/16] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Video preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                    1.2M views
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                    🔥 Trending
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Live Editing</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">5.0 Rating</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}