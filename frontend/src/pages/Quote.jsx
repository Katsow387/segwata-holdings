import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../lib/supabase";

// ---- Edit these. Prices are PLACEHOLDERS until you give me your real rates. ----
const WHATSAPP = "27000000000"; // international format, no + or spaces
const HELPER_FEE = 150; // per extra loader
const TRUCKS = [
  {
    id: "small",
    name: "Small delivery",
    size: "0.5 ton",
    blurb: "Small deliveries and shop collections.",
    example: "A single door fridge, bedside tables and a few boxes.",
    space: "1.8 m × 1.37 m",
    maxKg: "500 kg",
    base: 180,
    perKm: 12,
  },
  {
    id: "standard",
    name: "Standard load",
    size: "1.3 ton",
    blurb: "Small moves and deliveries.",
    example: "A queen bed, fridge, washing machine, boxes and a few small furniture items.",
    space: "2.8 m × 1.6 m",
    maxKg: "1,300 kg",
    base: 280,
    perKm: 16,
  },
  // Add the other three trucks here in the same shape.
];

const rand = (n) => "R" + Math.round(n).toLocaleString("en-ZA");

export default function Quote() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [km, setKm] = useState("");
  const [truckId, setTruckId] = useState(TRUCKS[0].id);
  const [helpers, setHelpers] = useState(0);

  const truck = TRUCKS.find((t) => t.id === truckId);
  const distance = Number(km) > 0 ? Number(km) : 0;
  const ready = pickup.trim() && dropoff.trim() && distance > 0;
  const total = ready ? truck.base + truck.perKm * distance + helpers * HELPER_FEE : 0;

  const message = encodeURIComponent(
    `Hi Segwata, I'd like to book a delivery.\nFrom: ${pickup}\nTo: ${dropoff}\nDistance: ${distance} km\nVehicle: ${truck.name} (${truck.size})\nExtra loaders: ${helpers}\nQuote: ${rand(total)}`
  );

  const saveQuote = () => {
    if (!supabase || !ready) return;
    supabase.from("quote_requests").insert({
      pickup: pickup.trim(), dropoff: dropoff.trim(), distance_km: distance,
      truck: truck.id, helpers, total: Math.round(total * 100) / 100,
    }).then(({ error }) => { if (error) console.warn("Quote not saved:", error.message); });
  };

  return (
    <>
      <SiteHeader />
      <main className="quote">
        <div className="quote__intro">
          <h1>Get your moving or delivery quote</h1>
          <p>Enter your details and the price updates as you go.</p>
        </div>

        <div className="quote__grid">
          <div className="quote__form">
            <fieldset>
              <legend>Route</legend>
              <label className="field">
                <span>Pickup address</span>
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Enter pickup address" autoComplete="street-address" />
              </label>
              <label className="field">
                <span>Destination address</span>
                <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Enter destination address" autoComplete="off" />
              </label>
              <label className="field field--short">
                <span>Driving distance (km)</span>
                <input type="number" min="1" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="e.g. 18" />
              </label>
            </fieldset>

            <fieldset>
              <legend>Choose a vehicle</legend>
              <div className="trucks" role="radiogroup" aria-label="Vehicle">
                {TRUCKS.map((t) => (
                  <button key={t.id} type="button" role="radio" aria-checked={t.id === truckId}
                    className={"truck" + (t.id === truckId ? " truck--on" : "")} onClick={() => setTruckId(t.id)}>
                    <strong>{t.name} <small>({t.size})</small></strong>
                    <span>{t.blurb}</span>
                    <em>Example load: {t.example}</em>
                    <span className="truck__specs">Load space {t.space} · Max {t.maxKg}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Help with loading</legend>
              <div className="stepper">
                <button type="button" onClick={() => setHelpers(Math.max(0, helpers - 1))} aria-label="Fewer loaders">−</button>
                <output>{helpers} extra {helpers === 1 ? "loader" : "loaders"}</output>
                <button type="button" onClick={() => setHelpers(Math.min(4, helpers + 1))} aria-label="More loaders">+</button>
              </div>
            </fieldset>
          </div>

          <aside className="quote__summary" aria-live="polite">
            <h2>Your quote</h2>
            <dl>
              <div><dt>Vehicle</dt><dd>{truck.name}</dd></div>
              <div><dt>Distance</dt><dd>{distance ? `${distance} km` : "Not set"}</dd></div>
              <div><dt>Extra loaders</dt><dd>{helpers}</dd></div>
            </dl>
            <div className="quote__total">
              {ready ? rand(total) : "Add your route"}
              {ready && <small>Estimate. We confirm the final price on WhatsApp.</small>}
            </div>
            <a className={"btn btn--primary" + (ready ? "" : " is-disabled")} aria-disabled={!ready}
              href={ready ? `https://wa.me/${WHATSAPP}?text=${message}` : undefined} onClick={saveQuote} target="_blank" rel="noreferrer">
              Book on WhatsApp
            </a>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
