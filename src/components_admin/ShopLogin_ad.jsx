import React, { useState } from "react";
import axios from "axios";

// Assicurati che l'API_BASE punti al tuo backend FastAPI
const API_BASE = "http://192.168.1.16:8000/api/v1";

export default function ShopLogin_ad({ shopSlug, onLoginSuccess }) {
  const [password, setPassword] = useState("");
  const [isSetupMode, setIsSetupMode] = useState(false); // Se vero, crea la prima password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSetupMode) {
        // ROTTA DI SETUP (Creazione prima password)
        // Usiamo un ID fittizio 1 per ora, nel sistema reale lo ricaveremo dal backend
        await axios.post(`${API_BASE}/admin/shops/1/setup-password`, { password });
        alert("Password creata con successo! Ora fai il login.");
        setIsSetupMode(false);
        setPassword("");
      } else {
        // ROTTA DI LOGIN CLASSICO (Restituisce il JWT Token)
        const params = new URLSearchParams();
        params.append('username', shopSlug || 'barberia-picasso'); // Lo slug fa da username
        params.append('password', password);

        const response = await axios.post(`${API_BASE}/admin/login`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        // Salviamo il token nel localStorage del browser
        localStorage.setItem("admin_token", response.data.access_token);
        onLoginSuccess();
      }
    } catch (err) {
      if (err.response?.status === 400 && isSetupMode) {
        setError("Il negozio ha già una password impostata.");
      } else {
        setError("Credenziali non valide. Riprova.");
      }
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
            Area Riservata
          </h2>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            {isSetupMode ? "Imposta la master password del salone" : "Inserisci la password per accedere"}
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
              Negozio
            </label>
            <input 
              type="text" 
              value={shopSlug || 'barberia-picasso'} 
              disabled 
              className="w-full px-4 py-3 font-bold text-neutral-500 bg-neutral-100 border rounded-xl border-neutral-200 cursor-not-allowed" 
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold tracking-wide uppercase text-neutral-800">
              Password
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
            {isLoading ? 'Attendere...' : (isSetupMode ? 'Imposta Password' : 'Accedi')}
          </button>
        </form>

        {/* Bottone nascosto per i developer/admin per passare alla modalità Setup */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSetupMode(!isSetupMode)}
            className="text-xs font-bold transition-colors text-neutral-400 hover:text-neutral-900"
          >
            {isSetupMode ? "Torna al Login" : "Prima volta? Imposta password"}
          </button>
        </div>

      </div>
    </div>
  );
}