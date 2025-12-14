 'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PrivacyClient() {
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
              🔒 Privacy & Data Protection
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Privacy Policy
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
                  ClipStorm (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="text-muted-foreground">
                  By using ClipStorm, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Name and email address</li>
                      <li>Profile information and bio</li>
                      <li>Payment information (processed securely by third parties)</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content and Media</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Video content uploaded for campaigns</li>
                      <li>Edited submissions and project files</li>
                      <li>Portfolio work and samples</li>
                      <li>Communication messages between users</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Usage Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Platform activity and interactions</li>
                      <li>Campaign participation and submissions</li>
                      <li>Payment and transaction history</li>
                      <li>Technical data (IP address, browser type, device info)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How We Use Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We use the collected information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide and maintain our platform services</li>
                    <li>Process payments and manage transactions</li>
                    <li>Facilitate communication between creators and editors</li>
                    <li>Improve our platform and user experience</li>
                    <li>Send important updates and notifications</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                    <li>Provide customer support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Information Sharing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>4. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We do not sell, trade, or rent your personal information. We may share information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Service Providers:</strong> With trusted third-party services for payment processing, hosting, and analytics</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                    <li><strong>Platform Functionality:</strong> Between creators and editors for campaign collaboration</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong>Consent:</strong> With your explicit permission for specific purposes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure payment processing through trusted providers</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response procedures</li>
                  </ul>
                  <p className="text-muted-foreground">
                    However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Retention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>6. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We retain your information for as long as necessary to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide our services and maintain your account</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our platform and services</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You may request deletion of your account and associated data at any time, subject to legal retention requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>7. Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Depending on your location, you may have the following rights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                    <li><strong>Objection:</strong> Object to certain processing activities</li>
                    <li><strong>Withdrawal:</strong> Withdraw consent where applicable</li>
                  </ul>
                  <p className="text-muted-foreground">
                    To exercise these rights, contact us at privacy@clipstorm.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookies and Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized content and features</li>
                    <li>Ensure platform security and functionality</li>
                    <li>Improve user experience</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You can control cookie settings through your browser preferences. However, disabling cookies may affect platform functionality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Third-Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>9. Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Our platform integrates with third-party services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Payment Processors:</strong> Stripe, PayPal for secure transactions</li>
                    <li><strong>Authentication:</strong> Supabase for user authentication</li>
                    <li><strong>Analytics:</strong> Google Analytics for platform insights</li>
                    <li><strong>Hosting:</strong> Vercel for reliable hosting services</li>
                    <li><strong>Communication:</strong> Email services for notifications</li>
                  </ul>
                  <p className="text-muted-foreground">
                    These services have their own privacy policies. We recommend reviewing them.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Children's Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>10. Children&apos;s Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
                  </p>
                  <p className="text-muted-foreground">
                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* International Transfers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>11. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                  </p>
                  <p className="text-muted-foreground">
                    By using our Service, you consent to the transfer of your information to countries that may have different data protection laws.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>12. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Posting the updated policy on our platform</li>
                    <li>Sending email notifications to registered users</li>
                    <li>Displaying prominent notices on our website</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Your continued use of our Service after changes become effective constitutes acceptance of the updated policy.
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
                <CardTitle>13. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold">ClipStorm Privacy Team</p>
                    <p className="text-muted-foreground">Email: privacy@clipstorm.com</p>
                    <p className="text-muted-foreground">Address: [Your Business Address]</p>
                    <p className="text-muted-foreground">Response Time: Within 30 days</p>
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