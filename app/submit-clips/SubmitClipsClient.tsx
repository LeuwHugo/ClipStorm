'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Upload, Target, DollarSign, Clock, Users, Star, CheckCircle, TrendingUp, Award, Check } from 'lucide-react';
import Link from 'next/link';

export function SubmitClipsClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/5 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              🎬 Submit & Monetize Your Clips
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              How to Submit Clips and
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}Get Paid
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn how to submit your video edits to campaigns and earn money when creators choose your work. Join our community of skilled clippers.
            </p>
          </motion.div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <CardTitle>Browse Active Campaigns</CardTitle>
                </div>
                <CardDescription>
                  Discover campaigns that match your editing style and expertise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Campaign Selection</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>• Filter by budget range and style</li>
                      <li>• Check requirements and deadlines</li>
                      <li>• Review creator&apos;s content and preferences</li>
                      <li>• See how many clippers are competing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <CardTitle>Download & Edit Content</CardTitle>
                </div>
                <CardDescription>
                  Download the raw content and create your viral edit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Editing Process</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>• Download high-quality source material</li>
                      <li>• Use your preferred editing tools</li>
                      <li>• Follow campaign requirements</li>
                      <li>• Optimize for viral potential</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <CardTitle>Submit Your Edit</CardTitle>
                </div>
                <CardDescription>
                  Upload your finished edit and wait for the creator&apos;s decision.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Submission Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>• Upload in required format (MP4, MOV)</li>
                      <li>• Include project files if requested</li>
                      <li>• Add description of your approach</li>
                      <li>• Meet deadline requirements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <CardTitle>Get Paid When Selected</CardTitle>
                </div>
                <CardDescription>
                  If your edit is chosen, receive the full campaign budget automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Payment Process</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                      <li>• Creator reviews all submissions</li>
                      <li>• Winner receives full budget (minus 10% fee)</li>
                      <li>• Payment processed automatically</li>
                      <li>• Build your reputation and portfolio</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Submit Clips on ClipStorm?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of clippers earning money doing what they love
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn More Money</h3>
                <p className="text-muted-foreground">
                  Campaigns offer $25-$500 budgets. Win more, earn more. No hourly rates, just results-based payment.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Your Portfolio</h3>
                <p className="text-muted-foreground">
                  Every submission adds to your portfolio. Showcase your work to attract more high-paying campaigns.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gain Recognition</h3>
                <p className="text-muted-foreground">
                  Top clippers get featured, receive priority access to premium campaigns, and build lasting relationships.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Success Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tips for Success</CardTitle>
              <CardDescription>
                Maximize your chances of winning campaigns and earning more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Quality First
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Focus on viral hooks and engaging openings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Use trending music and effects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Optimize for platform-specific formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Pay attention to audio quality</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Strategy
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Submit early to campaigns with fewer entries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Specialize in specific content types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Build relationships with repeat creators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Stay updated with viral trends</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6">
                Join our community of skilled clippers and start monetizing your editing talent today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button size="lg" className="w-full sm:w-auto">
                    Browse Campaigns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/editor-tools">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Tools & Resources
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