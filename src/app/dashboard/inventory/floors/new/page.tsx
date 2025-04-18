import FloorForm from '@/components/forms/floor-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewFloorPage() {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6">
                <Link href="/dashboard/inventory">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold md:text-3xl">Add New Floor</h1>
                <p className="text-muted-foreground">Create a new floor in a building.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <FloorForm />
            </div>
        </div>
    );
} 