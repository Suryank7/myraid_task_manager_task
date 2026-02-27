import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function TaskSkeleton() {
  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/10">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-2/3 bg-white/10" />
          <Skeleton className="h-4 w-16 bg-white/10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-4/5 bg-white/10" />
        <div className="flex items-center gap-4 mt-2">
          <Skeleton className="h-4 w-12 bg-white/10" />
          <Skeleton className="h-4 w-12 bg-white/10" />
          <Skeleton className="h-4 w-24 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  )
}

export function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col gap-4">
          <div className="border-b-2 border-white/10 pb-2 flex justify-between">
            <Skeleton className="h-5 w-24 bg-white/10" />
            <Skeleton className="h-5 w-8 rounded-full bg-white/10" />
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((item) => (
               <TaskSkeleton key={`sk-${col}-${item}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
