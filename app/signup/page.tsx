"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (data.user?.id) {
      const defaultName = `${email.split("@")[0]}'s restaurant`;
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .insert({
          name: defaultName,
          owner_user_id: data.user.id,
        })
        .select("id")
        .single();

      if (restaurantError || !restaurantData) {
        setError(
          restaurantError?.message ??
            "Unable to create the default restaurant."
        );
        setLoading(false);
        return;
      }

      const { error: memberError } = await supabase
        .from("restaurant_members")
        .insert({
          restaurant_id: restaurantData.id,
          user_id: data.user.id,
          role: "manager",
        });
      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }
    }
    router.push("/app");
  };

  return (
    <main className="bg-gray-50 text-gray-900">
      <section className="min-h-screen px-6 py-16">
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-sm flex-col items-center justify-center">
          <div className="w-full">
            <Link
              href="/"
              className="mb-3 inline-flex text-sm text-gray-500 transition hover:text-gray-700"
            >
              ← Back to home
            </Link>
          </div>
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">
              Create your account
            </h1>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition hover:bg-blue-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account?
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
