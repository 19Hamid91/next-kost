export default function KostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { kostId: string };
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {children}
    </div>
  );
}
