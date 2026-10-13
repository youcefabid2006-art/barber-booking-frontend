import React from "react";

export default function ShopAppuntamenti_ad({
  filterDate,
  setFilterDate,
  filteredBookings,
  isDeleting,
  handleDelete
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-end">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Seleziona Giorno</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 font-medium bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
          </div>
          <button onClick={() => setFilterDate("")} className="px-3 py-2 mt-5 text-sm font-bold transition-colors bg-white border rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-100">
            Tutti
          </button>
          <button className="px-5 py-2.5 mt-5 text-sm font-bold text-white transition-all shadow-md bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl hover:from-black hover:to-neutral-900 active:scale-95">
            + Nuova
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Data e Ora</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Cliente</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Telefono</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Barbiere</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <span className="block mb-2 text-3xl">📅</span>
                    <span className="font-medium text-neutral-500">Nessuna prenotazione per questa data.</span>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const dataObj = new Date(booking.start_datetime);
                  const dataFormattata = dataObj.toLocaleDateString("it-IT", { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Algiers' });
                  const oraFormattata = dataObj.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });

                  return (
                    <tr key={booking.id} className="transition-colors border-b border-neutral-100 hover:bg-neutral-50 group">
                      <td className="p-4 font-medium text-neutral-900 whitespace-nowrap">
                        {dataFormattata} <span className="ml-2 font-bold text-neutral-600">{oraFormattata}</span>
                      </td>
                      <td className="p-4 font-bold capitalize text-neutral-800 whitespace-nowrap">
                        {booking.customer_name} {booking.customer_surname}
                      </td>
                      <td className="p-4 font-mono font-medium text-neutral-500 whitespace-nowrap">
                        {booking.customer_phone}
                      </td>
                      <td className="p-4 font-bold text-neutral-900 whitespace-nowrap">
                        {booking.barber ? <span>{booking.barber.name}</span> : <span className="px-2 py-1 text-xs uppercase tracking-wider bg-neutral-100 text-neutral-600 rounded-md">Qualsiasi</span>}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(booking.id)}
                          disabled={isDeleting === booking.id}
                          className={`px-4 py-1.5 text-xs font-bold transition-all border-2 rounded-lg
                            ${isDeleting === booking.id
                              ? 'border-neutral-200 text-neutral-400 bg-neutral-100 cursor-not-allowed'
                              : 'border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-95'}`}
                        >
                          {isDeleting === booking.id ? 'Annullamento...' : 'Annulla'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}