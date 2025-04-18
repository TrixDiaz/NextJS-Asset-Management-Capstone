import UserForm from '@/components/forms/user-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewUserPage() {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6">
                <Link href="/dashboard/users">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold md:text-3xl">Create New User</h1>
                <p className="text-muted-foreground">Add a new user to the system with basic information.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <UserForm />
            </div>
        </div>
    );
} 