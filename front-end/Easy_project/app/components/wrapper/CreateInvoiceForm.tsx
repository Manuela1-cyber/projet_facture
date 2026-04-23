'use client'

import { User, Home, Calendar, RefreshCcw, Save } from 'lucide-react';

export default function CreateInvoiceForm() {
    return (

        <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Nouvelle Facture</h2>
                <p className="text-sm text-gray-500">Créer une facture pour un résident</p>
            </div>
            <form className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                 
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            Client
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                            <option value="">Sélectionner un résident...</option>
                         
                        </select>
                    </div>
                   
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            Logement
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Apt A1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            readOnly
                        />
                    </div>
                </div>
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Date d&apos;émission
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Date d&apos;échéance
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="border-t border-gray-100 my-4"></div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                        <label className="text-sm font-medium text-gray-700">Type de facturation</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="radio" name="billingType" className="text-blue-600" defaultChecked />
                                Forfait Fixe
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="radio" name="billingType" className="text-blue-600" />
                                Consommation (m³)
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Montant Total (FCFA)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">FCFA</span>
                            </div>
                        </div>
                   
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4 text-gray-400" />
                                Consommation (optionnel)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">m³</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Enregistrer la facture
                    </button>
                </div>
            </form>
        </div>

    );
}