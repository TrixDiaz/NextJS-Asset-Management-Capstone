'use client';

import React from 'react';
import * as Recharts from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data for demonstration - would be replaced with actual data from your API/database
const usersByRole = [
  { name: 'admin', value: 3, fill: '#2563eb' },
  { name: 'member', value: 12, fill: '#6b7280' },
  { name: 'manager', value: 5, fill: '#16a34a' }
];

const userActivity = [
  { name: 'Mon', views: 23, logins: 16 },
  { name: 'Tue', views: 25, logins: 18 },
  { name: 'Wed', views: 30, logins: 22 },
  { name: 'Thu', views: 28, logins: 21 },
  { name: 'Fri', views: 32, logins: 24 },
  { name: 'Sat', views: 15, logins: 10 },
  { name: 'Sun', views: 12, logins: 8 }
];

const recentUsers = [
  { id: '1', name: 'John Doe', role: 'admin', lastLogin: '2 hours ago' },
  { id: '2', name: 'Jane Smith', role: 'member', lastLogin: '1 day ago' },
  { id: '3', name: 'Tom Wilson', role: 'manager', lastLogin: '3 days ago' },
  { id: '4', name: 'Lisa Brown', role: 'member', lastLogin: '5 days ago' },
  { id: '5', name: 'Mike Johnson', role: 'member', lastLogin: '1 week ago' },
  { id: '6', name: 'Sarah Miller', role: 'member', lastLogin: '2 weeks ago' },
  { id: '7', name: 'David Jones', role: 'manager', lastLogin: '3 weeks ago' },
  { id: '8', name: 'Emily Wilson', role: 'member', lastLogin: '1 month ago' }
];

export default function UserReports() {
  // Function to export data as CSV
  const exportToCsv = (data: any[], filename: string) => {
    // Create column headers
    const headers = Object.keys(data[0]).filter((key) => key !== 'id');

    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) =>
            typeof row[header] === 'string' && row[header].includes(',')
              ? `"${row[header]}"`
              : row[header]
          )
          .join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export chart as image
  const exportChartAsImage = (chartId: string, filename: string) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // Get SVG element
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const svgRect = svgElement.getBoundingClientRect();
    canvas.width = svgRect.width;
    canvas.height = svgRect.height;

    // Create image from SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      // Download the image
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className='space-y-6'>
      {/* User Role Distribution */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>
              Breakdown of users by assigned roles
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(usersByRole, 'user-role-distribution')}
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='user-role-chart' className='w-full max-w-2xl'>
            <ChartContainer
              className='h-96'
              config={{
                admin: { color: '#2563eb' },
                member: { color: '#6b7280' },
                manager: { color: '#16a34a' }
              }}
            >
              <Recharts.PieChart>
                <Recharts.Pie
                  data={usersByRole}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value} users`,
                        `Role: ${name}`
                      ]}
                    />
                  }
                />
                <Recharts.Legend />
              </Recharts.PieChart>
            </ChartContainer>
            <div className='mt-4 flex justify-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  exportChartAsImage(
                    'user-role-chart',
                    'user-role-distribution'
                  )
                }
              >
                <Download className='mr-2 h-4 w-4' />
                Export Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>User Activity (Last 7 Days)</CardTitle>
            <CardDescription>Page views and login activity</CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(userActivity, 'user-activity-data')}
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='user-activity-chart' className='w-full max-w-3xl'>
            <ChartContainer
              className='h-96'
              config={{
                views: { color: '#2563eb' },
                logins: { color: '#16a34a' }
              }}
            >
              <Recharts.LineChart data={userActivity}>
                <Recharts.XAxis dataKey='name' />
                <Recharts.YAxis />
                <Recharts.CartesianGrid strokeDasharray='3 3' />
                <Recharts.Tooltip content={<ChartTooltipContent />} />
                <Recharts.Legend />
                <Recharts.Line
                  type='monotone'
                  dataKey='views'
                  stroke='#2563eb'
                  activeDot={{ r: 8 }}
                  name='Page Views'
                  strokeWidth={2}
                />
                <Recharts.Line
                  type='monotone'
                  dataKey='logins'
                  stroke='#16a34a'
                  name='Logins'
                  strokeWidth={2}
                />
              </Recharts.LineChart>
            </ChartContainer>
            <div className='mt-4 flex justify-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  exportChartAsImage(
                    'user-activity-chart',
                    'user-activity-chart'
                  )
                }
              >
                <Download className='mr-2 h-4 w-4' />
                Export Chart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>
              Users who have been active recently
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(recentUsers, 'user-activity')}
          >
            <Download className='h-4 w-4' />
            <span>Export</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className='max-h-[400px] overflow-auto rounded-md border'>
            <Table>
              <TableHeader className='bg-background sticky top-0 z-10'>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
