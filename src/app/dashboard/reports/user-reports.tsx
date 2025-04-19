'use client';

import React from 'react';
import * as Recharts from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Mock data for demonstration - would be replaced with actual data from your API/database
const usersByRole = [
    { name: 'admin', value: 3, fill: '#2563eb' },
    { name: 'member', value: 12, fill: '#6b7280' },
    { name: 'manager', value: 5, fill: '#16a34a' },
];

const userActivity = [
    { name: 'Mon', views: 23, logins: 16 },
    { name: 'Tue', views: 25, logins: 18 },
    { name: 'Wed', views: 30, logins: 22 },
    { name: 'Thu', views: 28, logins: 21 },
    { name: 'Fri', views: 32, logins: 24 },
    { name: 'Sat', views: 15, logins: 10 },
    { name: 'Sun', views: 12, logins: 8 },
];

const recentUsers = [
    { id: '1', name: 'John Doe', role: 'admin', lastLogin: '2 hours ago' },
    { id: '2', name: 'Jane Smith', role: 'member', lastLogin: '1 day ago' },
    { id: '3', name: 'Tom Wilson', role: 'manager', lastLogin: '3 days ago' },
    { id: '4', name: 'Lisa Brown', role: 'member', lastLogin: '5 days ago' },
    { id: '5', name: 'Mike Johnson', role: 'member', lastLogin: '1 week ago' },
];

export default function UserReports() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* User Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Distribution by Role</CardTitle>
                        <CardDescription>Breakdown of users by assigned roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                admin: { color: '#2563eb' },
                                member: { color: '#6b7280' },
                                manager: { color: '#16a34a' },
                            }}
                        >
                            <Recharts.PieChart>
                                <Recharts.Pie
                                    data={usersByRole}
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
                                                `${value} users`,
                                                `Role: ${name}`
                                            ]}
                                        />
                                    }
                                />
                                <Recharts.Legend />
                            </Recharts.PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* User Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Activity (Last 7 Days)</CardTitle>
                        <CardDescription>Page views and login activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            className="h-80"
                            config={{
                                views: { color: '#2563eb' },
                                logins: { color: '#16a34a' },
                            }}
                        >
                            <Recharts.LineChart data={userActivity}>
                                <Recharts.XAxis dataKey="name" />
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
                                    dataKey="views"
                                    stroke="#2563eb"
                                    activeDot={{ r: 8 }}
                                    name="Page Views"
                                />
                                <Recharts.Line
                                    type="monotone"
                                    dataKey="logins"
                                    stroke="#16a34a"
                                    name="Logins"
                                />
                            </Recharts.LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Users who have been active recently</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Last Login</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 