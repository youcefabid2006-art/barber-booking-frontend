import React, { useState } from "react";

// Immagine di un prodotto con segnaposto: il segnaposto sta SEMPRE sotto l'immagine, quindi si vede se il
// prodotto non ha l'immagine, se il link non funziona (onError) e anche mentre l'immagine sta ancora caricando.
// La forma (aspect-square, rounded-..., altezza) la decide chi lo usa tramite className.
// fit="cover" (default): l'immagine riempie tutto il riquadro, ritagliandosi ai bordi (catalogo, preferiti, gestionale).
// fit="contain": l'immagine si vede INTERA, rimpicciolita per stare nel riquadro, senza ritagli (dettaglio prodotto).
export default function ShopProdottoImmagine({ src, alt, className = "", fit = "cover" }) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src && String(src).trim() !== "") && !failed;
  const isContain = fit === "contain";

  return (
    <div className={`relative overflow-hidden ${isContain ? "bg-tint" : "bg-tint-2"} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center text-fg-ghost">
        <svg className="w-1/4 h-1/4 min-w-6 min-h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>

      {hasImage && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full ${isContain ? "object-contain p-3" : "object-cover"}`}
        />
      )}
    </div>
  );
}