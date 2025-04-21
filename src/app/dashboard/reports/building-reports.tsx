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
const roomsByType = [
  { name: 'CLASSROOM', value: 24, fill: '#2563eb' },
  { name: 'OFFICE', value: 12, fill: '#16a34a' },
  { name: 'LABORATORY', value: 8, fill: '#d97706' },
  { name: 'STORAGE', value: 5, fill: '#9333ea' },
  { name: 'OTHER', value: 3, fill: '#6b7280' }
];

const buildingStats = [
  {
    name: 'KorPhil',
    floors: 4,
    rooms: 32,
    occupancyRate: 85
  },
  {
    name: 'Tech Hub',
    floors: 3,
    rooms: 28,
    occupancyRate: 92
  },
  {
    name: 'Admin Building',
    floors: 2,
    rooms: 18,
    occupancyRate: 78
  },
  {
    name: 'Science Complex',
    floors: 5,
    rooms: 45,
    occupancyRate: 80
  },
  {
    name: 'Library',
    floors: 3,
    rooms: 22,
    occupancyRate: 88
  },
  {
    name: 'Student Center',
    floors: 2,
    rooms: 15,
    occupancyRate: 72
  },
  {
    name: 'Sports Complex',
    floors: 2,
    rooms: 12,
    occupancyRate: 65
  }
];

const roomUtilization = [
  { name: 'Mon', usage: 75 },
  { name: 'Tue', usage: 82 },
  { name: 'Wed', usage: 88 },
  { name: 'Thu', usage: 80 },
  { name: 'Fri', usage: 72 },
  { name: 'Sat', usage: 45 },
  { name: 'Sun', usage: 30 }
];

export default function BuildingReports() {
  // Function to export data as CSV
  const exportToCsv = (data: any[], filename: string) => {
    // Create column headers
    const headers = Object.keys(data[0]);

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
      {/* Room Type Distribution */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Room Distribution by Type</CardTitle>
            <CardDescription>
              Breakdown of rooms by type across all buildings
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(roomsByType, 'room-type-distribution')}
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='room-type-chart' className='w-full max-w-2xl'>
            <ChartContainer
              className='h-96'
              config={{
                CLASSROOM: { color: '#2563eb' },
                OFFICE: { color: '#16a34a' },
                LABORATORY: { color: '#d97706' },
                STORAGE: { color: '#9333ea' },
                OTHER: { color: '#6b7280' }
              }}
            >
              <Recharts.PieChart>
                <Recharts.Pie
                  data={roomsByType}
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
                        `${value} rooms`,
                        `Type: ${name}`
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
                    'room-type-chart',
                    'room-type-distribution'
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

      {/* Room Utilization */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Average Room Utilization</CardTitle>
            <CardDescription>Weekly room usage percentage</CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() =>
              exportToCsv(roomUtilization, 'room-utilization-data')
            }
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='room-utilization-chart' className='w-full max-w-3xl'>
            <ChartContainer
              className='h-96'
              config={{
                usage: { color: '#2563eb' }
              }}
            >
              <Recharts.BarChart data={roomUtilization}>
                <Recharts.XAxis dataKey='name' />
                <Recharts.YAxis domain={[0, 100]} />
                <Recharts.CartesianGrid strokeDasharray='3 3' />
                <Recharts.Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}%`, 'Utilization']}
                    />
                  }
                />
                <Recharts.Bar
                  dataKey='usage'
                  fill='#2563eb'
                  name='Room Usage'
                  barSize={40}
                />
              </Recharts.BarChart>
            </ChartContainer>
            <div className='mt-4 flex justify-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  exportChartAsImage(
                    'room-utilization-chart',
                    'room-utilization-chart'
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

      {/* Building Stats Table */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Building Statistics</CardTitle>
            <CardDescription>
              Overview of buildings, floors, and room statistics
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(buildingStats, 'building-statistics')}
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
                  <TableHead>Building Name</TableHead>
                  <TableHead>Floors</TableHead>
                  <TableHead>Total Rooms</TableHead>
                  <TableHead>Occupancy Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildingStats.map((building) => (
                  <TableRow key={building.name}>
                    <TableCell className='font-medium'>
                      {building.name}
                    </TableCell>
                    <TableCell>{building.floors}</TableCell>
                    <TableCell>{building.rooms}</TableCell>
                    <TableCell>{building.occupancyRate}%</TableCell>
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
