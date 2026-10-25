import React, { useState } from "react";

// Schermata d'ingresso: username + password (la password è la MASTER_KEY).
// onSubmit(username, password) ritorna il messaggio d'errore, oppure null se l'accesso è riuscito.
export default function MasterLogin({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || isChecking) return;
    setIsChecking(true);
    setError("");
    const message = await onSubmit(username.trim(), password);
    // Se l'accesso riesce questo componente sparisce: lo stato si aggiorna solo in caso di errore
    if (message) {
      setError(message);
      setIsChecking(false);
    }
  };

  const inputClass = "w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary";
  const labelClass = "block mb-1 text-xs font-bold tracking-wide uppercase text-fg";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-page font-sans">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-fg font-heading">Master</h1>
        <p className="mb-6 text-sm font-medium text-fg-muted">Accedi per gestire i negozi.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-bold text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isChecking}
          className="w-full py-3 mt-5 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-95 disabled:opacity-50"
        >
          {isChecking ? "Verifica in corso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}