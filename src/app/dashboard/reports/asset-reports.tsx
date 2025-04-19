'use client';

import React from 'react';
import * as Recharts from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Asset Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Distribution by Type</CardTitle>
                        <CardDescription>Breakdown of assets by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
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
                                    outerRadius={80}
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
                    </CardContent>
                </Card>

                {/* Asset Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Status Overview</CardTitle>
                        <CardDescription>Current status of all assets</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
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
                                    outerRadius={80}
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
                    </CardContent>
                </Card>
            </div>

            {/* Deployment History Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Deployment History</CardTitle>
                    <CardDescription>Monthly asset deployment count</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        className="h-80"
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
                            />
                        </Recharts.BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Recent Deployments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Asset Deployments</CardTitle>
                    <CardDescription>Latest asset deployment records</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
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
                </CardContent>
            </Card>
        </div>
    );
} 