'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

export default function SeedDatabasePage() {
    const [ loading, setLoading ] = useState(false);
    const [ result, setResult ] = useState<any>(null);

    const handleSeed = async () => {
        try {
            setLoading(true);
            const origin = window.location.origin;

            // Call the seed API
            const response = await fetch(`${origin}/api/seed`);
            const data = await response.json();

            if (data.success) {
                toast.success('Sample data created successfully');
                setResult(data);
            } else {
                toast.error('Failed to create sample data');
                setResult(data);
            }
        } catch (error) {
            console.error('Error seeding database:', error);
            toast.error('An error occurred while creating sample data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href="/dashboard/inventory/storage">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seed Database</CardTitle>
                    <CardDescription>
                        Create sample data for buildings, floors, and rooms to use in the application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-center">
                            This will create a sample building, floor, and room if none exist.
                            This is useful for testing the application and deploying inventory items.
                        </p>

                        <Button
                            onClick={handleSeed}
                            disabled={loading}
                            className="mt-4"
                        >
                            {loading ? 'Creating Sample Data...' : 'Create Sample Data'}
                        </Button>

                        {result && (
                            <div className="mt-6 w-full">
                                <h3 className="font-medium mb-2">Result:</h3>
                                <div className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                                    <pre className="text-sm whitespace-pre-wrap">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 