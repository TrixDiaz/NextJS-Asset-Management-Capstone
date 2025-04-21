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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data for demonstration - would be replaced with actual data from your API/database
const storageItemsByType = [
  { name: 'CABLE', value: 32, fill: '#2563eb' },
  { name: 'SOFTWARE', value: 18, fill: '#16a34a' },
  { name: 'HARDWARE', value: 45, fill: '#d97706' },
  { name: 'PERIPHERALS', value: 24, fill: '#9333ea' },
  { name: 'OFFICE_SUPPLIES', value: 30, fill: '#6b7280' }
];

const stockTrends = [
  { month: 'Jan', incoming: 48, outgoing: 32 },
  { month: 'Feb', incoming: 38, outgoing: 30 },
  { month: 'Mar', incoming: 52, outgoing: 36 },
  { month: 'Apr', incoming: 42, outgoing: 28 },
  { month: 'May', incoming: 60, outgoing: 50 },
  { month: 'Jun', incoming: 55, outgoing: 40 },
  { month: 'Jul', incoming: 45, outgoing: 35 },
  { month: 'Aug', incoming: 30, outgoing: 25 },
  { month: 'Sep', incoming: 48, outgoing: 38 },
  { month: 'Oct', incoming: 55, outgoing: 42 },
  { month: 'Nov', incoming: 62, outgoing: 48 },
  { month: 'Dec', incoming: 50, outgoing: 45 }
];

const lowStockItems = [
  { id: '1', name: 'HDMI Cable', type: 'CABLE', quantity: 5, threshold: 10 },
  {
    id: '2',
    name: 'Printer Toner',
    type: 'HARDWARE',
    quantity: 2,
    threshold: 5
  },
  {
    id: '3',
    name: 'USB Flash Drives',
    type: 'HARDWARE',
    quantity: 7,
    threshold: 15
  },
  {
    id: '4',
    name: 'Network Switches',
    type: 'HARDWARE',
    quantity: 1,
    threshold: 3
  },
  {
    id: '5',
    name: 'Office Paper',
    type: 'OFFICE_SUPPLIES',
    quantity: 10,
    threshold: 20
  },
  { id: '6', name: 'Mouse', type: 'PERIPHERALS', quantity: 8, threshold: 20 },
  {
    id: '7',
    name: 'Keyboard',
    type: 'PERIPHERALS',
    quantity: 5,
    threshold: 15
  },
  { id: '8', name: 'VGA Cable', type: 'CABLE', quantity: 3, threshold: 8 },
  {
    id: '9',
    name: 'Power Supply',
    type: 'HARDWARE',
    quantity: 2,
    threshold: 5
  },
  {
    id: '10',
    name: 'Network Cable',
    type: 'CABLE',
    quantity: 12,
    threshold: 25
  },
  {
    id: '11',
    name: 'Staplers',
    type: 'OFFICE_SUPPLIES',
    quantity: 6,
    threshold: 15
  },
  { id: '12', name: 'Monitors', type: 'HARDWARE', quantity: 4, threshold: 10 }
];

const topDeployedItems = [
  {
    id: '1',
    name: 'HDMI Cable',
    type: 'CABLE',
    totalDeployed: 120,
    lastDeployed: '2023-10-12'
  },
  {
    id: '2',
    name: 'VGA Cable',
    type: 'CABLE',
    totalDeployed: 95,
    lastDeployed: '2023-10-15'
  },
  {
    id: '3',
    name: 'Mouse',
    type: 'PERIPHERALS',
    totalDeployed: 85,
    lastDeployed: '2023-10-10'
  },
  {
    id: '4',
    name: 'Keyboard',
    type: 'PERIPHERALS',
    totalDeployed: 80,
    lastDeployed: '2023-10-08'
  },
  {
    id: '5',
    name: 'Monitor',
    type: 'HARDWARE',
    totalDeployed: 65,
    lastDeployed: '2023-09-30'
  },
  {
    id: '6',
    name: 'Power Supply',
    type: 'HARDWARE',
    totalDeployed: 55,
    lastDeployed: '2023-09-25'
  },
  {
    id: '7',
    name: 'Network Cable',
    type: 'CABLE',
    totalDeployed: 78,
    lastDeployed: '2023-10-02'
  },
  {
    id: '8',
    name: 'USB Flash Drive',
    type: 'HARDWARE',
    totalDeployed: 110,
    lastDeployed: '2023-10-05'
  }
];

export default function StorageReports() {
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
      {/* Storage Item Type Distribution */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Storage Items by Type</CardTitle>
            <CardDescription>
              Distribution of items in storage by category
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() =>
              exportToCsv(storageItemsByType, 'storage-item-types')
            }
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='storage-type-chart' className='w-full max-w-2xl'>
            <ChartContainer
              className='h-96'
              config={{
                CABLE: { color: '#2563eb' },
                SOFTWARE: { color: '#16a34a' },
                HARDWARE: { color: '#d97706' },
                PERIPHERALS: { color: '#9333ea' },
                OFFICE_SUPPLIES: { color: '#6b7280' }
              }}
            >
              <Recharts.PieChart>
                <Recharts.Pie
                  data={storageItemsByType}
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
                        `${value} items`,
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
                    'storage-type-chart',
                    'storage-items-by-type'
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

      {/* Stock Trends */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Inventory Movement Trends</CardTitle>
            <CardDescription>
              Monthly incoming and outgoing inventory
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(stockTrends, 'inventory-movement-data')}
          >
            <Download className='h-4 w-4' />
            <span>Export Data</span>
          </Button>
        </CardHeader>
        <CardContent className='flex items-center justify-center'>
          <div id='inventory-trend-chart' className='w-full max-w-3xl'>
            <ChartContainer
              className='h-96'
              config={{
                incoming: { color: '#2563eb' },
                outgoing: { color: '#dc2626' }
              }}
            >
              <Recharts.LineChart data={stockTrends}>
                <Recharts.XAxis dataKey='month' />
                <Recharts.YAxis />
                <Recharts.CartesianGrid strokeDasharray='3 3' />
                <Recharts.Tooltip content={<ChartTooltipContent />} />
                <Recharts.Legend />
                <Recharts.Line
                  type='monotone'
                  dataKey='incoming'
                  stroke='#2563eb'
                  activeDot={{ r: 8 }}
                  name='Incoming'
                  strokeWidth={2}
                />
                <Recharts.Line
                  type='monotone'
                  dataKey='outgoing'
                  stroke='#dc2626'
                  activeDot={{ r: 8 }}
                  name='Outgoing'
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
                    'inventory-trend-chart',
                    'inventory-movement-trends'
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

      {/* Low Stock Items */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Low Stock Alert</CardTitle>
            <CardDescription>
              Items with stock levels below threshold
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(lowStockItems, 'low-stock-items')}
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.threshold}</TableCell>
                    <TableCell>
                      {item.quantity <= item.threshold / 2 ? (
                        <Badge className='bg-red-500'>Critical</Badge>
                      ) : (
                        <Badge className='bg-yellow-500'>Low</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Deployed Items */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Most Deployed Items</CardTitle>
            <CardDescription>
              Items with highest deployment frequency
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='ml-auto flex items-center gap-1'
            onClick={() => exportToCsv(topDeployedItems, 'top-deployed-items')}
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Deployed</TableHead>
                  <TableHead>Last Deployed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDeployedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.totalDeployed} units</TableCell>
                    <TableCell>{item.lastDeployed}</TableCell>
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
