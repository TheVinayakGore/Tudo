export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex flex-col w-full">
      <section className="p-5 lg:p-20 pt-20 lg:pt-20">{children}</section>
    </main>
  );
}
