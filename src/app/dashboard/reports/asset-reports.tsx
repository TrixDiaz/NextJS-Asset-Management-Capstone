'use client';

import React from 'react';
import * as Recharts from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Mock data for demonstration - would be replaced with actual data from your API/database
const assetsByType = [
    { name: 'COMPUTER', value: 45, fill: '#2563eb' },
    { name: 'PRINTER', value: 12, fill: '#d97706' },
    { name: 'PROJECTOR', value: 18, fill: '#16a34a' },
    { name: 'NETWORK_EQUIPMENT', value: 24, fill: '#9333ea' },
    { name: 'OTHER', value: 8, fill: '#6b7280' },
];

const assetStatus = [
    { name: 'WORKING', value: 82, fill: '#16a34a' },
    { name: 'NEEDS_REPAIR', value: 12, fill: '#eab308' },
    { name: 'OUT_OF_SERVICE', value: 3, fill: '#dc2626' },
    { name: 'UNDER_MAINTENANCE', value: 5, fill: '#6b7280' },
];

const deploymentHistory = [
    { month: 'Jan', assets: 10 },
    { month: 'Feb', assets: 15 },
    { month: 'Mar', assets: 8 },
    { month: 'Apr', assets: 12 },
    { month: 'May', assets: 20 },
    { month: 'Jun', assets: 16 },
    { month: 'Jul', assets: 10 },
    { month: 'Aug', assets: 5 },
    { month: 'Sep', assets: 12 },
    { month: 'Oct', assets: 18 },
    { month: 'Nov', assets: 22 },
    { month: 'Dec', assets: 14 },
];

const recentDeployments = [
    {
        id: '1',
        assetType: 'COMPUTER',
        location: 'Room 302, KorPhil',
        date: '2023-10-15',
        status: 'WORKING'
    },
    {
        id: '2',
        assetType: 'PRINTER',
        location: 'Admin Office, Tech Hub',
        date: '2023-10-10',
        status: 'WORKING'
    },
    {
        id: '3',
        assetType: 'PROJECTOR',
        location: 'Room 201, Admin Building',
        date: '2023-10-05',
        status: 'NEEDS_REPAIR'
    },
    {
        id: '4',
        assetType: 'NETWORK_EQUIPMENT',
        location: 'Server Room, Tech Hub',
        date: '2023-09-28',
        status: 'WORKING'
    },
    {
        id: '5',
        assetType: 'COMPUTER',
        location: 'Lab 105, Science Complex',
        date: '2023-09-20',
        status: 'UNDER_MAINTENANCE'
    },
    {
        id: '6',
        assetType: 'COMPUTER',
        location: 'Room 405, Library',
        date: '2023-09-15',
        status: 'WORKING'
    },
    {
        id: '7',
        assetType: 'PROJECTOR',
        location: 'Conference Room, Admin Building',
        date: '2023-09-10',
        status: 'WORKING'
    },
    {
        id: '8',
        assetType: 'PRINTER',
        location: 'Faculty Room, KorPhil',
        date: '2023-09-05',
        status: 'NEEDS_REPAIR'
    },
    {
        id: '9',
        assetType: 'NETWORK_EQUIPMENT',
        location: 'IT Office, Tech Hub',
        date: '2023-09-01',
        status: 'WORKING'
    },
    {
        id: '10',
        assetType: 'COMPUTER',
        location: 'Room 103, Student Center',
        date: '2023-08-28',
        status: 'OUT_OF_SERVICE'
    }
];

