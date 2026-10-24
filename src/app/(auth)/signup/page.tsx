import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up — Pantry", description: "Create your Pantry account." };

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF2] grid place-items-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><span className="w-8 h-8 rounded-lg bg-[#1A3C34] text-white grid place-items-center">◒</span> pantry</Link>
        <div className="mt-8 rounded-[24px] bg-white border border-zinc-200 shadow-sm p-7 md:p-8">
          <h1 className="text-2xl">Create your account</h1>
          <p className="text-sm text-zinc-600 mt-1">Start tracking your fridge in seconds.</p>
          <div className="mt-6"><AuthForm mode="signup" /></div>
          <p className="mt-6 text-sm text-center text-zinc-600">Already have an account? <Link href="/login" className="font-semibold text-[#1A3C34] hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
