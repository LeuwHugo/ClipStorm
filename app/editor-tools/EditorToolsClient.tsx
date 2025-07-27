'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Star, Zap, TrendingUp, Video, Music, Palette, Smartphone } from 'lucide-react';
import Link from 'next/link';

export function EditorToolsClient() {
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
              🛠️ Essential Tools & Resources
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Tools to Create
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {" "}Viral Clips
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the best tools, apps, and resources to create viral TikTok, Instagram, and YouTube content quickly and efficiently.
            </p>
          </motion.div>
        </div>

        {/* AI-Powered Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Editing Tools</h2>
            <p className="text-lg text-muted-foreground">
              Revolutionary tools that use AI to speed up your editing workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Submagic</CardTitle>
                  <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                  AI-powered video editing with automatic captions and effects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.8/5</span>
                  <span className="text-sm text-muted-foreground">(2.5k reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Auto-caption generation</li>
                  <li>• Smart video templates</li>
                  <li>• One-click viral effects</li>
                  <li>• Mobile-first editing</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Free - $19/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://submagic.co" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Remake.ai</CardTitle>
                  <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                  AI video remixing and content repurposing platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.6/5</span>
                  <span className="text-sm text-muted-foreground">(1.8k reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Auto-video remixing</li>
                  <li>• Multi-format export</li>
                  <li>• Viral trend templates</li>
                  <li>• Batch processing</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$29/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://remake.ai" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">CapCut</CardTitle>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <CardDescription>
                  TikTok&apos;s official video editor with AI features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.7/5</span>
                  <span className="text-sm text-muted-foreground">(50k+ reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Auto-captions & translation</li>
                  <li>• Trending effects & music</li>
                  <li>• Text-to-speech</li>
                  <li>• Cross-platform sync</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Completely Free</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://capcut.com" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Runway ML</CardTitle>
                  <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                  Professional AI video editing and generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.5/5</span>
                  <span className="text-sm text-muted-foreground">(3.2k reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• AI video generation</li>
                  <li>• Motion tracking</li>
                  <li>• Background removal</li>
                  <li>• Professional workflows</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$15/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://runwayml.com" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pictory</CardTitle>
                  <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                  AI video creation from text and long-form content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.4/5</span>
                  <span className="text-sm text-muted-foreground">(1.2k reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Text-to-video generation</li>
                  <li>• Auto-highlight creation</li>
                  <li>• Social media optimization</li>
                  <li>• Brand customization</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$23/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://pictory.ai" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Synthesia</CardTitle>
                  <Badge variant="secondary">AI</Badge>
                </div>
                <CardDescription>
                  AI avatar and video generation platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.3/5</span>
                  <span className="text-sm text-muted-foreground">(800 reviews)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• AI avatar creation</li>
                  <li>• Text-to-speech videos</li>
                  <li>• Multi-language support</li>
                  <li>• Custom branding</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$30/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://synthesia.io" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Traditional Editing Software */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Professional Editing Software</h2>
            <p className="text-lg text-muted-foreground">
              Industry-standard tools for advanced video editing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Adobe Premiere Pro</CardTitle>
                <CardDescription>
                  Industry-leading video editing software
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.8/5</span>
                  <span className="text-sm text-muted-foreground">(Professional)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Advanced timeline editing</li>
                  <li>• Professional effects & transitions</li>
                  <li>• Multi-camera editing</li>
                  <li>• Adobe Creative Cloud integration</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$20.99/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://adobe.com/premiere" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">DaVinci Resolve</CardTitle>
                <CardDescription>
                  Professional editing with free version available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.9/5</span>
                  <span className="text-sm text-muted-foreground">(Professional)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Professional color grading</li>
                  <li>• Advanced audio editing</li>
                  <li>• Fusion visual effects</li>
                  <li>• Free version available</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Free - $295</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://blackmagicdesign.com/davinciresolve" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Final Cut Pro</CardTitle>
                <CardDescription>
                  Apple&apos;s professional video editor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.7/5</span>
                  <span className="text-sm text-muted-foreground">(Mac Only)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Magnetic timeline</li>
                  <li>• Optimized for Mac</li>
                  <li>• Built-in effects library</li>
                  <li>• One-time purchase</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">$299.99</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://apple.com/final-cut-pro" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Mobile Apps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mobile Editing Apps</h2>
            <p className="text-lg text-muted-foreground">
              Edit on-the-go with powerful mobile applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">InShot</CardTitle>
                <CardDescription>
                  Popular mobile video editor with viral features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.6/5</span>
                  <span className="text-sm text-muted-foreground">(Mobile)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Easy-to-use interface</li>
                  <li>• Built-in music library</li>
                  <li>• Text and sticker effects</li>
                  <li>• Export in multiple formats</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Free - $3.99/month</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://inshot.com" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">VN Editor</CardTitle>
                <CardDescription>
                  Professional mobile video editor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.5/5</span>
                  <span className="text-sm text-muted-foreground">(Mobile)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Multi-track timeline</li>
                  <li>• Professional transitions</li>
                  <li>• Color grading tools</li>
                  <li>• Cross-platform sync</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Free</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://vnvideoeditor.com" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Kinemaster</CardTitle>
                <CardDescription>
                  Advanced mobile video editor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">4.4/5</span>
                  <span className="text-sm text-muted-foreground">(Mobile)</span>
                </div>
                <ul className="text-sm space-y-2">
                  <li>• Multi-layer editing</li>
                  <li>• Chroma key effects</li>
                  <li>• Audio mixing</li>
                  <li>• 4K export support</li>
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-green-600">Free - $39.99/year</span>
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://kinemaster.com" target="_blank" rel="noopener noreferrer">
                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
            <p className="text-lg text-muted-foreground">
              Tools and resources to enhance your editing workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  Music & Sound Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Epidemic Sound</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://epidemicsound.com" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Artlist</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://artlist.io" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Freesound.org</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://freesound.org" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Stock Footage & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Pexels Videos</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://pexels.com/videos" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Pixabay</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://pixabay.com/videos" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm">Motion Elements</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://motionelements.com" target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
              <h2 className="text-2xl font-bold mb-4">Ready to Start Editing?</h2>
              <p className="text-muted-foreground mb-6">
                Choose the tools that work best for your workflow and start creating viral content today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/submit-clips">
                  <Button size="lg" className="w-full sm:w-auto">
                    Submit Your Clips
                  </Button>
                </Link>
                <Link href="/payouts">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn About Payouts
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