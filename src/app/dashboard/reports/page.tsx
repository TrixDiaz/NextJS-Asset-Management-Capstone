import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserReports from './user-reports';
import BuildingReports from './building-reports';
import AssetReports from './asset-reports';
import StorageReports from './storage-reports';

export default async function ReportsPage() {
  return (
    <div className='h-[calc(100vh-5rem)] overflow-auto'>
      <div className='p-6'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Reports Dashboard</h1>
          <p className='text-muted-foreground mt-2'>
            View and analyze data across users, buildings, assets, and storage
          </p>
        </div>

        <Tabs defaultValue='users' className='w-full'>
          <TabsList className='mb-4'>
            <TabsTrigger value='users'>Users</TabsTrigger>
            <TabsTrigger value='buildings'>Buildings & Rooms</TabsTrigger>
            <TabsTrigger value='assets'>Assets</TabsTrigger>
            <TabsTrigger value='storage'>Storage</TabsTrigger>
          </TabsList>

          <div className='pb-8'>
            <TabsContent value='users'>
              <UserReports />
            </TabsContent>

            <TabsContent value='buildings'>
              <BuildingReports />
            </TabsContent>

            <TabsContent value='assets'>
              <AssetReports />
            </TabsContent>

            <TabsContent value='storage'>
              <StorageReports />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
