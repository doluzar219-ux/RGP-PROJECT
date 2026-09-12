import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Coins, Lock } from "lucide-react";
import { SHOP_ITEMS, type ShopCategory, type ShopItem } from "../game/config";
import type { Cosmetics } from "../game/types";
import { Pin } from "./Bits";

const CATEGORIES: { id: ShopCategory; label: string; note: string }[] = [
  { id: "tape", label: "Washi Tape", note: "holds your quests down" },
  { id: "pin", label: "Pins & Stickers", note: "the little flourish on top" },
  { id: "paper", label: "Paper Stock", note: "what your cards are made of" },
];

function Preview({ item }: { item: ShopItem }) {
  if (item.category === "tape")
    return (
      <span
        className="block h-6 w-full -rotate-2 rounded-[2px] opacity-90 shadow-[0_1px_3px_rgba(47,40,34,.35)]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg,rgba(255,255,255,.35) 0 5px,rgba(255,255,255,0) 5px 11px), ${item.tape}`,
        }}
      />
    );
  if (item.category === "pin")
    return (
      <span className="flex h-6 w-full items-center justify-center">
        <Pin emoji={item.pin?.emoji} color={item.pin?.color} size={22} />
      </span>
    );
  return (
    <span
      className="block h-6 w-full rounded-[2px] border border-ink/30"
      style={{ background: item.paper?.bg, backgroundImage: item.paper?.pattern }}
    />
  );
}

export function RewardShop({
  gold,
  cosmetics,
  onBuy,
  onEquip,
}: {
  gold: number;
  cosmetics: Cosmetics;
  onBuy: (id: string) => void;
  onEquip: (id: string) => void;
}) {
  const [cat, setCat] = useState<ShopCategory>("tape");
  const items = SHOP_ITEMS.filter((i) => i.category === cat);
  const current = CATEGORIES.find((c) => c.id === cat)!;

  return (
    <section
      aria-labelledby="shop-heading"
      className="paper-card grain relative overflow-hidden rounded-[5px] px-4 pb-6 pt-5 sm:px-7"
      style={{ ["--card-bg" as string]: "#f8eed6", transform: "rotate(.35deg)" }}
    >
      {/* striped awning */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-3"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#cf7a4e 0 18px,#f3e3c3 18px 36px)",
        }}
      />

      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="shop-heading" className="font-marker text-2xl leading-none text-ink">
            the trinket stall
          </h2>
          <p className="mt-1 font-hand text-lg text-ink-soft">
            spend your gold on absolutely useless, completely essential decoration.
          </p>
        </div>
        <span className="ink-box wobble-soft inline-flex items-center gap-1.5 bg-[#fdf3d8] px-3 py-1.5">
          <Coins size={16} className="text-marigold" strokeWidth={2.4} />
          <span className="font-hand text-xl leading-none text-ink">{gold}</span>
          <span className="font-body text-[9px] font-black uppercase tracking-widest text-ink-soft">
            in purse
          </span>
        </span>
      </div>

      {/* category tabs */}
      <div role="tablist" aria-label="Cosmetic categories" className="mt-4 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const on = cat === c.id;
          return (
            <button
              key={c.id}
              id={`shop-tab-${c.id}`}
              role="tab"
              aria-selected={on}
              aria-controls="shop-items-panel"
              type="button"
              onClick={() => setCat(c.id)}
              className="paper-btn wobble-soft px-3 py-1 font-print text-sm focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
              style={{
                ["--btn-bg" as string]: on ? "#f6e3bd" : "#fffcf2",
                transform: on ? "translate(2px,2px) rotate(-1deg)" : undefined,
                boxShadow: on ? "inset 2px 3px 6px rgba(47,40,34,.22)" : undefined,
              }}
            >
              {c.label}
            </button>
          );
        })}
        <span className="font-hand text-base text-ink-faint">— {current.note}</span>
      </div>

      {/* items */}
      <motion.ul
        id="shop-items-panel"
        role="tabpanel"
        aria-labelledby={`shop-tab-${cat}`}
        layout
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {items.map((item, i) => {
          const owned = cosmetics.owned.includes(item.id);
          const equipped = cosmetics.equipped[item.category] === item.id;
          const affordable = gold >= item.price;

          return (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: (i % 3) - 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 20, delay: i * 0.03 }}
              whileHover={{ y: -4, rotate: 0, scale: 1.03 }}
              className="paper-card relative flex flex-col gap-2 rounded-[3px] border border-ink/10 p-2.5 pt-4 focus-within:ring-2 focus-within:ring-amber-800 focus-within:ring-offset-2"
              style={{
                ["--card-bg" as string]: "#fffcf2",
                boxShadow: equipped
                  ? "0 0 0 2.5px #2f2822, 3px 4px 0 rgba(47,40,34,.35)"
                  : undefined,
              }}
            >
              {/* price tag hole + string */}
              <span
                aria-hidden
                className="absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full border border-ink/40 bg-[#e9dcc0]"
              />
              <Preview item={item} />
              <div className="min-h-[2.6rem]">
                <p className="font-hand text-lg leading-tight text-ink">{item.name}</p>
                <p className="font-body text-[9px] leading-snug text-ink-faint">{item.blurb}</p>
              </div>

              {equipped ? (
                <span className="inline-flex items-center justify-center gap-1 rounded-full bg-sage/25 py-1 font-body text-[10px] font-black uppercase tracking-wider text-[#4d6b46]">
                  <Check size={12} strokeWidth={3.4} /> in use
                </span>
              ) : owned ? (
                <button
                  type="button"
                  onClick={() => onEquip(item.id)}
                  aria-label={`Equip ${item.name}`}
                  className="paper-btn wobble-soft py-1 font-print text-xs focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2"
                  style={{ ["--btn-bg" as string]: "#e8f1e4" }}
                >
                  use it
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onBuy(item.id)}
                  disabled={!affordable}
                  aria-disabled={!affordable}
                  aria-label={`Buy ${item.name} for ${item.price} gold`}
                  className={`paper-btn wobble-soft inline-flex items-center justify-center gap-1 py-1 font-print text-xs focus:outline-none focus:ring-2 focus:ring-amber-800 focus:ring-offset-2 ${
                    !affordable ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  style={{ ["--btn-bg" as string]: affordable ? "#f6e3bd" : "#efe7d6" }}
                >
                  {affordable ? (
                    <Coins size={12} className="text-marigold" strokeWidth={2.6} />
                  ) : (
                    <Lock size={11} strokeWidth={2.8} />
                  )}
                  {item.price}
                </button>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
