export default function LoadingStorageInventory() {
  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Storage Inventory</h1>
        <div className='h-10 w-32 animate-pulse rounded bg-gray-200'></div>
      </div>
      <div className='rounded-lg border p-12 text-center'>
        <div className='flex items-center justify-center space-x-2'>
          <div
            className='h-4 w-4 animate-bounce rounded-full bg-blue-600'
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className='h-4 w-4 animate-bounce rounded-full bg-blue-600'
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className='h-4 w-4 animate-bounce rounded-full bg-blue-600'
            style={{ animationDelay: '0.3s' }}
          ></div>
        </div>
        <p className='mt-4 text-gray-500'>Loading...</p>
      </div>
    </div>
  );
}
