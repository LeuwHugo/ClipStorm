'use client';

import { Search, Filter, Star, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    minRating: number;
    maxPrice: number;
    turnaroundTime: number;
    languages: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function SearchFilters({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange 
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for video editors..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
            <SelectItem value="fastest">Fastest Delivery</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Minimum Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => 
                      onFiltersChange({ ...filters, minRating: value[0] })
                    }
                    max={5}
                    min={0}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm">{filters.minRating}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Maximum Price (per 1K views)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="h-4 w-4" />
                  <Slider
                    value={[filters.maxPrice]}
                    onValueChange={(value) => 
                      onFiltersChange({ ...filters, maxPrice: value[0] })
                    }
                    max={1}
                    min={0.01}
                    step={0.01}
                    className="flex-1"
                  />
                  <span className="text-sm">${filters.maxPrice}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Turnaround Time (hours)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" />
                  <Slider
                    value={[filters.turnaroundTime]}
                    onValueChange={(value) => 
                      onFiltersChange({ ...filters, turnaroundTime: value[0] })
                    }
                    max={168}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm">{filters.turnaroundTime}h</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.languages.map((lang) => (
          <Badge key={lang} variant="secondary" className="cursor-pointer">
            {lang}
          </Badge>
        ))}
      </div>
    </div>
  );
}