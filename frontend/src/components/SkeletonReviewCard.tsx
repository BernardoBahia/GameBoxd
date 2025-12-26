import Skeleton from "./Skeleton";

export default function SkeletonReviewCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar skeleton */}
          <Skeleton className="w-10 h-10 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* User name skeleton */}
            <Skeleton className="h-5 w-32" />

            {/* Date skeleton */}
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Rating skeleton */}
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Comment skeleton - multiple lines */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
