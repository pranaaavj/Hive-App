import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Eye, MessageSquare, Share2, Heart } from "lucide-react";

const userActivityData = [
  { date: '2024-06-17', users: 1200, sessions: 1800, pageViews: 3400 },
  { date: '2024-06-18', users: 1350, sessions: 2100, pageViews: 3900 },
  { date: '2024-06-19', users: 1100, sessions: 1650, pageViews: 2800 },
  { date: '2024-06-20', users: 1450, sessions: 2200, pageViews: 4100 },
  { date: '2024-06-21', users: 1600, sessions: 2400, pageViews: 4500 },
  { date: '2024-06-22', users: 1250, sessions: 1900, pageViews: 3200 },
  { date: '2024-06-23', users: 1700, sessions: 2600, pageViews: 4800 },
];

const engagementData = [
  { month: 'Jan', likes: 4500, comments: 2400, shares: 1200 },
  { month: 'Feb', likes: 5200, comments: 2800, shares: 1400 },
  { month: 'Mar', likes: 4800, comments: 2600, shares: 1300 },
  { month: 'Apr', likes: 6100, comments: 3200, shares: 1600 },
  { month: 'May', likes: 7200, comments: 3800, shares: 1900 },
  { month: 'Jun', likes: 8400, comments: 4200, shares: 2100 },
];

const demographicsData = [
  { name: '18-24', value: 25, color: '#8884d8' },
  { name: '25-34', value: 35, color: '#82ca9d' },
  { name: '35-44', value: 22, color: '#ffc658' },
  { name: '45-54', value: 12, color: '#ff7c7c' },
  { name: '55+', value: 6, color: '#8dd1e1' },
];

const topCountriesData = [
  { country: 'USA', users: 8400, percentage: 34 },
  { country: 'UK', users: 3200, percentage: 13 },
  { country: 'Canada', users: 2800, percentage: 11 },
  { country: 'Germany', users: 2400, percentage: 10 },
  { country: 'France', users: 2100, percentage: 8 },
  { country: 'Others', users: 6100, percentage: 24 },
];

export const AnalyticsSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-2">Deep dive into your platform's performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">24.8K</div>
                <div className="text-sm text-gray-600">Daily Active Users</div>
                <div className="text-xs text-green-600 mt-1">+12% vs yesterday</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">892K</div>
                <div className="text-sm text-gray-600">Page Views</div>
                <div className="text-xs text-green-600 mt-1">+18% vs last week</div>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">73.2%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
                <div className="text-xs text-green-600 mt-1">+5% vs last month</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">2.4M</div>
                <div className="text-sm text-gray-600">Total Interactions</div>
                <div className="text-xs text-green-600 mt-1">+23% vs last month</div>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Trends</CardTitle>
              <CardDescription>Daily user engagement metrics over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="sessions" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Monthly engagement trends showing likes, comments, and shares</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="likes" stroke="#ff6b6b" strokeWidth={3} />
                  <Line type="monotone" dataKey="comments" stroke="#4ecdc4" strokeWidth={3} />
                  <Line type="monotone" dataKey="shares" stroke="#45b7d1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>User age demographics breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographicsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>User distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCountriesData.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-medium">{index + 1}</div>
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-sm text-gray-600">{country.users.toLocaleString()} users</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium">{country.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};