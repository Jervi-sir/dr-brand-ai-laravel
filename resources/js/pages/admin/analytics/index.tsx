import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/layouts/admin-layout/admin-layout';

const breadcrumbs = [
  { title: 'Admin', href: '/admin/users' },
  { title: 'Analytics', href: '/admin/analytics' },
];

const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 200 },
  { month: 'Mar', users: 340 },
  { month: 'Apr', users: 500 },
  { month: 'May', users: 750 },
  { month: 'Jun', users: 1000 },
];

const chatActivityData = [
  { day: 'Mon', messages: 1500 },
  { day: 'Tue', messages: 2300 },
  { day: 'Wed', messages: 3400 },
  { day: 'Thu', messages: 2100 },
  { day: 'Fri', messages: 4500 },
  { day: 'Sat', messages: 1200 },
  { day: 'Sun', messages: 900 },
];

export default function AnalyticsIndex() {
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Analytics" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly new user registrations.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Message Activity</CardTitle>
              <CardDescription>Messages sent per day.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
