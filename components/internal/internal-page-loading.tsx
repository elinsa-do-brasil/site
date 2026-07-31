import { Skeleton } from "@/components/ui/skeleton";

export function InternalPageLoading({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex min-h-[28rem] w-full max-w-6xl flex-col gap-6 px-4 pb-12"
      role="status"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-3 border-b py-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div
        aria-hidden="true"
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
