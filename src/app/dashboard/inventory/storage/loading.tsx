export default function LoadingStorageInventory() {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Storage Inventory</h1>
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="text-center p-12 border rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <p className="text-gray-500 mt-4">Loading...</p>
            </div>
        </div>
    );
} 