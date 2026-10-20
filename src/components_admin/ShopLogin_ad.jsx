import React, { useState } from "react";
import axios from "axios";

// Assicurati che l'API_BASE punti al tuo backend FastAPI
const API_BASE = import.meta.env.DEV
  ? "http://localhost:8000/api/v1"
  : "https://barber-booking-backend-sxus.onrender.com/api/v1";

// NOTA: la prima password del salone non si imposta più da questa pagina:
// la rotta setup-password ora richiede la chiave master (la imposti tu da Swagger in locale).
export default function ShopLogin_ad({ onLoginSuccess }) {
  // Lo slug del negozio (= username) ora lo digita l'utente: non è più fisso su barberia-picasso
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ROTTA DI LOGIN CLASSICO (Restituisce il JWT Token)
      const cleanSlug = slug.trim(); // toglie gli spazi accidentali (copia-incolla, autocompletamento del telefono)
      const params = new URLSearchParams();
      params.append('username', cleanSlug); // Lo slug fa da username
      params.append('password', password);

      const response = await axios.post(`${API_BASE}/admin/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
     
      // Salviamo il token nel localStorage del browser
      localStorage.setItem("admin_token", response.data.access_token);
      // Salviamo anche lo slug: la dashboard ne ha bisogno per sapere quale negozio caricare
      localStorage.setItem("admin_shop_slug", cleanSlug);
      onLoginSuccess(cleanSlug);
    } catch (err) {
      setError("Identifiants invalides. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-50 animate-fade-up">
      <div className="w-full max-w-md p-8 bg-white border shadow-xl border-slate-100 rounded-3xl">
       
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mb-4 text-white shadow-md rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">
            Espace réservé
          </h2>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            Saisissez le mot de passe pour accéder
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-1.5 text-xs font-bold tracking-wide uppercase text-neutral-800">
              Salon
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="ex. mon-salon"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-4 py-3 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

<div>
            <label className="block mb-1.5 text-xs font-bold tracking-wide uppercase text-neutral-800">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 mt-2 text-[15px] font-bold text-white transition-all shadow-md rounded-xl
              ${isLoading ? 'bg-neutral-400 cursor-not-allowed' : 'bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-[0.98]'}`}
          >
            {isLoading ? 'Veuillez patienter...' : 'Se connecter'}
          </button>
        </form>

      </div>
    </div>
  );
}