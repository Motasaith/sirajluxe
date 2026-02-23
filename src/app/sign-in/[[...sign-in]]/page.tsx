import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "glass-card !rounded-2xl !border-[var(--glass-border)]",
          },
        }}
      />
    </div>
  );
}
