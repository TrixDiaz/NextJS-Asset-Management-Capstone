'use client';

import { LogsDataTable } from "@/components/logs/logs-data-table";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LogsPage() {
    const [ isLoading, setIsLoading ] = useState(false);

    const generateSampleLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/seed-logs?count=50");
            const data = await response.json();

            if (data.success) {
                toast.success(`Generated ${data.logs.length} sample logs`);
            } else {
                toast.error("Failed to generate sample logs");
            }
        } catch (error) {
            console.error("Error generating logs:", error);
            toast.error("An error occurred while generating logs");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-50px)] overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2 ">
                    <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={generateSampleLogs}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            <Database className="h-4 w-4" />
                            {isLoading ? "Generating..." : "Generate Sample Logs"}
                        </Button>
                    </div>
                </div>
                <div className="space-y-4 ">
                    <LogsDataTable />
                </div>
            </div>
        </div>
    );
} 