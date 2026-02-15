"use client";

import Reveal from "@/app/components/Reveal";
import { useState } from "react";

interface ShoppingListShowcaseSectionProps {
  labels: {
    badge: string;
    title: string;
    subtitle: string;
    totalItemsLabel: string;
    estimatedCostLabel: string;
    estimatedCostValue: string;
    featureAutoGrouped: string;
    featureQuickCheckoff: string;
    featureRealtimeUpdates: string;
    categoryProduce: string;
    categoryDairyEggs: string;
    categoryMeatFish: string;
    categoryPantry: string;
    itemRipeAvocado: string;
    itemRedOnion: string;
    itemCherryTomatoes: string;
    itemFreeRangeEggs: string;
    itemGreekYogurt: string;
    itemChickenBreast: string;
    itemSalmonFillet: string;
    itemOats: string;
    itemOliveOil: string;
    qty2pcs: string;
    qty1pc: string;
    qty250g: string;
    qty10pcs: string;
    qty500g: string;
    qty800g: string;
    qty300g: string;
    qty1pack: string;
    qty1bottle: string;
  };
}

type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  checked?: boolean;
};

type ShoppingCategory = {
  title: string;
  items: ShoppingItem[];
};

export default function ShoppingListShowcaseSection({ labels }: ShoppingListShowcaseSectionProps) {
  const categories: ShoppingCategory[] = [
    {
      title: labels.categoryProduce,
      items: [
        { id: "ripe-avocado", name: labels.itemRipeAvocado, quantity: labels.qty2pcs },
        { id: "red-onion", name: labels.itemRedOnion, quantity: labels.qty1pc, checked: true },
        { id: "cherry-tomatoes", name: labels.itemCherryTomatoes, quantity: labels.qty250g },
      ],
    },
    {
      title: labels.categoryDairyEggs,
      items: [
        { id: "free-range-eggs", name: labels.itemFreeRangeEggs, quantity: labels.qty10pcs },
        { id: "greek-yogurt", name: labels.itemGreekYogurt, quantity: labels.qty500g },
      ],
    },
  ];
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(
    () =>
      new Set(
        categories
          .flatMap((category) => category.items)
          .filter((item) => item.checked)
          .map((item) => item.id)
      )
  );

  const toggleItem = (itemId: string) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <section className="section-anchor px-2 pb-10 pt-2 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 sm:rounded-3xl sm:border sm:border-forest-green/15 sm:bg-white/65 sm:p-6 sm:shadow-[0_24px_70px_-45px_rgba(28,51,37,0.8)] sm:backdrop-blur-sm lg:grid-cols-[1fr_520px] lg:items-start lg:gap-14 lg:p-10">
        <Reveal direction="right" delay={250} className="order-2 mx-auto w-full sm:max-w-[370px] lg:max-w-[520px]">
          <div className="overflow-hidden rounded-[28px] border border-[#c6c0b2] bg-[#dbd4c8] p-3 shadow-[0_30px_80px_-40px_rgba(57,67,52,0.85)] sm:p-4">
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="rounded-xl bg-[#d1cdc2] px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#60715d]">
                  {labels.totalItemsLabel}
                </p>
                <p className="text-[2rem] font-black leading-none text-[#32513f] sm:text-4xl">5</p>
              </div>
              <div className="rounded-xl bg-[#d1cdc2] px-3 py-2.5 text-right sm:rounded-2xl sm:px-4 sm:py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#60715d]">
                  {labels.estimatedCostLabel}
                </p>
                <p className="text-[2rem] font-black leading-none text-[#32513f] sm:text-4xl">{labels.estimatedCostValue}</p>
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.title}>
                  <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7d8078]">
                    {category.title}
                  </p>
                  <div className="rounded-[20px] border border-[#ddd7ca] bg-[#efede7] px-2.5 py-2 sm:rounded-[24px] sm:px-3 sm:py-2.5">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-2 px-1 py-2 ${itemIndex !== category.items.length - 1 ? "border-b border-[#d7d1c4]" : ""}`}
                      >
                        <button
                          type="button"
                          aria-pressed={checkedItemIds.has(item.id)}
                          aria-label={`Toggle ${item.name}`}
                          onClick={() => toggleItem(item.id)}
                          className="min-w-0 flex items-center gap-2.5 text-left"
                        >
                          <span
                            className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:size-6 ${checkedItemIds.has(item.id) ? "border-[#4f725a] bg-[#edf4ed] text-[#4f725a]" : "border-[#9caf9d] bg-transparent text-transparent hover:border-[#7b8f7f]"}`}
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-xs sm:text-sm">done</span>
                          </span>
                          <span
                            className={`truncate text-[15px] font-semibold sm:text-[17px] ${checkedItemIds.has(item.id) ? "text-[#8f8b84] line-through" : "text-[#23492f]"}`}
                          >
                            {item.name}
                          </span>
                        </button>

                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#dce4d7] text-[#5f8167] sm:size-7">
                            <span aria-hidden="true" className="material-symbols-outlined text-[13px] sm:text-[15px]">shopping_bag</span>
                          </span>
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#f7e3d2] sm:size-7">
                            <span aria-hidden="true" className="inline-block size-2 rounded-full bg-[#ea7e2a] sm:size-2.5" />
                          </span>
                          <span className="text-xs font-semibold text-[#8b867e] sm:text-sm">{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="order-1 space-y-6 rounded-2xl border border-forest-green/15 bg-white/65 p-5 shadow-lg backdrop-blur-sm sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none lg:pt-2">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {labels.badge}
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="display-type text-4xl font-bold leading-tight text-forest-green lg:text-5xl">
              {labels.title}
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
              {labels.subtitle}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-primary">category</span>
                <span className="leading-relaxed">{labels.featureAutoGrouped}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-primary">done_all</span>
                <span className="leading-relaxed">{labels.featureQuickCheckoff}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-primary">sync</span>
                <span className="leading-relaxed">{labels.featureRealtimeUpdates}</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

