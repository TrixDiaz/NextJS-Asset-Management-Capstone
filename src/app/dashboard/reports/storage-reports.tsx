'use client';

import React from 'react';
import * as Recharts from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration - would be replaced with actual data from your API/database
const storageItemsByType = [
    { name: 'CABLE', value: 32, fill: '#2563eb' },
    { name: 'SOFTWARE', value: 18, fill: '#16a34a' },
    { name: 'HARDWARE', value: 45, fill: '#d97706' },
    { name: 'PERIPHERALS', value: 24, fill: '#9333ea' },
    { name: 'OFFICE_SUPPLIES', value: 30, fill: '#6b7280' },
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
    { month: 'Dec', incoming: 50, outgoing: 45 },
];

const lowStockItems = [
    { id: '1', name: 'HDMI Cable', type: 'CABLE', quantity: 5, threshold: 10 },
    { id: '2', name: 'Printer Toner', type: 'HARDWARE', quantity: 2, threshold: 5 },
    { id: '3', name: 'USB Flash Drives', type: 'HARDWARE', quantity: 7, threshold: 15 },
    { id: '4', name: 'Network Switches', type: 'HARDWARE', quantity: 1, threshold: 3 },
    { id: '5', name: 'Office Paper', type: 'OFFICE_SUPPLIES', quantity: 10, threshold: 20 },
];

const topDeployedItems = [
    {
        id: '1',
        name: 'HDMI Cable',
        type: 'CABLE',
        totalDeployed: 120,
        lastDeployed: '2023-10-12',
    },
    {
        id: '2',
        name: 'VGA Cable',
        type: 'CABLE',
        totalDeployed: 95,
        lastDeployed: '2023-10-15',
    },
    {
        id: '3',
        name: 'Mouse',
        type: 'PERIPHERALS',
        totalDeployed: 85,
        lastDeployed: '2023-10-10',
    },
    {
        id: '4',
        name: 'Keyboard',
        type: 'PERIPHERALS',
        totalDeployed: 80,
        lastDeployed: '2023-10-08',
    },
    {
        id: '5',
        name: 'Monitor',
        type: 'HARDWARE',
        totalDeployed: 65,
        lastDeployed: '2023-09-30',
    },
];

export default function StorageReports() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Storage Item Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Storage Items by Type</CardTitle>
                        <CardDescription>Distribution of items in storage by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                CABLE: { color: '#2563eb' },
                                SOFTWARE: { color: '#16a34a' },
                                HARDWARE: { color: '#d97706' },
                                PERIPHERALS: { color: '#9333ea' },
                                OFFICE_SUPPLIES: { color: '#6b7280' },
                            }}
                        >
                            <Recharts.PieChart>
                                <Recharts.Pie
                                    data={storageItemsByType}
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
                                                `${value} items`,
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

                {/* Stock Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Movement Trends</CardTitle>
                        <CardDescription>Monthly incoming and outgoing inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                incoming: { color: '#2563eb' },
                                outgoing: { color: '#dc2626' },
                            }}
                        >
                            <Recharts.LineChart data={stockTrends}>
                                <Recharts.XAxis dataKey="month" />
                                <Recharts.YAxis />
                                <Recharts.CartesianGrid strokeDasharray="3 3" />
                                <Recharts.Tooltip
                                    content={
                                        <ChartTooltipContent />
                                    }
                                />
                                <Recharts.Legend />
                                <Recharts.Line
                                    type="monotone"
                                    dataKey="incoming"
                                    stroke="#2563eb"
                                    activeDot={{ r: 8 }}
                                    name="Incoming"
                                />
                                <Recharts.Line
                                    type="monotone"
                                    dataKey="outgoing"
                                    stroke="#dc2626"
                                    activeDot={{ r: 8 }}
                                    name="Outgoing"
                                />
                            </Recharts.LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Alert</CardTitle>
                    <CardDescription>Items with stock levels below threshold</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
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
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.threshold}</TableCell>
                                    <TableCell>
                                        {item.quantity <= item.threshold / 2
                                            ? <Badge className="bg-red-500">Critical</Badge>
                                            : <Badge className="bg-yellow-500">Low</Badge>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Top Deployed Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Most Deployed Items</CardTitle>
                    <CardDescription>Items with highest deployment frequency</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
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
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.totalDeployed} units</TableCell>
                                    <TableCell>{item.lastDeployed}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 