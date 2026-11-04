// ===== COSTANTI CONDIVISE =====
// Valori fissi usati in più file del gestionale: tenerli qui evita di copiarli (e di dimenticarne uno se cambiano).

// Giorni della settimana come li vede l'utente: indice 0 = Lundi ... 6 = Dimanche
// (stesso ordine con cui il database salva i turni: weekday 0 = lunedì).
export const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// Chiavi in inglese con cui il database salva il testo degli orari di apertura (opening_hours),
// nello stesso ordine di WEEKDAYS.
export const DB_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
