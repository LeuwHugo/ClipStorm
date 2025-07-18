'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Globe, 
  Play, 
  MessageCircle, 
  ExternalLink,
  Calendar,
  DollarSign,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { User } from '@/lib/types';

// Mock data - in real app, this would come from Firebase
const mockClipper: User = {
  id: '1',
  email: 'alex@example.com',
  displayName: 'Alex Chen',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  role: 'clipper',
  bio: 'Professional video editor with 5+ years of experience creating viral content for top creators. Specialized in gaming, lifestyle, and entertainment content. I help creators turn their raw footage into engaging short-form videos that drive views and engagement.',
  rating: 4.9,
  reviewCount: 127,
  turnaroundTime: 24,
  languages: ['English', 'Spanish', 'French'],
  portfolio: ['video1.mp4', 'video2.mp4', 'video3.mp4'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPortfolio = [
  {
    id: '1',
    title: 'Gaming Highlights - Apex Legends',
    platform: 'TikTok',
    url: 'https://example.com/video1',
    thumbnail: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 1250000,
    uploadedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Lifestyle Morning Routine',
    platform: 'Instagram',
    url: 'https://example.com/video2',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 890000,
    uploadedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Tech Review - iPhone 15',
    platform: 'YouTube',
    url: 'https://example.com/video3',
    thumbnail: 'https://images.pexels.com/photos/3784424/pexels-photo-3784424.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 2030000,
    uploadedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    title: 'Cooking Quick Tips',
    platform: 'TikTok',
    url: 'https://example.com/video4',
    thumbnail: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    views: 567000,
    uploadedAt: new Date('2024-01-08'),
  },
];

const mockReviews = [
  {
    id: '1',
    reviewer: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 5,
    comment: 'Alex delivered exactly what I needed! The editing was clean, engaging, and delivered on time. My TikTok got 500K+ views!',
    date: new Date('2024-01-20'),
    project: '3 TikTok Gaming Clips',
  },
  {
    id: '2',
    reviewer: 'Mike Rodriguez',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 5,
    comment: 'Professional work and great communication throughout the project. Will definitely work with Alex again!',
    date: new Date('2024-01-18'),
    project: '5 Instagram Reels',
  },
  {
    id: '3',
    reviewer: 'Emma Davis',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    rating: 4,
    comment: 'Great editing skills and fast turnaround. The videos performed really well on my channels.',
    date: new Date('2024-01-15'),
    project: '2 YouTube Shorts',
  },
];

const mockSocialLinks = [
  { platform: 'TikTok', username: '@alexedits', url: 'https://tiktok.com/@alexedits', followers: '125K' },
  { platform: 'Instagram', username: '@alex.creates', url: 'https://instagram.com/alex.creates', followers: '89K' },
  { platform: 'YouTube', username: 'AlexEditsStudio', url: 'https://youtube.com/@alexeditsstudio', followers: '45K' },
];

export default function ClipperProfileClient() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('portfolio');

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      TikTok: '🎵',
      Instagram: '📷',
      YouTube: '📺',
      LinkedIn: '💼',
    };
    return icons[platform] || '🎬';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      TikTok: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Instagram: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      YouTube: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      LinkedIn: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mockClipper.avatar} alt={mockClipper.displayName} />
                <AvatarFallback className="text-2xl">{mockClipper.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{mockClipper.displayName}</h1>
                <p className="text-muted-foreground mb-4">Professional Video Editor</p>
                
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(Math.floor(mockClipper.rating || 0))}</div>
                    <span className="font-medium">{mockClipper.rating}</span>
                    <span className="text-sm text-muted-foreground">({mockClipper.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mockClipper.turnaroundTime}h delivery</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mockClipper.languages?.map((lang) => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {mockClipper.bio}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">127</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">4.9M+</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">On-time</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Avg. Delivery</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hire Alex</CardTitle>
                <CardDescription>Starting from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$0.05<span className="text-lg text-muted-foreground">/1K views</span></div>
                <Button className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Presence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSocialLinks.map((social) => (
                  <div key={social.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getPlatformIcon(social.platform)}</span>
                      <div>
                        <div className="font-medium">{social.username}</div>
                        <div className="text-sm text-muted-foreground">{social.followers} followers</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(social.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPortfolio.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => window.open(video.url, '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                      <Badge className={`absolute top-2 left-2 ${getPlatformColor(video.platform)}`}>
                        {getPlatformIcon(video.platform)} {video.platform}
                      </Badge>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        {video.views.toLocaleString()} views
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{video.uploadedAt.toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Viral</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">4.9</div>
                  <div className="flex justify-center mb-2">{renderStars(5)}</div>
                  <div className="text-sm text-muted-foreground">Overall Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">127</div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Recommend</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.reviewer} />
                        <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.reviewer}</h4>
                            <p className="text-sm text-muted-foreground">{review.project}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {review.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Experience & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Gaming Content', 'Lifestyle Vlogs', 'Tech Reviews', 'Music Videos', 'Comedy Skits', 'Educational Content'].map((spec) => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Tools & Software</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Final Cut Pro', 'Photoshop', 'Audition'].map((tool) => (
                      <div key={tool} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Working Process</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Brief & Asset Review</h4>
                        <p className="text-sm text-muted-foreground">I carefully review your requirements and raw footage</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">First Draft</h4>
                        <p className="text-sm text-muted-foreground">Quick turnaround with initial edit for feedback</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Revisions & Polish</h4>
                        <p className="text-sm text-muted-foreground">Incorporate feedback and deliver final version</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}