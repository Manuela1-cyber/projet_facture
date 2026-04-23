"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Phone, Mail, Home, Send } from "lucide-react";
import { Locataire, Appartement, Assigner, getLocataires, createLocataire, updateLocataire, deleteLocataire, getProprietes, getAppartements, getAssignations, createAssigner, Propriete, buildLocatairePortalPath } from "../../lib/api/facture";

export default function Locataires() {
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [proprietes, setProprietes] = useState<Propriete[]>([]);
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [assignations, setAssignations] = useState<Assigner[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [proprieteId, setProprieteId] = useState<string>("");
  const [appartementId, setAppartementId] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");

  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredLocataires = useMemo(() => {
    const propById = new Map(proprietes.map((p) => [p.id, p]));

    return locataires.filter((locataire) => {
      const propriete = propById.get(locataire.proprieteId ?? "");

      return (
        locataire.name.toLowerCase().includes(filterText.toLowerCase()) ||
        locataire.phone.toLowerCase().includes(filterText.toLowerCase()) ||
        (locataire.email && locataire.email.toLowerCase().includes(filterText.toLowerCase())) ||
        (propriete && propriete.residence.toLowerCase().includes(filterText.toLowerCase()))
      );
    }).map((locataire) => {
      const propriete = propById.get(locataire.proprieteId ?? "");
      return {
        ...locataire,
        residence: propriete?.residence,
      };
    });
  }, [locataires, proprietes, filterText]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [locatairesRes, proprietesRes, appartementsRes, assignationsRes] = await Promise.all([
        getLocataires(),
        getProprietes(),
        getAppartements(),
        getAssignations(),
      ]);

      setLocataires(locatairesRes);
      setProprietes(proprietesRes);
      setAppartements(appartementsRes);
      setAssignations(assignationsRes);

      if (!proprieteId && proprietesRes.length > 0) {
        setProprieteId(proprietesRes[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setEmail("");
    setProprieteId(proprietes[0]?.id ?? "");
    setAppartementId("");
  };

  const openFormForCreate = () => {
    clearForm();
    setShowForm(true);
  };

  const openFormForEdit = (locataire: Locataire) => {
    setEditingId(locataire.id);
    setName(locataire.name);
    setPhone(locataire.phone);
    setEmail(locataire.email ?? "");
    setProprieteId(locataire.proprieteId ?? "");
    // Trouver le premier appartement du locataire pour cette propriété
    const apartForLocataire = appartements.find((a) => a.locataireId === locataire.id);
    setAppartementId(apartForLocataire?.id ?? "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name || !phone || !proprieteId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload: Omit<Locataire, "id"> = {
      name,
      phone,
      email: email || undefined,
      proprieteId,
    };
    setSaving(true);
    setError(null);

    try {
      let locataireId = editingId;
      
      if (editingId) {
        await updateLocataire(editingId, payload);
      } else {
        const newLocataire = await createLocataire(payload);
        locataireId = newLocataire.id;
      }

      // Créer l'assignation si un appartement est sélectionné et c'est une création
      if (!editingId && appartementId && locataireId) {
        await createAssigner("", locataireId, appartementId);
      }

      await loadAll();
      setShowForm(false);
      clearForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setLoading(true);
    try {
      await deleteLocataire(id);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (locataire: Locataire) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le locataire ${locataire.name} ?`
    );
    if (!confirmed) return;
    await handleDelete(locataire.id);
  };

  const handleSendPortalLink = async (locataire: Locataire) => {
    const path = buildLocatairePortalPath(locataire.id);
    const link = `${window.location.origin}${path}`;
    const message = `Bonjour ${locataire.name}, voici votre espace locataire pour consulter l'historique de vos factures : ${link}`;

    // try {
    //   await navigator.clipboard.writeText(link);
    // } catch {
 
    // }

    if (locataire.email) {
      window.location.href = `mailto:${encodeURIComponent(locataire.email)}?subject=${encodeURIComponent(
        "Votre espace locataire"
      )}&body=${encodeURIComponent(message)}`;
      return;
    }

    if (locataire.phone) {
      window.location.href = `sms:${encodeURIComponent(locataire.phone)}?body=${encodeURIComponent(
        message
      )}`;
      return;
    }

    window.alert(`Lien copié : ${link}`);
  };
    
    const enforcePhoneFormat = (value: string): string => {
       if (value.length === 0) return "6";

       if (value.charAt(0) !== "6") {
        value = "6" + value.substring(1);
    }

       if (value.length >= 2) {
        const secondDigit = value.charAt(1);
       if (!/[785942]/.test(secondDigit)) {
        value = value.substring(0, 1);
      }
    }

    let cleaned = "6";
    for (let i = 1; i < value.length; i++) {
      const c = value.charAt(i);
      if (/[0-9]/.test(c)) {
        cleaned += c;
      }
    }

    if (cleaned.length > 9) {
      cleaned = cleaned.substring(0, 9);
    }

    return cleaned;
  };

    const validateEmail = (value: string): void => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!regex.test(value)) {
      setEmailError("Email : Format non respecté");
    } else {
      setEmailError("");
    }
     };

 
    const validateForm = (e: React.FormEvent): void => {
    e.preventDefault();

    const phoneRegex = /^6[7859]\d{7}$/;

    if (!phoneRegex.test(phone)) {
      setPhoneError("Tel: Format incorrect");
      return;
    }

    setPhoneError("");
    alert("Formulaire valide");
    };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locataires</h1>
          <p className="text-gray-500 mt-1">
            Gérez les locataires de vos propriétés
          </p>
        </div>

        <button onClick={openFormForCreate}
          className="bg-purple-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-800">
          <Plus className="w-5 h-5" />
          Nouveau locataire
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                {editingId ? "Modifier le locataire" : "Nouveau locataire"}
              </h2>
              <p className="text-sm text-gray-500">
                Complétez les informations puis cliquez sur Enregistrer.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Nom *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
                placeholder="Nom du locataire"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Téléphone *</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(enforcePhoneFormat(e.target.value))}
                className="border border-slate-200 rounded-xl px-4 py-2"
                placeholder="+237 6xx-xx-xx-xx"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => validateEmail(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
                placeholder="email@exemple.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Propriété *</span>
              <select
                value={proprieteId}
                onChange={(e) => setProprieteId(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
              >
                <option value="">Sélectionner</option>
                {proprietes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.residence}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Appartement</span>
              <select
                value={appartementId}
                onChange={(e) => setAppartementId(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2"
              >
                <option value="">Sélectionner</option>
                {appartements.filter((a) => a.proprieteId === proprieteId && !assignations.some(ass => ass.appartementId === a.id)).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-purple-900 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                clearForm();
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des locataires
            </h2>
            <p className="text-sm text-gray-500">
              Tous les locataires enregistrés
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher par nom, téléphone, email..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-200"/>
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-5 text-xs font-semibold text-gray-400 px-4 pb-2">
          <span>LOCATAIRE</span>
          <span>CONTACT</span>
          <span>PROPRIÉTÉ</span>
          {/* <span>STATUT</span> */}
          <span className="text-right">ACTIONS</span>
        </div>

        <div className="space-y-3">
          {filteredLocataires.map((locataire) => (
            <div
              key={locataire.id}
              className="grid grid-cols-5 items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-4 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50">
                  <Home className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {locataire.name}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-800">
                    {locataire.phone}
                  </p>
                </div>
                {locataire.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {locataire.email}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {locataire.residence ?? "—"}
                </p>
              </div>

              {/* <div>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                  Actif
                </span>
              </div> */}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleSendPortalLink(locataire)}
                  className="p-2 rounded-lg border border-emerald-200 hover:bg-emerald-50"
                  title="Envoyer le lien"
                >
                  <Send className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  onClick={() => openFormForEdit(locataire)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  onClick={() => confirmDelete(locataire)}
                  className="p-2 rounded-lg border border-red-200 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLocataires.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Aucun locataire trouvé
          </div>
        )}
      </section>
    </div>
  );
}