export default function AssetReports() {
    // Helper function to render asset status with appropriate badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'WORKING':
                return <Badge className="bg-green-500">Working</Badge>;
            case 'NEEDS_REPAIR':
                return <Badge className="bg-yellow-500">Needs Repair</Badge>;
            case 'OUT_OF_SERVICE':
                return <Badge className="bg-red-500">Out of Service</Badge>;
            case 'UNDER_MAINTENANCE':
                return <Badge className="bg-gray-500">Under Maintenance</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Function to export data as CSV
    const exportToCsv = (data: any[], filename: string) => {
        // Create column headers
        const headers = Object.keys(data[ 0 ]).filter(key => key !== 'id');

        // Convert data to CSV format
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    if (header === 'status') {
                        return row[ header ]; // Return raw status value
                    }
                    return typeof row[ header ] === 'string' && row[ header ].includes(',')
                        ? `"${row[ header ]}"`
                        : row[ header ];
                }).join(',')
            )
        ].join('\n');

        // Create and download the file
        const blob = new Blob([ csvContent ], { type: 'text/csv;charset=utf-8;' });
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
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="space-y-6">
            {/* Asset Type Distribution */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Asset Distribution by Type</CardTitle>
                        <CardDescription>Breakdown of assets by category</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-1"
                        onClick={() => exportToCsv(assetsByType, 'asset-type-distribution')}
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    <div id="asset-type-chart" className="w-full max-w-2xl">
                        <ChartContainer
                            className="h-96"
                            config={{
                                COMPUTER: { color: '#2563eb' },
                                PRINTER: { color: '#d97706' },
                                PROJECTOR: { color: '#16a34a' },
                                NETWORK_EQUIPMENT: { color: '#9333ea' },
                                OTHER: { color: '#6b7280' },
                            }}
                        >
                            <Recharts.PieChart>
                                <Recharts.Pie
                                    data={assetsByType}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => [
                                                `${value} units`,
                                                `Type: ${name}`
                                            ]}
                                        />
                                    }
                                />
                                <Recharts.Legend />
                            </Recharts.PieChart>
                        </ChartContainer>
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportChartAsImage('asset-type-chart', 'asset-type-distribution')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Chart
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Asset Status Distribution */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Asset Status Overview</CardTitle>
                        <CardDescription>Current status of all assets</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-1"
                        onClick={() => exportToCsv(assetStatus, 'asset-status-distribution')}
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    <div id="asset-status-chart" className="w-full max-w-2xl">
                        <ChartContainer
                            className="h-96"
                            config={{
                                WORKING: { color: '#16a34a' },
                                NEEDS_REPAIR: { color: '#eab308' },
                                OUT_OF_SERVICE: { color: '#dc2626' },
                                UNDER_MAINTENANCE: { color: '#6b7280' },
                            }}
                        >
                            <Recharts.PieChart>
                                <Recharts.Pie
                                    data={assetStatus}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => [
                                                `${value} units`,
                                                `Status: ${name}`
                                            ]}
                                        />
                                    }
                                />
                                <Recharts.Legend />
                            </Recharts.PieChart>
                        </ChartContainer>
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportChartAsImage('asset-status-chart', 'asset-status-distribution')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Chart
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deployment History Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Asset Deployment History</CardTitle>
                        <CardDescription>Monthly asset deployment count</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-1"
                        onClick={() => exportToCsv(deploymentHistory, 'deployment-history-data')}
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Data</span>
                    </Button>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    <div id="deployment-history-chart" className="w-full max-w-3xl">
                        <ChartContainer
                            className="h-96"
                            config={{
                                assets: { color: '#2563eb' },
                            }}
                        >
                            <Recharts.BarChart data={deploymentHistory}>
                                <Recharts.XAxis dataKey="month" />
                                <Recharts.YAxis />
                                <Recharts.CartesianGrid strokeDasharray="3 3" />
                                <Recharts.Tooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => [ `${value} units`, 'Deployed' ]}
                                        />
                                    }
                                />
                                <Recharts.Bar
                                    dataKey="assets"
                                    fill="#2563eb"
                                    name="Assets Deployed"
                                    barSize={40}
                                />
                            </Recharts.BarChart>
                        </ChartContainer>
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportChartAsImage('deployment-history-chart', 'deployment-history-chart')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Chart
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Deployments Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Asset Deployments</CardTitle>
                        <CardDescription>Latest asset deployment records</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-1"
                        onClick={() => exportToCsv(recentDeployments, 'asset-deployments')}
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-auto max-h-[400px]">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead>Asset Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Deployment Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDeployments.map((deployment) => (
                                    <TableRow key={deployment.id}>
                                        <TableCell className="font-medium">{deployment.assetType}</TableCell>
                                        <TableCell>{deployment.location}</TableCell>
                                        <TableCell>{deployment.date}</TableCell>
                                        <TableCell>{renderStatusBadge(deployment.status)}</TableCell>
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