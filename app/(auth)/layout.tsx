export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="flex justify-center pb-20 pt-10">
        {children}
    </div>
  );
}