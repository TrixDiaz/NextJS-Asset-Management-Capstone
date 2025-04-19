'use client';

import React from 'react';
import * as Recharts from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Mock data for demonstration - would be replaced with actual data from your API/database
const roomsByType = [
    { name: 'CLASSROOM', value: 24, fill: '#2563eb' },
    { name: 'OFFICE', value: 12, fill: '#16a34a' },
    { name: 'LABORATORY', value: 8, fill: '#d97706' },
    { name: 'STORAGE', value: 5, fill: '#9333ea' },
    { name: 'OTHER', value: 3, fill: '#6b7280' },
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
];

const roomUtilization = [
    { name: 'Mon', usage: 75 },
    { name: 'Tue', usage: 82 },
    { name: 'Wed', usage: 88 },
    { name: 'Thu', usage: 80 },
    { name: 'Fri', usage: 72 },
    { name: 'Sat', usage: 45 },
    { name: 'Sun', usage: 30 },
];

export default function BuildingReports() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Room Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Room Distribution by Type</CardTitle>
                        <CardDescription>Breakdown of rooms by type across all buildings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                CLASSROOM: { color: '#2563eb' },
                                OFFICE: { color: '#16a34a' },
                                LABORATORY: { color: '#d97706' },
                                STORAGE: { color: '#9333ea' },
                                OTHER: { color: '#6b7280' },
                            }}
                        >
                            <Recharts.PieChart>
                                <Recharts.Pie
                                    data={roomsByType}
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
                                                `${value} rooms`,
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

                {/* Room Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Average Room Utilization</CardTitle>
                        <CardDescription>Weekly room usage percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                usage: { color: '#2563eb' },
                            }}
                        >
                            <Recharts.BarChart data={roomUtilization}>
                                <Recharts.XAxis dataKey="name" />
                                <Recharts.YAxis domain={[ 0, 100 ]} />
                                <Recharts.CartesianGrid strokeDasharray="3 3" />
                                <Recharts.Tooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => [ `${value}%`, 'Utilization' ]}
                                        />
                                    }
                                />
                                <Recharts.Bar
                                    dataKey="usage"
                                    fill="#2563eb"
                                    name="Room Usage"
                                />
                            </Recharts.BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Building Stats Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Building Statistics</CardTitle>
                    <CardDescription>Overview of buildings, floors, and room statistics</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
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
                                    <TableCell className="font-medium">{building.name}</TableCell>
                                    <TableCell>{building.floors}</TableCell>
                                    <TableCell>{building.rooms}</TableCell>
                                    <TableCell>{building.occupancyRate}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 