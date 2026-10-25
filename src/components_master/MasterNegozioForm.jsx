import React, { useState } from "react";
import MasterImmagini from "./MasterImmagini.jsx";

const WEEKDAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
// Stesse chiavi di ShopNegozio_ad: gli orari sono salvati con i nomi inglesi dei giorni
const DB_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const LABEL = "block mb-1 text-xs font-bold tracking-wide uppercase text-fg";
const INPUT = "w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary";

// "Salon Élégance" -> "salon-elegance"
const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Field({ label, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

// Scheda del negozio: serve sia per CREARE (shop = null) sia per MODIFICARE (shop = negozio dell'elenco).
// Il componente che la usa le dà key={id del negozio}: cambiando negozio la scheda riparte dai dati giusti.
// onSave(payload) salva (il backend decide se creare o modificare).
export default function MasterNegozioForm({ shop, onSave, onClose, onUpload }) {
  const isNew = !shop;

  const [form, setForm] = useState(() => ({
    name: shop?.name || "",
    slug: shop?.slug || "",
    business_type: shop?.business_type || "barber",
    description: shop?.description || "",
    address: shop?.address || "",
    phone: shop?.phone || "",
    instagram_url: shop?.instagram_url || "",
    facebook_url: shop?.facebook_url || "",
    whatsapp_number: shop?.whatsapp_number || "",
    opening_hours: { ...(shop?.opening_hours || {}) },
    images: [...(shop?.images || [])],
    password: ""
  }));
  // In creazione lo slug segue il nome finché non lo si modifica a mano
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleName = (e) => {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, name, ...(slugTouched ? {} : { slug: slugify(name) }) }));
  };

  const handleSlug = (e) => {
    setSlugTouched(true);
    const slug = e.target.value.toLowerCase().replace(/\s+/g, "-");
    setForm((prev) => ({ ...prev, slug }));
  };

  const setHours = (day, value) =>
    setForm((prev) => ({ ...prev, opening_hours: { ...prev.opening_hours, [day]: value } }));

  const updateImages = (updater) => setForm((prev) => ({ ...prev, images: updater(prev.images) }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Orari: i giorni lasciati vuoti non vengono salvati
    const hours = {};
    Object.entries(form.opening_hours).forEach(([day, value]) => {
      if (typeof value !== "string") hours[day] = value;
      else if (value.trim()) hours[day] = value.trim();
    });

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      business_type: form.business_type,
      description: form.description,
      address: form.address,
      phone: form.phone,
      instagram_url: form.instagram_url,
      facebook_url: form.facebook_url,
      whatsapp_number: form.whatsapp_number,
      opening_hours: hours,
      images: form.images
    };
    if (isNew && form.password) payload.password = form.password;

    setIsSaving(true);
    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const slugChanged = !isNew && form.slug.trim() !== shop.slug;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
      <div className="flex items-center gap-2 mb-6">
        {/* Solo da telefono: torna all'elenco */}
        <button type="button" onClick={onClose} aria-label="Torna all'elenco" className="p-2 -ml-2 transition rounded-full md:hidden text-fg-2 hover:bg-tint-2">
          <svg className="w-6 h-6 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-extrabold text-fg font-heading">{isNew ? "Nuovo negozio" : shop.name}</h2>
        {!isNew && <span className="text-sm font-bold text-fg-muted">#{shop.id}</span>}
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Nome del negozio">
          <input type="text" required value={form.name} onChange={handleName} placeholder="Es. Salon Élégance" className={INPUT} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Slug (link e username)">
            <input type="text" required value={form.slug} onChange={handleSlug} placeholder="mio-salone" className={INPUT} />
          </Field>
          <Field label="Tipo di attività">
            <select value={form.business_type} onChange={set("business_type")} className={`${INPUT} bg-white`}>
              <option value="barber">Barbiere</option>
              <option value="beauty">Salone di bellezza</option>
            </select>
          </Field>
        </div>
        {slugChanged ? (
          <p className="-mt-2 text-xs font-bold text-amber-600">
            Cambiando lo slug cambiano il link della vetrina (/shop/{form.slug.trim() || "..."}) e lo username con cui il negozio fa il login.
          </p>
        ) : (
          <p className="-mt-2 text-xs font-medium text-fg-muted">Solo lettere minuscole, numeri e trattini. È il link della vetrina e lo username di login.</p>
        )}

        <Field label="Indirizzo">
          <input type="text" value={form.address} onChange={set("address")} className={INPUT} />
        </Field>
        <Field label="Telefono">
          <input type="text" value={form.phone} onChange={set("phone")} className={INPUT} />
        </Field>
        <Field label="Descrizione pubblica">
          <textarea rows="4" value={form.description} onChange={set("description")} className={`${INPUT} resize-none`}></textarea>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="URL Instagram">
            <input type="text" value={form.instagram_url} onChange={set("instagram_url")} placeholder="https://instagram.com/..." className={INPUT} />
          </Field>
          <Field label="URL Facebook">
            <input type="text" value={form.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/..." className={INPUT} />
          </Field>
        </div>
        <Field label="Numero WhatsApp">
          <input type="text" value={form.whatsapp_number} onChange={set("whatsapp_number")} placeholder="Es. 213550123456" className={INPUT} />
        </Field>

        <div>
          <h3 className="mb-3 text-sm font-bold text-fg">Orari di apertura (es. 08:30 - 19:00 oppure Closed)</h3>
          {WEEKDAYS.map((dayName, idx) => {
            const dbDay = DB_DAYS[idx];
            return (
              <div key={dbDay} className="flex items-center justify-between mb-2">
                <span className="w-28 text-sm font-medium text-fg">{dayName}</span>
                <input
                  type="text"
                  value={form.opening_hours[dbDay] || ""}
                  onChange={(e) => setHours(dbDay, e.target.value)}
                  placeholder="Closed"
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-fg placeholder-fg-faint border rounded-lg border-line-strong focus:outline-none focus:border-primary"
                />
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-fg">Immagini</h3>
          <p className="mb-3 text-xs font-medium text-fg-muted">La prima è la copertina in cima alla pagina del negozio. Le modifiche si applicano con il pulsante in fondo.</p>
          <MasterImmagini images={form.images} onUpdate={updateImages} onUpload={onUpload} />
        </div>

        {isNew && (
          <Field label="Password admin (opzionale)">
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={set("password")}
              placeholder="Almeno 8 caratteri"
              className={INPUT}
            />
            <p className="mt-1 text-xs font-medium text-fg-muted">Senza password il negozio non può fare il login: potrai impostarla dopo.</p>
          </Field>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 mt-2 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Salvataggio..." : isNew ? "Crea negozio" : "Salva modifiche"}
        </button>
      </div>
    </form>
  );
}