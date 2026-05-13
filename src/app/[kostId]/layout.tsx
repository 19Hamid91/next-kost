import React from 'react';

export default async function KostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ kostId: string }>;
}) {
  const { kostId } = await params;
  
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {children}
    </div>
  );
}
