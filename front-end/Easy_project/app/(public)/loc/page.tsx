//  "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Search, Plus, Edit, Trash2, Phone, Home } from "lucide-react";
// import { getProprietes, createPropriete, updatePropriete, deletePropriete, Propriete} from "../lib/api/facture";
//  export default function Proprietes() {
//        const [proprietes, setProprietes] = useState<Propriete[]>([]);

//        const [showForm, setShowForm] = useState(false);
//        const [editingId, setEditingId] = useState<string | null>(null);

//         const [unites, setUnites] = useState<string>("");
//         const [residence, setResidence] = useState<string>(""); 
//         const [appartementId, setAppartementId] = useState<string>("");

//         const [filterText, setFilterText] = useState<string>("");

//         const [loading, setLoading] = useState(false);
//         const [saving, setSaving] = useState(false);
//         const [error, setError] = useState<string | null>(null);

//         const filteredProprietes = useMemo(() => {
//            return proprietes.filter((propriete) => {
//               return (
//                 propriete.unites?.toLowerCase().includes(filterText.toLowerCase()) ||
//                 propriete.residence?.toLowerCase().includes(filterText.toLowerCase())
//               );
//             });
//         }, [proprietes, filterText]);

//         const loadAll = async () => {
//              setLoading(true);
//              setError(null);
//                try {
//         const proprietesRes = await getProprietes();
//             setProprietes(proprietesRes);
//              } catch (e) {
//             setError(e instanceof Error ? e.message : "Erreur inattendue");
//              } finally {
//             setLoading(false);
//              }
//         };

//         useEffect(() => {
//         loadAll();
//    }, []);
//    const clearForm = () => {
//      setEditingId(null);
//      setUnites("");
//      setResidence("");
//      setAppartementId("");
//    };

//    const openFormForCreate = () => {
//      clearForm();
//      setShowForm(true);
//    };

//    const openFormForEdit = (propriete: Propriete) => {
//      setEditingId(propriete.id);
//      setUnites(propriete.unites);
//      setResidence(propriete.residence);
//      setAppartementId(propriete.appartementId ?? "");
//      setShowForm(true);
//    };

//    const handleSave = async () => {
//      if (!unites || !residence) {
//        setError("Veuillez remplir tous les champs obligatoires.");
//        return;
//      }

//      const payload: Omit<Propriete, "id"> = {
//        unites,
//        residence,
//        appartementId,
//      };

// // // //     setSaving(true);
// // // //     setError(null);

// // // //     try {
// // // //       if (editingId) {
// // // //         await updatePropriete(editingId, payload);
// // // //       } else {
// // // //         await createPropriete(payload);
// // // //       }
// // // //       await loadAll();
// // // //       setShowForm(false);
// // // //     } catch (e) {
// // // //       setError(e instanceof Error ? e.message : "Erreur inattendue");
// // // //     } finally {
// // // //       setSaving(false);
// // // //     }
// // // //   };

// // // //   const handleDelete = async (id: string) => {
// // // //     setError(null);
// // // //     setLoading(true);
// // // //     try {
// // // //       await deletePropriete(id);
// // // //       await loadAll();
// // // //     } catch (e) {
// // // //       setError(e instanceof Error ? e.message : "Erreur inattendue");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const confirmDelete = async (propriete: Propriete) => {
// // // //     const confirmed = window.confirm(
// // // //       `Voulez-vous vraiment supprimer la propriete ${propriete.residence} ?`
// // // //     );
// // // //     if (!confirmed) return;
// // // //     await handleDelete(propriete.id);
// // // //   };

// // // //   return (
// // // //     <div className="p-8 bg-gray-50 min-h-screen">
// // // //       <div className="flex justify-between items-center mb-8">
// // // //         <div>
// // // //           <h1 className="text-2xl font-bold text-gray-900">Propriétés</h1>
// // // //           <p className="text-gray-500 mt-1">
// // // //             Gérez vos propriétés
// // // //           </p>
// // // //         </div>

// // // //         <button
// // // //           onClick={openFormForCreate}
// // // //           className="bg-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-800"
// // // //         >
// // // //           <Plus className="w-5 h-5" />
// // // //           Nouvelle propriété
// // // //         </button>
// // // //       </div>

// // // //       {error && (
// // // //         <div className="mb-4 text-red-600">{error}</div>
// // // //       )}

// // // //       {showForm && (
// // // //         <div className="bg-white p-4 mb-6">
// // // //           <input
// // // //             value={residence}
//              onChange={(e) => setResidence(e.target.value)}
//              placeholder="Nom"
//            />

//            <input
//              value={unites}
//              onChange={(e) => setUnites(e.target.value)}
//              placeholder="Unités"
//            />

//            <button onClick={handleSave}>
//              {saving ? "..." : "Enregistrer"}
//            </button>
//          </div>
//        )}

//        <input
//          type="text"
//          placeholder="Rechercher..."
//          value={filterText}
//          onChange={(e) => setFilterText(e.target.value)}
//        />

//        <div className="space-y-3 mt-4">
//          {filteredProprietes.map((propriete) => (
//            <div key={propriete.id} className="flex justify-between border p-3">
//              <div>
//                <Home /> {propriete.residence} - {propriete.unites}
//              </div>

//              <div className="flex gap-2">
//                <button onClick={() => openFormForEdit(propriete)}>
//                  <Edit />
//                </button>

//                <button onClick={() => confirmDelete(propriete)}>
//                  <Trash2 />
//                </button>
//               </div>
//             </div>
//             ))}
//           </div>
//         </div>
// );
//  }