export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold">You are offline</h1>
            <p className="text-muted-foreground mt-2 text-sm">Please check your internet connection and try again.</p>
        </div>
    );
}
