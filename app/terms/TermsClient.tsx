'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TermsClient() {
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
              📋 Legal Terms
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Welcome to ClipWave (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our platform that connects content creators with video editors for viral content creation.
                </p>
                <p className="text-muted-foreground">
                  By accessing or using ClipWave, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our service.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Definitions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>2. Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Service</h4>
                    <p className="text-muted-foreground">The ClipWave platform, including all features, functionality, and content.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Creator</h4>
                    <p className="text-muted-foreground">Users who create campaigns and submit content for editing.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Clipper/Editor</h4>
                    <p className="text-muted-foreground">Users who provide video editing services through the platform.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Campaign</h4>
                    <p className="text-muted-foreground">A project created by a Creator seeking video editing services.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Submission</h4>
                    <p className="text-muted-foreground">Edited content submitted by a Clipper for a Campaign.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>3. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    To use our Service, you must create an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Providing accurate and complete information</li>
                    <li>Maintaining the security of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You must be at least 18 years old to create an account and use our Service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>4. Service Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    ClipWave provides a platform that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Connects content creators with video editors</li>
                    <li>Facilitates the creation and management of editing campaigns</li>
                    <li>Processes payments between creators and editors</li>
                    <li>Provides quality assurance and dispute resolution</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We act as an intermediary and are not responsible for the quality of work delivered by editors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Creator Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>5. Creator Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    As a Creator, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide clear and accurate campaign requirements</li>
                    <li>Upload only content you own or have rights to use</li>
                    <li>Review submissions fairly and objectively</li>
                    <li>Pay the agreed budget when selecting a winning submission</li>
                    <li>Not use the platform for illegal or harmful content</li>
                    <li>Respect intellectual property rights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Editor Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>6. Editor Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    As an Editor, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Submit original work that meets campaign requirements</li>
                    <li>Meet agreed-upon deadlines</li>
                    <li>Use only licensed music, effects, and assets</li>
                    <li>Not submit work that infringes on others&apos; rights</li>
                    <li>Maintain professional standards and quality</li>
                    <li>Provide accurate information about your skills and experience</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>7. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Payment processing is handled through secure third-party providers:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Creators pay the full campaign budget upfront</li>
                    <li>Funds are held in escrow until a winner is selected</li>
                    <li>Winning editors receive 90% of the campaign budget</li>
                    <li>ClipWave retains a 10% platform fee</li>
                    <li>Payments are processed within 24-48 hours of selection</li>
                    <li>All fees are clearly disclosed before payment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>8. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Intellectual property rights are as follows:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Creators retain rights to their original content</li>
                    <li>Editors retain rights to their editing techniques and style</li>
                    <li>Winning submissions transfer full rights to the creator</li>
                    <li>Non-winning submissions remain the property of the editor</li>
                    <li>ClipWave retains rights to platform content and branding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Prohibited Uses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>9. Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    You may not use our Service to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Create or distribute illegal content</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Harass, abuse, or harm others</li>
                    <li>Attempt to circumvent payment systems</li>
                    <li>Use automated tools to manipulate the platform</li>
                    <li>Share account credentials with others</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>10. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>
                  <p className="text-muted-foreground">
                    Upon termination, your right to use the Service will cease immediately. Outstanding payments will be processed according to our payment terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>11. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    In no event shall ClipWave be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                  <p className="text-muted-foreground">
                    Our total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>12. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the platform.
                  </p>
                  <p className="text-muted-foreground">
                    Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>13. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold">ClipWave Support</p>
                    <p className="text-muted-foreground">Email: legal@clipwave.com</p>
                    <p className="text-muted-foreground">Address: [Your Business Address]</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 