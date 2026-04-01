export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4 min-h-0 h-full overflow-auto">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 flex-1 rounded-xl" />
    </div>
  );
}
