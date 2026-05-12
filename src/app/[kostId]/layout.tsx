export default function KostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { kostId: string };
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {children}
    </div>
  );
}
