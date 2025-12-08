import React from 'react';

// Generic skeleton loader
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton animate-pulse ${className}`}></div>
);

// Post card skeleton
export const PostCardSkeleton = () => (
    <div className="glass-card rounded-3xl p-4 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg" />
        </div>

        {/* Image */}
        <Skeleton className="w-full h-64 rounded-2xl mb-4" />

        {/* Actions */}
        <div className="flex items-center gap-4 mb-3">
            <Skeleton className="w-16 h-6 rounded-lg" />
            <Skeleton className="w-16 h-6 rounded-lg" />
        </div>

        {/* Caption */}
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
    </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
    <div className="glass rounded-3xl p-8">
        <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-2xl mb-4" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="flex gap-8 mt-4">
                <div className="text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    </div>
);

// User list item skeleton
export const UserItemSkeleton = () => (
    <div className="flex items-center gap-3 p-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg" />
    </div>
);

// Notification skeleton
export const NotificationSkeleton = () => (
    <div className="flex items-start gap-3 p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);

export default Skeleton;
