export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
        <div className="absolute left-0 top-0 h-12 w-12 rounded-full border-4 border-turquoise border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
