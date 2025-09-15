import { getCurrentUser, hasSubaccountAccess } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { SubaccountDashboardClient } from '@/components/analytics/SubaccountDashboardClient';

// Helper function to analyze sentiment (basic example)
function analyzeSentiment(text: string): 'Positive' | 'Negative' | 'Neutral' {
    if (!text) return 'Neutral';
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'best', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'horrible', 'awful', 'hate', 'worst', 'disappointing'];
    const word = text.toLowerCase();
    if (positiveWords.some(p => word.includes(p))) return 'Positive';
    if (negativeWords.some(n => word.includes(n))) return 'Negative';
    return 'Neutral';
}


export default async function SubaccountDashboardPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const hasAccess = await hasSubaccountAccess(params.subaccountId);
  if (!hasAccess) {
    notFound();
  }

  const [subaccountData, reviewsData] = await Promise.all([
    supabaseAdmin.from('subaccounts').select('name').eq('id', params.subaccountId).single(),
    supabaseAdmin.from('reviews').select('id, rating, content, reviewer_name, created_at').eq('subaccount_id', params.subaccountId)
  ]);

  if (!subaccountData.data) {
    notFound();
  }

  const reviews = reviewsData.data || [];
  const totalReviews = reviews.length;

  // Calculate summary stats
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;

  // Prepare data for charts
  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    name: `${i + 1} Star`,
    count: reviews.filter(r => r.rating === i + 1).length,
  }));

  const reviewVolume = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      return {
          date: dateString,
          count: reviews.filter(r => new Date(r.created_at).toISOString().split('T')[0] === dateString).length
      }
  }).reverse();

  const sentimentAnalysis = reviews.reduce((acc, review) => {
    const sentiment = analyzeSentiment(review.content);
    const existing = acc.find(item => item.sentiment === sentiment);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ sentiment, count: 1 });
    }
    return acc;
  }, []);

  const chartData = { ratingDistribution, reviewVolume, sentimentAnalysis };
  const recentReviews = reviews.slice(0, 5);

  const summaryStats = [
    { title: 'Total Reviews', value: totalReviews.toLocaleString(), icon: Star, color: 'text-yellow-600' },
    { title: 'Average Rating', value: `${averageRating.toFixed(1)}★`, icon: TrendingUp, color: 'text-purple-600' },
    { title: 'Positive Reviews', value: positiveReviews.toLocaleString(), icon: ThumbsUp, color: 'text-green-600' },
    { title: 'Negative Reviews', value: negativeReviews.toLocaleString(), icon: ThumbsDown, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{subaccountData.data.name} Dashboard</h1>
        <p className="text-muted-foreground">An overview of your business's online reputation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <SubaccountDashboardClient chartData={chartData} recentReviews={recentReviews} />

    </div>
  );
}
