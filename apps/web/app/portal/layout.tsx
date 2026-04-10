export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-background">
        <div className="mx-auto flex h-full max-w-[960px] items-center justify-center px-6">
          <span className="text-base font-semibold">Paylix</span>
        </div>
      </header>
      <main className="mx-auto max-w-[960px] px-4 py-12 sm:px-6">
        {children}
      </main>
      <footer className="pb-12 text-center">
        <span className="text-xs tracking-[0.2px] text-muted-foreground">
          Powered by Paylix
        </span>
      </footer>
    </div>
  );
}
