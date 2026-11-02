interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {children}
    </main>
  );
}
