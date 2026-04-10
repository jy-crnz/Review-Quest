import { Skeleton } from "@/components/ui/Skeleton";

export const BattleSkeleton = () => {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* HUD Skeletons */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-12 ml-auto" />
                    <Skeleton className="h-3 w-full" />
                </div>
            </div>

            {/* Card Skeleton */}
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-6">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
};