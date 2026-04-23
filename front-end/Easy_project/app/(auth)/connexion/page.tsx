"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { getAuthToken, login, saveAuthToken } from "@/lib/api/auth";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setIsCheckingSession(false);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });
      
      // Sauvegarder le token
      saveAuthToken(response.accessToken);
      
      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Impossible de se connecter pour le moment.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return null;
  }

  return (
     <div className="relative h-screen overflow-hidden bg-[#f5efe8]">
      <Image
        src="/images.jpeg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(22,14,34,0.9),rgba(130,84,165,0.62),rgba(244,143,64,0.32))]" />
      <div className="absolute 'left-[-6rem]' top-[-5rem] h-56 w-56 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="absolute bottom-[-7rem] right-[-4rem] h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid h-full w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/25 bg-white/12 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden h-full overflow-hidden lg:block">
            <Image
              src="/images.jpeg"
              alt="Illustration de connexion"
              fill
              priority
              className="object-cover"
            />
          </section>

          <section className="overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,252,0.9))] p-5 sm:p-7 lg:p-8">
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 overflow-hidden rounded-[20px] border border-[#8352A5]/15 shadow-sm lg:hidden">
                  <Image
                    src="/logo.jpeg"
                    alt="Logo"
                    width={300}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden lg:block" />
                <div className="inline-flex items-center gap-2 rounded-full bg-[#8352A5]/8 px-3 py-1 text-xs font-semibold text-[#6c4390]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Espace securise
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#8352A5]/70">
                  Connexion
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  Heureux de vous revoir
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Saisissez vos identifiants pour accéder à votre tableau de bord.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Adresse email
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#8352A5]/15 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#8352A5]/50 focus-within:ring-4 focus-within:ring-[#8352A5]/10">
                    <Mail className="h-5 w-5 shrink-0 text-[#8352A5]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@gmail.com"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">Mot de passe</span>
                    <Link
                      href="/forgot"
                      className="text-xs font-semibold text-[#8352A5] transition hover:text-[#6b3f8f]"
                    >
                      Mot de passe oublie ?
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#8352A5]/15 bg-white px-4 py-3 shadow-sm transition focus-within:border-[#8352A5]/50 focus-within:ring-4 focus-within:ring-[#8352A5]/10">
                    <Lock className="h-5 w-5 shrink-0 text-[#8352A5]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-[#8352A5]/70 transition hover:text-[#8352A5]"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#8352A5]"
                    />
                    <span>Se souvenir de moi</span>
                  </label>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Accès rapide
                  </span>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8352A5] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(131,82,165,0.28)] transition hover:bg-[#734694] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isSubmitting ? "Connexion..." : "Se connecter"}</span>
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Vous n&apos;avez pas encore de compte ?{" "}
                <Link
                  href="/inscription"
                  className="font-semibold text-[#8352A5] transition hover:text-[#6b3f8f]"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
