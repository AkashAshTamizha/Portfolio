export default function SectionLoader() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <span className="h-7 w-7 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
    </div>
  );
}
