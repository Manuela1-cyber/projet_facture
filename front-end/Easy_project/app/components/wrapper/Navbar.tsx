"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplet, Bell, User, LayoutDashboard, Building, Users, FileText } from "lucide-react";

const Navbar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`)
            ? "text-purple-600 border-b-2 border-purple-600"
            : "text-gray-500 hover:text-purple-600";
    };

    const isHomePage = pathname === "/";

    return (
        <div className="bg-white border-b border-gray-200">

            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <div>
                            <h1 className="text-xl font-bold text-purple-900">Easy</h1>
                            <p className="text-xs text-purple-500">Gestion de paiement d'eau</p>
                        </div>
                    </Link>
                </div>

                
            </div>

            {!isHomePage && (
                <nav className="flex items-center px-6 gap-8 mt-2">
                    <Link
                        href="/dashboard"
                        className={`pb-3 text-sm font-medium flex items-center gap-2 ${isActive("/dashboard")}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Tableau de bord
                    </Link>
                    <Link
                        href="/proprietes"
                        className={`pb-3 text-sm font-medium flex items-center gap-2 ${isActive("/proprietes")}`}
                    >
                        <Building className="w-4 h-4" />
                        Propriétés
                    </Link>
                    <Link
                        href="/locataires"
                        className={`pb-3 text-sm font-medium flex items-center gap-2 ${isActive("/locataires")}`}
                    >
                        <Users className="w-4 h-4" />
                        Locataires
                    </Link>
                    <Link
                        href="/factures"
                        className={`pb-3 text-sm font-medium flex items-center gap-2 ${isActive("/factures")}`}
                    >
                        <FileText className="w-4 h-4" />
                        Factures
                    </Link>
                    <Link
                        href="/espace-locataire"
                        className={`pb-3 text-sm font-medium flex items-center gap-2 ${isActive("/espace-locataire")}`}
                    >
                        <User className="w-4 h-4" />
                        Espace locataire
                    </Link>
                </nav>
            )}
        </div>
    );
};

export default Navbar;
