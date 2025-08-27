import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${className}`}
      style={{
        width: width,
        height: height
      }}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <Skeleton className="w-full h-48 mb-4" rounded="lg" />
    <Skeleton className="w-3/4 h-4 mb-2" />
    <Skeleton className="w-1/2 h-3 mb-2" />
    <div className="flex items-center space-x-2 mb-2">
      <Skeleton className="w-16 h-3" />
      <Skeleton className="w-12 h-3" />
    </div>
    <Skeleton className="w-20 h-6 mb-3" />
    <div className="flex space-x-2">
      <Skeleton className="w-8 h-8" rounded="full" />
      <Skeleton className="w-8 h-8" rounded="full" />
      <Skeleton className="w-8 h-8" rounded="full" />
    </div>
  </div>
);

// Product List Skeleton
export const ProductListSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
    <Skeleton className="w-12 h-12" rounded="lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
    </div>
    <Skeleton className="w-20 h-6" />
    <Skeleton className="w-16 h-6" />
    <div className="flex space-x-2">
      <Skeleton className="w-8 h-8" rounded="full" />
      <Skeleton className="w-8 h-8" rounded="full" />
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="w-1/4 h-4" />
      <Skeleton className="w-full h-10" />
    </div>
    <div className="space-y-4">
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-full h-32" />
    </div>
    <div className="flex space-x-3">
      <Skeleton className="w-24 h-10" />
      <Skeleton className="w-24 h-10" />
    </div>
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="mb-6">
    <Skeleton className="w-1/3 h-8 mb-2" />
    <Skeleton className="w-1/2 h-4" />
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-6" />
      </div>
      <Skeleton className="w-12 h-12" rounded="full" />
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <Skeleton className="w-1/3 h-6 mb-4" />
    <Skeleton className="w-full h-64" />
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="w-20 h-8" />
    ))}
  </div>
);

// Sidebar Skeleton
export const SidebarSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="w-6 h-6" rounded="full" />
        <Skeleton className="w-24 h-4" />
      </div>
    ))}
  </div>
);

// Modal Skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-1/2 h-6" />
      <Skeleton className="w-6 h-6" rounded="full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-10" />
    </div>
    <div className="flex space-x-3 mt-6">
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-20 h-10" />
    </div>
  </div>
);

export default Skeleton;
