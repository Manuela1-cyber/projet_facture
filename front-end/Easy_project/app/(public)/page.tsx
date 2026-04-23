 
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      <section className="bg-gradient-to-br from-fuchsia-50 via-rose-50 to-rose-50 py-20 px-4 md:px-0 min-h-screen flex items-center">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold font-[Geist] text-gray-900 leading-tight">
              La gestion de vos paiements <span className="text-[#9b5cff]">simplifiée</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto md:mx-0">
              Easy vous permet de gérer vos factures, suivre vos locataires et sécuriser vos transactions en toute simplicité.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link
                href="/inscription"
                className="w-full sm:w-auto px-8 py-3 bg-[#9b5cff] text-white font-semibold rounded-full hover:bg-[#8646ff] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#9b5cff]/30"
              >
                S'inscrire
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/connexion"
                className="w-full sm:w-auto px-8 py-3 bg-white text-[#9b5cff] border border-[#9b5cff] font-semibold rounded-full hover:bg-[#f4ecff] transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>

          
          <div className="flex-1 relative mt-10 md:mt-0">
            <div className="absolute -top-8 -right-10 h-40 w-40 rounded-full bg-[#9b5cff]/10 blur-3xl" />
            <div className="relative w-full max-w-md mx-auto h-[360px] rounded-2xl border border-slate-200 bg-white/90 shadow-2xl shadow-[#9b5cff]/10 backdrop-blur overflow-hidden">
              <Image 
                src="/images.jpeg" 
                alt="" 
                width={500} 
                height={360} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Easy ?</h2>
            <p className="text-gray-600">Tout ce dont vous avez besoin pour une gestion claire et sans stress.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-[#9b5cff]" />,
                title: "Rapide et Efficace",
                desc: "Générez vos factures en quelques clics et envoyez-les instantanément."
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-[#9b5cff]" />,
                title: "Suivi en temps réel",
                desc: "Gardez un œil sur l&apos;état de vos paiements et vos locataires à tout moment."
              },
              {
                icon: <Shield className="w-8 h-8 text-[#9b5cff]" />,
                title: "Paiement sécurisé",
                desc: "Payez en toute sérénité, vos transactions sont 100 % protégées"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-xl hover:shadow-md transition border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

}
