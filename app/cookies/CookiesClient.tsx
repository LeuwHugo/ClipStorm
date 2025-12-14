'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CookiesClient() {
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
              🍪 Cookie Policy
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Cookie Policy
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
                <CardTitle>1. What Are Cookies?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
                </p>
                <p className="text-muted-foreground">
                  This Cookie Policy explains how ClipStorm uses cookies and similar technologies to enhance your browsing experience.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Types of Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>2. Types of Cookies We Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Essential Cookies</h4>
                    <p className="text-muted-foreground mb-2">
                      These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and form submissions.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Authentication and login sessions</li>
                      <li>Security and fraud prevention</li>
                      <li>Basic platform functionality</li>
                      <li>Payment processing security</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Performance Cookies</h4>
                    <p className="text-muted-foreground mb-2">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Page load times and performance metrics</li>
                      <li>User behavior and navigation patterns</li>
                      <li>Error tracking and debugging</li>
                      <li>Platform optimization data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Functional Cookies</h4>
                    <p className="text-muted-foreground mb-2">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Language and region preferences</li>
                      <li>User interface customization</li>
                      <li>Campaign and submission history</li>
                      <li>Notification preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                    <p className="text-muted-foreground mb-2">
                      These cookies help us understand how our platform is used and improve our services based on user behavior.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Google Analytics tracking</li>
                      <li>User engagement metrics</li>
                      <li>Feature usage statistics</li>
                      <li>Conversion and retention data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Third-Party Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>3. Third-Party Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We use third-party services that may set their own cookies:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
                    <li><strong>Stripe:</strong> Payment processing and security</li>
                    <li><strong>Supabase:</strong> Authentication and database services</li>
                    <li><strong>Vercel:</strong> Hosting and performance optimization</li>
                    <li><strong>Social Media:</strong> Sharing and integration features</li>
                  </ul>
                  <p className="text-muted-foreground">
                    These third-party cookies are subject to their respective privacy policies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookie Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>4. How Long Cookies Last</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Session Cookies</h4>
                    <p className="text-muted-foreground">
                      These cookies are temporary and are deleted when you close your browser. They are used for basic functionality during your visit.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Persistent Cookies</h4>
                    <p className="text-muted-foreground">
                      These cookies remain on your device for a set period (usually 30 days to 2 years) and are used to remember your preferences and settings.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Essential Cookies</h4>
                    <p className="text-muted-foreground">
                      Security and authentication cookies may persist for longer periods to maintain your login status and protect your account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Managing Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>5. Managing Your Cookie Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    You have several options for managing cookies:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Browser Settings:</strong> Most browsers allow you to control cookies through settings</li>
                    <li><strong>Cookie Consent:</strong> Use our cookie consent banner to manage preferences</li>
                    <li><strong>Third-Party Opt-Out:</strong> Visit third-party websites to opt out of their cookies</li>
                    <li><strong>Delete Cookies:</strong> Clear existing cookies through browser settings</li>
                  </ul>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-2">Browser-Specific Instructions:</p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                      <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                      <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                      <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact of Disabling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>6. Impact of Disabling Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Disabling certain cookies may affect your experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Essential Cookies:</strong> Platform may not function properly</li>
                    <li><strong>Authentication:</strong> You may need to log in more frequently</li>
                    <li><strong>Preferences:</strong> Settings and customizations may not be saved</li>
                    <li><strong>Performance:</strong> Some features may load slower</li>
                    <li><strong>Analytics:</strong> We may not be able to improve our services effectively</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We recommend keeping essential cookies enabled for the best experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cookie Consent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>7. Cookie Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    When you first visit our website, you&apos;ll see a cookie consent banner that allows you to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Accept all cookies for full functionality</li>
                    <li>Customize your cookie preferences</li>
                    <li>Reject non-essential cookies</li>
                    <li>Learn more about our cookie policy</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You can change your preferences at any time through our cookie settings panel or browser settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>8. Data Protection and Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We take data protection seriously:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Cookies are encrypted and transmitted securely</li>
                    <li>We only collect necessary information</li>
                    <li>Data is stored in compliance with privacy laws</li>
                    <li>Third-party services are carefully selected</li>
                    <li>Regular security audits are conducted</li>
                    <li>User consent is obtained before setting non-essential cookies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Legal Basis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>9. Legal Basis for Cookie Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Our use of cookies is based on the following legal grounds:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Legitimate Interest:</strong> Essential cookies for platform functionality</li>
                    <li><strong>Consent:</strong> Non-essential cookies with user permission</li>
                    <li><strong>Contract Performance:</strong> Cookies necessary for service delivery</li>
                    <li><strong>Legal Obligation:</strong> Cookies required by law or regulations</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We ensure compliance with applicable data protection laws, including GDPR and CCPA.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Updates to Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>10. Updates to This Cookie Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We may update this Cookie Policy from time to time to reflect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Changes in our cookie practices</li>
                    <li>New third-party services</li>
                    <li>Legal and regulatory requirements</li>
                    <li>Platform improvements and features</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Significant changes will be communicated through our platform and may require renewed consent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>11. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    If you have questions about our use of cookies or this policy, please contact us:
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold">ClipStorm Privacy Team</p>
                    <p className="text-muted-foreground">Email: privacy@clipstorm.com</p>
                    <p className="text-muted-foreground">Subject: Cookie Policy Inquiry</p>
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