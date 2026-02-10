import { useQuery } from "@tanstack/react-query";
import { VerseCard } from "@/components/verse-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Verse } from "@shared/schema";
import { format } from "date-fns";

function TodaySkeleton() {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <Skeleton className="mb-6 h-3 w-32" />
      <div className="mx-auto mb-8 h-px w-16 bg-primary/10" />
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-2">
        <Skeleton className="h-6 w-full max-w-xs" />
        <Skeleton className="h-6 w-full max-w-[280px]" />
        <Skeleton className="h-6 w-full max-w-[240px]" />
        <Skeleton className="h-6 w-full max-w-[200px]" />
      </div>
      <Skeleton className="mt-5 h-4 w-40" />
      <div className="mx-auto my-8 flex w-full max-w-xs items-center gap-3">
        <div className="h-px flex-1 bg-primary/10" />
        <Skeleton className="h-3 w-16" />
        <div className="h-px flex-1 bg-primary/10" />
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full max-w-[300px]" />
        <Skeleton className="h-4 w-full max-w-[260px]" />
      </div>
      <div className="mt-8 flex gap-3">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: verse, isLoading, error } = useQuery<Verse>({
    queryKey: ["/api/verses/today"],
  });

  const todayFormatted = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center pb-8">
      {isLoading && <TodaySkeleton />}

      {error && (
        <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="font-serif text-2xl text-primary">F</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Unable to load today's verse. Please try again later.
          </p>
        </div>
      )}

      {verse && (
        <VerseCard verse={verse} displayDate={todayFormatted} showFullCard />
      )}
    </div>
  );
}
