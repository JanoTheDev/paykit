export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070a]">
      <div className="w-full max-w-[400px] px-4">
        {children}
      </div>
    </div>
  );
}
