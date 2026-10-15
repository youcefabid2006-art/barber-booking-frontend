import React from "react";

export default function ShopAppuntamenti_ad({
  filterDate,
  setFilterDate,
  filteredBookings,
  isDeleting,
  handleDelete,
  services = []
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
        {/* VISTA TELEFONO (Senza scorrimento orizzontale e con distacco netto tra prenotazioni) */}
        <div className="p-3 space-y-3 bg-neutral-50/70 md:hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl">
              <span className="block mb-2 text-3xl">📅</span>
              <span className="font-medium text-neutral-500">Nessuna prenotazione per questa data.</span>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const dataObj = new Date(booking.start_datetime);
              const dataFormattata = dataObj.toLocaleDateString("it-IT", { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Algiers' });
              const oraFormattata = dataObj.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });
              const nomeServizio = booking.service?.name || services.find((s) => s.id === booking.service_id)?.name || "-";

              return (
                <div key={booking.id} className="relative flex flex-col gap-3 p-4 overflow-hidden transition-colors bg-white border shadow-sm border-neutral-200 rounded-xl">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-neutral-900"></div>

                  <div className="flex items-center justify-between pb-2.5 ml-1 border-b border-neutral-100">
                    <div className="font-medium capitalize text-neutral-900">
                      {dataFormattata} <span className="ml-1.5 font-extrabold text-neutral-900">{oraFormattata}</span>
                    </div>
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
                  </div>

                  <div className="flex items-start justify-between ml-1 text-sm">
                    <div>
                      <p className="font-bold capitalize text-neutral-800">
                        {booking.customer_name} {booking.customer_surname}
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-neutral-500">
                        {booking.customer_phone}
                      </p>
                      <p className="mt-2 text-xs font-bold text-neutral-700">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 mr-1.5">Servizio:</span>
                        {nomeServizio}
                      </p>
                    </div>
                    <div className="font-bold text-right text-neutral-900">
                      <span className="block text-[10px] font-bold tracking-wider uppercase text-neutral-400">Barbiere</span>
                      {booking.barber ? <span>{booking.barber.name}</span> : <span className="px-2 py-0.5 text-xs uppercase tracking-wider bg-neutral-100 text-neutral-600 rounded-md">Qualsiasi</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* VISTA PC / DESKTOP (Tabella originale intatta con colonna Servizio e bordo di separazione netto) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Data e Ora</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Cliente</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Telefono</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Servizio</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap">Barbiere</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-neutral-800 whitespace-nowrap text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <span className="block mb-2 text-3xl">📅</span>
                    <span className="font-medium text-neutral-500">Nessuna prenotazione per questa data.</span>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const dataObj = new Date(booking.start_datetime);
                  const dataFormattata = dataObj.toLocaleDateString("it-IT", { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Algiers' });
                  const oraFormattata = dataObj.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });
                  const nomeServizio = booking.service?.name || services.find((s) => s.id === booking.service_id)?.name || "-";

                  return (
                    <tr key={booking.id} className="transition-colors border-b-2 border-neutral-200/80 hover:bg-neutral-50 group">
                      <td className="p-4 font-medium text-neutral-900 whitespace-nowrap">
                        {dataFormattata} <span className="ml-2 font-bold text-neutral-600">{oraFormattata}</span>
                      </td>
                      <td className="p-4 font-bold capitalize text-neutral-800 whitespace-nowrap">
                        {booking.customer_name} {booking.customer_surname}
                      </td>
                      <td className="p-4 font-mono font-medium text-neutral-500 whitespace-nowrap">
                        {booking.customer_phone}
                      </td>
                      <td className="p-4 font-bold text-neutral-800 whitespace-nowrap">
                        {nomeServizio}
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