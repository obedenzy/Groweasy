'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ReviewFilters {
  status?: string;
  rating?: number;
  dateRange?: string;
}

interface ReviewFilterPanelProps {
  filters: ReviewFilters;
  onFilterChange: (key: keyof ReviewFilters, value: any) => void;
  onClearFilters: () => void;
}

export function ReviewFilterPanel({ filters, onFilterChange, onClearFilters }: ReviewFilterPanelProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border bg-card text-card-foreground p-4 mb-4 shadow-sm">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Status</label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Rating</label>
          <Select
            value={filters.rating?.toString() || 'all'}
            onValueChange={(value) => onFilterChange('rating', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">Date Range</label>
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(value) => onFilterChange('dateRange', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
       <Button onClick={onClearFilters} variant="ghost" size="sm">
          Clear
       </Button>
    </div>
  );
}
