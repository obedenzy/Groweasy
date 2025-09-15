'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const barChartConfig = { count: { label: "Count", color: "#2563eb" } };
const sentimentChartConfig = {
    positive: { label: "Positive", color: "#00C49F" },
    negative: { label: "Negative", color: "#FF8042" },
    neutral: { label: "Neutral", color: "#0088FE" },
};

export function SubaccountDashboardClient({ chartData, recentReviews }) {
  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>Breakdown of star ratings from all reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={barChartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData.ratingDistribution}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Review Volume</CardTitle>
                    <CardDescription>Number of reviews received over the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={barChartConfig} className="min-h-[200px] w-full">
                        <LineChart accessibilityLayer data={chartData.reviewVolume} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                             <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={true} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader>
                    <CardTitle>Sentiment Analysis</CardTitle>
                    <CardDescription>Sentiment breakdown of review content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={sentimentChartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="sentiment" />} />
                            <Pie data={chartData.sentimentAnalysis} dataKey="count" nameKey="sentiment">
                                {chartData.sentimentAnalysis.map((entry) => (
                                    <Cell key={`cell-${entry.sentiment}`} fill={`var(--color-${entry.sentiment.toLowerCase()})`} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                    <CardDescription>A list of the most recent customer reviews.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.reviewer_name}</p>
                          <div className="flex items-center">
                            <span className="font-bold">{review.rating}</span>
                            <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-500" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {review.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                     {recentReviews.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No reviews yet.</p>
                        </div>
                     )}
                  </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
