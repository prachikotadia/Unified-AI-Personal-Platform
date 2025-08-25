import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  count?: number
}

const Skeleton = ({ className = "h-4", count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  )
}

export const CardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-4" count={3} />
  </div>
)

export const TableSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <Skeleton className="h-6 w-1/4" />
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 py-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
)

export const GridSkeleton = ({ cols = 3 }: { cols?: number }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
    {Array.from({ length: 6 }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
)

export default Skeleton
