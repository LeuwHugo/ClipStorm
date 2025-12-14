'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CreditCard, Shield, Clock, TrendingUp, Award, Check, Users, Star } from 'lucide-react';
import Link from 'next/link';

export function PayoutsClient() {
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
              💰 How Clippers Get Paid
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Simple & Transparent
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}Payment System
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Learn how our payment system works, when you get paid, and how to maximize your earnings as a clipper on ClipStorm.
            </p>
          </motion.div>
        </div>

        {/* How Payouts Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Payouts Work</h2>
            <p className="text-lg text-muted-foreground">
              From campaign win to payment in your account
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Win Campaign</h3>
                <p className="text-muted-foreground text-sm">
                  Creator selects your edit as the winner from all submissions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Automatic Processing</h3>
                <p className="text-muted-foreground text-sm">
                  Payment is automatically processed and sent to your account.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Fast Transfer</h3>
                <p className="text-muted-foreground text-sm">
                  Money arrives in your account within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">4. Keep Earning</h3>
                <p className="text-muted-foreground text-sm">
                  Continue submitting to more campaigns and grow your income.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Payment Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Structure</h2>
            <p className="text-lg text-muted-foreground">
              Clear breakdown of how much you earn from each campaign
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">What You Earn</CardTitle>
                <CardDescription>
                  You receive 90% of the campaign budget when your edit wins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Campaign Budget</h4>
                      <p className="text-sm text-muted-foreground">Total amount creator set</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">$100</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Platform Fee (10%)</h4>
                      <p className="text-sm text-muted-foreground">Covers platform costs</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">-$10</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <div>
                      <h4 className="font-semibold">Your Earnings</h4>
                      <p className="text-sm text-muted-foreground">What you receive</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">$90</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Earnings Examples</CardTitle>
                <CardDescription>
                  Real examples of what you can earn from different campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Starter Campaign</h4>
                      <p className="text-sm text-muted-foreground">$25 budget</p>
                    </div>
                    <span className="font-bold text-green-600">$22.50</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Professional Campaign</h4>
                      <p className="text-sm text-muted-foreground">$100 budget</p>
                    </div>
                    <span className="font-bold text-green-600">$90.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Premium Campaign</h4>
                      <p className="text-sm text-muted-foreground">$300 budget</p>
                    </div>
                    <span className="font-bold text-green-600">$270.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                    <div>
                      <h4 className="font-semibold">High-End Campaign</h4>
                      <p className="text-sm text-muted-foreground">$500 budget</p>
                    </div>
                    <span className="font-bold text-primary">$450.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Payment Methods</h2>
            <p className="text-lg text-muted-foreground">
              Multiple ways to receive your earnings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bank Transfer</h3>
                <p className="text-muted-foreground mb-4">
                  Direct deposit to your bank account
                </p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>24-48 hour processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Available worldwide</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">PayPal</h3>
                <p className="text-muted-foreground mb-4">
                  Instant payments to your PayPal account
                </p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Instant transfer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Low fees (2.9%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Easy to use</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Stripe Connect</h3>
                <p className="text-muted-foreground mb-4">
                  Professional payment processing
                </p>
                <ul className="text-sm space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Secure & reliable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Multiple currencies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Detailed reporting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Earning Potential */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Earning Potential</CardTitle>
              <CardDescription>
                How much you can earn depends on your skills and activity level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Beginner</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">$200-500</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                  <ul className="text-sm space-y-1 mt-4 text-left">
                    <li>• 5-10 submissions/month</li>
                    <li>• Focus on starter campaigns</li>
                    <li>• Building portfolio</li>
                  </ul>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Intermediate</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">$500-1500</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                  <ul className="text-sm space-y-1 mt-4 text-left">
                    <li>• 15-25 submissions/month</li>
                    <li>• Mix of campaign types</li>
                    <li>• Consistent wins</li>
                  </ul>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert</h3>
                  <p className="text-3xl font-bold text-purple-600 mb-2">$1500-5000</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                  <ul className="text-sm space-y-1 mt-4 text-left">
                    <li>• 30+ submissions/month</li>
                    <li>• Premium campaigns</li>
                    <li>• High win rate</li>
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
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of clippers who are already earning money on ClipStorm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit-clips">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Submitting Clips
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