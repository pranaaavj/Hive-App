import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const statsData = [
  { title: "Total Users", value: "24,847", change: "+12%", icon: Users, color: "text-blue-600" },
  { title: "Total Posts", value: "8,423", change: "+8%", icon: FileText, color: "text-green-600" },
  { title: "Comments", value: "45,632", change: "+23%", icon: MessageSquare, color: "text-purple-600" },
  { title: "Engagement Rate", value: "73.2%", change: "+5%", icon: TrendingUp, color: "text-orange-600" },
  { title: "Reported Content", value: "34", change: "-15%", icon: AlertTriangle, color: "text-red-600" },
  { title: "Page Views", value: "892K", change: "+18%", icon: Eye, color: "text-indigo-600" },
];

const chartData = [
  { name: 'Jan', users: 4000, posts: 2400 },
  { name: 'Feb', users: 3000, posts: 1398 },
  { name: 'Mar', users: 2000, posts: 9800 },
  { name: 'Apr', users: 2780, posts: 3908 },
  { name: 'May', users: 1890, posts: 4800 },
  { name: 'Jun', users: 2390, posts: 3800 },
];

const pieData = [
  { name: 'Photos', value: 45, color: '#8884d8' },
  { name: 'Videos', value: 30, color: '#82ca9d' },
  { name: 'Text', value: 25, color: '#ffc658' },
];

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your social media platform's performance and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User & Post Growth</CardTitle>
            <CardDescription>Monthly growth trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Users" />
                <Bar dataKey="posts" fill="#10b981" name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Breakdown of content types on your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and events on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New user registered", user: "john.doe@email.com", time: "2 minutes ago", type: "user" },
              { action: "Post reported", user: "Inappropriate content", time: "5 minutes ago", type: "report" },
              { action: "Comment flagged", user: "Spam detection", time: "12 minutes ago", type: "flag" },
              { action: "User banned", user: "policy_violation_user", time: "1 hour ago", type: "ban" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-green-500' :
                    activity.type === 'report' ? 'bg-red-500' :
                    activity.type === 'flag' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};