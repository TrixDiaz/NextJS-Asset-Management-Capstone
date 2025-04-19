import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import TicketListTab from './components/ticket-list-tab';
import TicketStatusFilter from './components/ticket-status-filter';
import CreateTicketButton from './components/create-ticket-button';

export const metadata = {
    title: 'Tickets | Dashboard',
};

export default function TicketsPage() {
    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto pb-8 m-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 p-2">
                <div>
                    <h1 className="text-2xl font-bold">Tickets</h1>
                    <p className="text-muted-foreground">
                        Manage and track asset-related issues with the ticketing system
                    </p>
                </div>
                <CreateTicketButton />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:gap-4 px-2">
                    <TabsList>
                        <TabsTrigger value="all">All Tickets</TabsTrigger>
                        <TabsTrigger value="created">Created by Me</TabsTrigger>
                        <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                    </TabsList>
                    <TicketStatusFilter />
                </div>

                <TabsContent value="all" className="mt-4">
                    <Card>
                        <CardHeader className="px-6">
                            <CardTitle>All Tickets</CardTitle>
                            <CardDescription>View all tickets you have access to based on your role.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[60vh] overflow-y-auto px-6 py-4">
                            <Suspense fallback={<TicketListSkeleton />}>
                                <TicketListTab filter="all" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="created" className="mt-4">
                    <Card>
                        <CardHeader className="px-6">
                            <CardTitle>Tickets Created by Me</CardTitle>
                            <CardDescription>View tickets you have created.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[60vh] overflow-y-auto px-6 py-4">
                            <Suspense fallback={<TicketListSkeleton />}>
                                <TicketListTab filter="created" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assigned" className="mt-4">
                    <Card>
                        <CardHeader className="px-6">
                            <CardTitle>Tickets Assigned to Me</CardTitle>
                            <CardDescription>View tickets assigned to you for resolution.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[60vh] overflow-y-auto px-6 py-4">
                            <Suspense fallback={<TicketListSkeleton />}>
                                <TicketListTab filter="assigned" />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TicketListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    );
}