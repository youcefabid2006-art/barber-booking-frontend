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
            <label className="mb-1 text-xs font-bold tracking-wide uppercase text-fg">Sélectionner un jour</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              onClick={(e) => {try { e.currentTarget.showPicker(); } catch (err) {} }}
              className="px-4 py-2 font-medium bg-white border border-line-strong rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={() => setFilterDate("")} className="px-3 py-2 mt-5 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2">
            Tous
          </button>
          <button className="px-5 py-2.5 mt-5 text-sm font-bold text-white transition-all shadow-md bg-gradient-to-r from-grad-start to-grad-end rounded-xl hover:from-primary-hover hover:to-primary active:scale-95">
            + Nouvelle
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-line-strong">
        {/* VISTA TELEFONO (Senza scorrimento orizzontale e con distacco netto tra prenotazioni) */}
        <div className="p-3 space-y-3 bg-tint/70 md:hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl">
              <span className="block mb-2 text-3xl">📅</span>
              <span className="font-medium text-fg-muted">Aucune réservation pour cette date.</span>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const dataObj = new Date(booking.start_datetime);
              const dataFormattata = dataObj.toLocaleDateString("fr-FR", { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Algiers' });
              const oraFormattata = dataObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });
              const nomeServizio = booking.service?.name || services.find((s) => s.id === booking.service_id)?.name || "-";

              return (
                <div key={booking.id} className="relative flex flex-col gap-3 p-4 overflow-hidden transition-colors bg-white border shadow-sm border-line-strong rounded-xl">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary"></div>

                  <div className="flex items-center justify-between pb-2.5 ml-1 border-b border-line">
                    <div className="font-medium capitalize text-fg">
                      {dataFormattata} <span className="ml-1.5 font-extrabold text-fg">{oraFormattata}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      disabled={isDeleting === booking.id}
                      className={`px-4 py-1.5 text-xs font-bold transition-all border-2 rounded-lg
                        ${isDeleting === booking.id
                          ? 'border-line-strong text-fg-faint bg-tint-2 cursor-not-allowed'
                          : 'border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-95'}`}
                    >
                      {isDeleting === booking.id ? 'Annulation...' : 'Annuler'}
                    </button>
                  </div>

<div className="flex items-start justify-between ml-1 text-sm">
                    <div>
                      <p className="font-bold capitalize text-fg">
                        {booking.customer_name} {booking.customer_surname}
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-fg-muted">
                        {booking.customer_phone}
                      </p>
                      <p className="mt-2 text-xs font-bold text-fg-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-fg-faint mr-1.5">Service :</span>
                        {nomeServizio}
                      </p>
                    </div>
                    <div className="font-bold text-right text-fg">
                      <span className="block text-[10px] font-bold tracking-wider uppercase text-fg-faint">Barbier</span>
                      {booking.barber ? <span>{booking.barber.name}</span> : <span className="px-2 py-0.5 text-xs uppercase tracking-wider bg-tint-2 text-fg-2 rounded-md">Indifférent</span>}
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
              <tr className="bg-tint border-b border-line-strong">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">Date et heure</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">Client</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">Téléphone</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">Service</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">Barbier</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <span className="block mb-2 text-3xl">📅</span>
                    <span className="font-medium text-fg-muted">Aucune réservation pour cette date.</span>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const dataObj = new Date(booking.start_datetime);
                  const dataFormattata = dataObj.toLocaleDateString("fr-FR", { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'Africa/Algiers' });
                  const oraFormattata = dataObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Algiers' });
                  const nomeServizio = booking.service?.name || services.find((s) => s.id === booking.service_id)?.name || "-";

return (
                    <tr key={booking.id} className="transition-colors border-b-2 border-line-strong/80 hover:bg-tint group">
                      <td className="p-4 font-medium text-fg whitespace-nowrap">
                        {dataFormattata} <span className="ml-2 font-bold text-fg-2">{oraFormattata}</span>
                      </td>
                      <td className="p-4 font-bold capitalize text-fg whitespace-nowrap">
                        {booking.customer_name} {booking.customer_surname}
                      </td>
                      <td className="p-4 font-mono font-medium text-fg-muted whitespace-nowrap">
                        {booking.customer_phone}
                      </td>
                      <td className="p-4 font-bold text-fg whitespace-nowrap">
                        {nomeServizio}
                      </td>
                      <td className="p-4 font-bold text-fg whitespace-nowrap">
                        {booking.barber ? <span>{booking.barber.name}</span> : <span className="px-2 py-1 text-xs uppercase tracking-wider bg-tint-2 text-fg-2 rounded-md">Indifférent</span>}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(booking.id)}
                          disabled={isDeleting === booking.id}
                          className={`px-4 py-1.5 text-xs font-bold transition-all border-2 rounded-lg
                            ${isDeleting === booking.id
                              ? 'border-line-strong text-fg-faint bg-tint-2 cursor-not-allowed'
                              : 'border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-95'}`}
                        >
                          {isDeleting === booking.id ? 'Annulation...' : 'Annuler'}
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