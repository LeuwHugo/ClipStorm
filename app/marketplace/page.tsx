'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SearchFilters } from '@/components/marketplace/search-filters';
import { ClipperCard } from '@/components/marketplace/clipper-card';
import { User } from '@/lib/types';

// Mock data - in real app, this would come from Supabase
const mockClippers: User[] = [
  {
    id: '1',
    email: 'alex@example.com',
    displayName: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'clipper',
    bio: 'Professional video editor with 5+ years of experience creating viral content for top creators.',
    rating: 4.9,
    reviewCount: 127,
    turnaroundTime: 24,
    languages: ['English', 'Spanish'],
    portfolio: ['video1.mp4', 'video2.mp4', 'video3.mp4'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'sarah@example.com',
    displayName: 'Sarah Wilson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'clipper',
    bio: 'Gaming content specialist. I help streamers and gamers create engaging highlights and montages.',
    rating: 4.8,
    reviewCount: 89,
    turnaroundTime: 12,
    languages: ['English'],
    portfolio: ['video1.mp4', 'video2.mp4'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'mike@example.com',
    displayName: 'Mike Rodriguez',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'clipper',
    bio: 'Lifestyle and travel content creator. Specializing in aesthetic edits that capture attention.',
    rating: 4.7,
    reviewCount: 156,
    turnaroundTime: 48,
    languages: ['English', 'Spanish', 'French'],
    portfolio: ['video1.mp4', 'video2.mp4', 'video3.mp4', 'video4.mp4'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: 1,
    turnaroundTime: 168,
    languages: [] as string[],
  });

  const filteredClippers = mockClippers.filter(clipper => {
    const matchesSearch = clipper.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clipper.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = (clipper.rating || 0) >= filters.minRating;
    const matchesTurnaround = (clipper.turnaroundTime || 24) <= filters.turnaroundTime;
    
    return matchesSearch && matchesRating && matchesTurnaround;
  });

  const handleViewProfile = (clipperId: string) => {
    router.push(`/marketplace/clipper/${clipperId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Video Editor</h1>
          <p className="text-muted-foreground">
            Browse through our curated list of professional video editors specializing in short-form content
          </p>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredClippers.length} editors found
          </p>
        </div>

        {filteredClippers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClippers.map((clipper, index) => (
              <motion.div
                key={clipper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ClipperCard clipper={clipper} onViewProfile={handleViewProfile} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No editors found matching your criteria</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}