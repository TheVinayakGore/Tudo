import Footer from "@/components/footer";
import Header from "@/components/header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="p-5 lg:p-20 pt-20 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}