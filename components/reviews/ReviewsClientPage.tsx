'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Calendar, Eye, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewPreview } from '@/components/review-preview';
import { ReviewSettings } from '@/components/review-settings';
import { DashboardCharts } from '@/components/dashboard-charts';
import { ReviewLinkSharer } from '@/components/reviews/ReviewLinkSharer';
import { ReviewFilterPanel, ReviewFilters } from '@/components/reviews/ReviewFilterPanel';
import { Button } from '@/components/ui/button';

export function ReviewsClientPage({ subaccountId, initialReviews, subaccountName }) {
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filteredReviews = useMemo(() => {
    if (!initialReviews) return [];
    
    let reviews = [...initialReviews];

    if (filters.status) {
      reviews = reviews.filter((review: any) => review.status === filters.status);
    }

    if (filters.rating) {
      reviews = reviews.filter((review: any) => review.rating === filters.rating);
    }
    
    if (filters.dateRange) {
        const now = new Date();
        reviews = reviews.filter((review: any) => {
            const reviewDate = new Date(review.created_at);
            if (filters.dateRange === 'today') {
                return reviewDate.toDateString() === now.toDateString();
            }
            if (filters.dateRange === 'week') {
                const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                return reviewDate >= oneWeekAgo;
            }
            if (filters.dateRange === 'month') {
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return reviewDate >= oneMonthAgo;
            }
            if (filters.dateRange === 'quarter') {
                 const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                 return reviewDate >= quarterStart;
            }
            return true;
        });
    }

    return reviews;
  }, [initialReviews, filters]);

  const stats = {
    total: filteredReviews.length,
    averageRating: filteredReviews.length > 0 ? filteredReviews.reduce((sum: any, r: any) => sum + r.rating, 0) / filteredReviews.length : 0,
    positive: filteredReviews.filter((r:any) => r.rating >= 4).length,
    thisMonth: initialReviews.filter((review: any) => new Date(review.created_at) > new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate())).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Manage customer feedback and review settings</p>
        </div>
        <ReviewLinkSharer subaccountId={subaccountId} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Matching filters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">For matched reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positive}</div>
            <p className="text-xs text-muted-foreground">4+ star ratings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Reviews</CardTitle>
                  <CardDescription>Browse and manage all customer feedback</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowFilterPanel(!showFilterPanel)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showFilterPanel && (
                <ReviewFilterPanel
                  filters={filters}
                  onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
                  onClearFilters={() => setFilters({})} />
              )}
              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                    {filteredReviews.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{review.customer_name}</span>
                            <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{review.subject}</h4>
                            <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(review.created_at).toISOString().split('T')[0]}
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews match the current filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DashboardCharts reviews={initialReviews} />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Preview Review Form</CardTitle>
              <CardDescription>This is how customers will see your review collection page</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewPreview subaccountId={subaccountId} />
            </CardContent>
          </Card>
          <ReviewLinkSharer subaccountId={subaccountId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ReviewSettings subaccountId={subaccountId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
