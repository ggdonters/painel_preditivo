"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Filter,
  ArrowDownUp,
  ChevronDown,
} from "lucide-react";

type StatCardProps = {
  id: string;
  title: string;
  value: string | number;
  valueClass?: string;
  bgClass?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

function StatCard({ title, value, valueClass = "text-gray-800", bgClass = "bg-gray-100", Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center justify-between border">
      <div>
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <h2 className={`text-xl sm:text-2xl font-bold mt-1 ${valueClass}`}>{value}</h2>
      </div>
      <div className={`${bgClass} p-3 rounded-xl`} aria-hidden>
        <Icon className={`${valueClass}`} size={24} />
      </div>
    </div>
  );
}

type AlertRow = {
  id: string;
  item: string;
  obra: string;
  risco: string;
  prob: number;
  actionLabel: string;
  danger?: boolean;
};

function AlertRowItem({ row }: { row: AlertRow }) {
  return (
    <tr className={`hover:bg-gray-50 ${row.id ? "" : ""}`}>
      <td className="py-6 px-8 align-top max-w-xs truncate text-gray-800 whitespace-nowrap">{row.item}</td>
      <td className="py-6 px-8 align-top text-gray-800 whitespace-nowrap">{row.obra}</td>
      <td className="py-6 px-8 text-gray-700 align-top whitespace-nowrap">{row.risco}</td>
      <td className={`py-6 px-8 font-semibold align-top ${row.prob >= 90 ? "text-red-600" : row.prob >= 75 ? "text-yellow-600" : "text-green-600"}`}>
        {row.prob}%
      </td>
      <td className="py-6 px-8 text-right align-top">
        <button
          type="button"
          aria-label={row.actionLabel}
          className={`px-4 py-2 rounded-lg text-sm transition ${row.danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {row.actionLabel}
        </button>
      </td>
    </tr>
  );
}

export default function Page() {
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const stats: StatCardProps[] = [
    {
      id: "critical",
      title: "Itens em Risco Crítico",
      value: 3,
      valueClass: "text-red-600",
      bgClass: "bg-red-100",
      Icon: AlertTriangle,
    },
    {
      id: "economia",
      title: "Economia Projetada (MRO)",
      value: currency.format(4500),
      valueClass: "text-green-600",
      bgClass: "bg-green-100",
      Icon: DollarSign,
    },
    {
      id: "pedidos",
      title: "Pedidos Pendentes",
      value: 2,
      valueClass: "text-yellow-600",
      bgClass: "bg-yellow-100",
      Icon: ShoppingCart,
    },
  ];

  const initialRows: AlertRow[] = [
    {
      id: "r1",
      item: "Luva de Raspa Cano Curto",
      obra: "Residencial Altos",
      risco: "Falta em 4 dias",
      prob: 92,
      actionLabel: "Aprovar Reposição",
      danger: false,
    },
    {
      id: "r2",
      item: "Capacete de Segurança",
      obra: "Torre Norte",
      risco: "Falta em 7 dias",
      prob: 78,
      actionLabel: "Aprovar Reposição",
      danger: false,
    },
    {
      id: "r3",
      item: "Bota de Segurança (Nº 42)",
      obra: "Residencial Altos",
      risco: "Falta em 2 dias",
      prob: 98,
      actionLabel: "Reposição Urgente",
      danger: true,
    },
  ];

  // Filters and sorting state
  const [displayedRows, setDisplayedRows] = React.useState<AlertRow[]>(initialRows);
  const [obraFilter, setObraFilter] = React.useState<string>("all");
  const [activeSort, setActiveSort] = React.useState<"none" | "risk" | "urgent">("none");

  // Por Obra dropdown state
  const [obraDropdownOpen, setObraDropdownOpen] = React.useState(false);
  const [obraSortMode, setObraSortMode] = React.useState<"none" | "az" | "za" | "most" | "least">("none");

  const obraOptions = ["all", "Residencial Altos", "Torre Norte"];
  const uniqueObras = Array.from(new Set(initialRows.map((r) => r.obra)));

  const obraDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const obraButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [dropdownCoords, setDropdownCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);
  // Risk dropdown state and refs
  const [riskDropdownOpen, setRiskDropdownOpen] = React.useState(false);
  const riskButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [riskDropdownCoords, setRiskDropdownCoords] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [riskMin, setRiskMin] = React.useState<number | null>(null);
  const [riskMax, setRiskMax] = React.useState<number | null>(null);
  const [riskPreset, setRiskPreset] = React.useState<string | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (obraDropdownRef.current && !obraDropdownRef.current.contains(target)) {
        setObraDropdownOpen(false);
      }
      if (riskDropdownOpen && riskButtonRef.current && !riskButtonRef.current.contains(target) && !(document.getElementById('risk-dropdown')?.contains(target))) {
        setRiskDropdownOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // update dropdown position when opened or on resize/scroll
  React.useEffect(() => {
    function update() {
      if (obraButtonRef.current) {
        const rect = obraButtonRef.current.getBoundingClientRect();
        // store viewport-relative coordinates (use fixed positioning later)
        setDropdownCoords({ top: rect.bottom, left: rect.left, width: rect.width });
      }
    }
    if (obraDropdownOpen) update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [obraDropdownOpen]);

  // risk dropdown positioning
  React.useEffect(() => {
    function update() {
      if (riskButtonRef.current) {
        const rect = riskButtonRef.current.getBoundingClientRect();
        setRiskDropdownCoords({ top: rect.bottom, left: rect.left, width: rect.width });
      }
    }
    if (riskDropdownOpen) update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [riskDropdownOpen]);


  function parseDays(risco: string) {
    const m = risco.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
  }

  function applyFilters() {
    let result = [...initialRows];

    // filter by obra if selected
    if (obraFilter !== "all") {
      result = result.filter((r) => r.obra === obraFilter);
    }

    // obra sort modes
    if (obraSortMode === "az") {
      result.sort((a, b) => a.item.localeCompare(b.item));
    } else if (obraSortMode === "za") {
      result.sort((a, b) => b.item.localeCompare(a.item));
    } else if (obraSortMode === "most" || obraSortMode === "least") {
      const counts = result.reduce<Record<string, number>>((acc, cur) => {
        acc[cur.obra] = (acc[cur.obra] || 0) + 1;
        return acc;
      }, {});
      result.sort((a, b) => {
        const diff = (counts[b.obra] || 0) - (counts[a.obra] || 0);
        return obraSortMode === "most" ? diff : -diff;
      });
    }

    // other sorts (risk/urgent) apply after obra sorts
    if (activeSort === "risk") {
      result.sort((a, b) => b.prob - a.prob);
    } else if (activeSort === "urgent") {
      result.sort((a, b) => parseDays(a.risco) - parseDays(b.risco));
    }

    // apply risk range filter if set
    if (riskMin !== null || riskMax !== null) {
      result = result.filter((r) => {
        const minOk = riskMin === null ? true : r.prob >= riskMin;
        const maxOk = riskMax === null ? true : r.prob <= riskMax;
        return minOk && maxOk;
      });
    }

    setDisplayedRows(result);
  }

  React.useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraFilter, obraSortMode, activeSort, riskMin, riskMax, riskPreset]);

  // compute a safe style for the portal dropdown (keep inside viewport)
  const portalStyle = React.useMemo(() => {
    if (!dropdownCoords) return undefined;
    const maxWidth = 272; // 64 * 4 + some gap
    const left = Math.min(Math.max(dropdownCoords.left, 8), Math.max(window.innerWidth - maxWidth - 8, 8));
    const top = Math.min(Math.max(dropdownCoords.top + 8, 8), window.innerHeight - 40);
    return { position: "fixed" as const, top, left };
  }, [dropdownCoords]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
  <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed text-gray-800 mb-6">Painel Preditivo de Risco Operacional</h1>

  {/* Filter bar */}
  <div className="flex gap-3 overflow-x-auto overflow-y-visible mb-4 items-center">
        <div className="relative" ref={obraDropdownRef}>
          <button
            ref={obraButtonRef}
            type="button"
            onClick={() => {
              if (obraButtonRef.current) {
                const rect = obraButtonRef.current.getBoundingClientRect();
                setDropdownCoords({ top: rect.bottom, left: rect.left, width: rect.width });
              }
              setObraDropdownOpen((s) => !s);
            }}
            className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${obraFilter !== "all" || obraSortMode !== "none" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
          >
            <Filter size={16} className="mr-2" />
            Por Obra
            <ChevronDown size={14} className="ml-2" />
          </button>

          {obraDropdownOpen && dropdownCoords && createPortal(
            <div style={portalStyle}>
              <div className="w-64 bg-white text-gray-900 shadow-lg rounded-xl border border-gray-100 ring-1 ring-black/5 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold mb-2 text-gray-900">Ordem Alfabética</p>
                  <button
                    type="button"
                    onClick={() => { setObraSortMode("az"); setObraFilter("all"); setObraDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                  >
                      A - Z
                  </button>
                  <button
                    type="button"
                    onClick={() => { setObraSortMode("za"); setObraFilter("all"); setObraDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                  >
                    Z - A
                  </button>
                </div>

                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold mb-2 text-gray-900">Frequência de Obra</p>
                  <button
                    type="button"
                    onClick={() => { setObraSortMode("most"); setObraFilter("all"); setObraDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                  >
                    Mais itens (Obra)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setObraSortMode("least"); setObraFilter("all"); setObraDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                  >
                    Menos itens (Obra)
                  </button>
                </div>

                <div className="px-4 py-3">
                  <p className="text-xs font-semibold mb-2 text-gray-900">Selecionar Obra</p>
                  <button
                    type="button"
                    onClick={() => { setObraFilter("all"); setObraSortMode("none"); setObraDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                  >
                    Todos
                  </button>
                  {uniqueObras.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => { setObraFilter(o); setObraSortMode("none"); setObraDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
        <div className="relative">
          <button
            ref={riskButtonRef}
            type="button"
            onClick={() => {
              if (riskButtonRef.current) {
                const rect = riskButtonRef.current.getBoundingClientRect();
                setRiskDropdownCoords({ top: rect.bottom, left: rect.left, width: rect.width });
              }
              setRiskDropdownOpen((s) => !s);
            }}
            className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${riskMin !== null || riskMax !== null ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
          >
            <ArrowDownUp size={16} className="mr-2" />
            Maior Risco
          </button>

          {riskDropdownOpen && riskDropdownCoords && createPortal(
            <div id="risk-dropdown" style={{ position: 'fixed', top: Math.min(Math.max(riskDropdownCoords.top + 8, 8), window.innerHeight - 40), left: Math.min(Math.max(riskDropdownCoords.left, 8), Math.max(window.innerWidth - 272 - 8, 8)) }} className="z-50">
              <div className="w-64 bg-white text-gray-900 shadow-lg rounded-xl border border-gray-100 ring-1 ring-black/5 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold mb-2 text-gray-900">Intervalos Risco</p>
                  <div className="grid grid-cols-1 gap-1">
                    {/* presets: 0-20, 20-40, 40-60, 60-80, 80-90, 90-95, 95-97.5, 97.5-100 */}
                    {[
                      { key: '0-20', label: '0 - 20%', min: 0, max: 20 },
                      { key: '20-40', label: '20 - 40%', min: 20, max: 40 },
                      { key: '40-60', label: '40 - 60%', min: 40, max: 60 },
                      { key: '60-80', label: '60 - 80%', min: 60, max: 80 },
                      { key: '80-90', label: '80 - 90%', min: 80, max: 90 },
                      { key: '90-95', label: '90 - 95%', min: 90, max: 95 },
                      { key: '95-975', label: '95 - 97.5%', min: 95, max: 97.5 },
                      { key: '975-100', label: '97.5 - 100%', min: 97.5, max: 100 },
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => { setRiskMin(p.min); setRiskMax(p.max); setRiskPreset(p.key); setRiskDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 border-b">
                  <p className="text-xs font-semibold mb-2 text-gray-900">Customizar intervalo</p>
                  <div className="flex gap-2 items-center">
                    <input
                      aria-label="minimo risco"
                      value={riskMin ?? ''}
                      onChange={(e) => setRiskMin(e.target.value === '' ? null : parseFloat(e.target.value))}
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      className="w-1/2 px-3 py-2 border rounded-md text-sm"
                      placeholder="mín %"
                    />
                    <span className="text-sm">até</span>
                    <input
                      aria-label="maximo risco"
                      value={riskMax ?? ''}
                      onChange={(e) => setRiskMax(e.target.value === '' ? null : parseFloat(e.target.value))}
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      className="w-1/2 px-3 py-2 border rounded-md text-sm"
                      placeholder="máx %"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setRiskPreset('custom'); setRiskDropdownOpen(false); }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
                    >
                      Aplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRiskMin(null); setRiskMax(null); setRiskPreset(null); setRiskDropdownOpen(false); }}
                      className="px-3 py-2 bg-white border rounded-md text-sm"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        <button
          type="button"
          onClick={() => setActiveSort((prev) => (prev === "urgent" ? "none" : "urgent"))}
          className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${activeSort === "urgent" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <ArrowDownUp size={16} className="mr-2" />
          Mais Urgente
        </button>
        
        {/* Clear filters button aligned to the right */}
        <button
          type="button"
          onClick={() => {
            setObraFilter("all");
            setObraSortMode("none");
            setObraDropdownOpen(false);
            setActiveSort("none");
            setRiskMin(null);
            setRiskMax(null);
            setRiskPreset(null);
            setRiskDropdownOpen(false);
            // applyFilters will re-run via effect
          }}
          aria-label="Limpar filtros"
          className="ml-auto flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        >
          Limpar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {stats.map((s) => (
          <StatCard key={s.id} {...s} />
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-sm border p-6" aria-labelledby="alerts-heading">
        <h2 id="alerts-heading" className="text-lg font-semibold text-gray-800 mb-4">
          Alertas de Ruptura de Estoque
        </h2>

        {/* Mobile: lista de cards (mobile-first). Desktop (md+) mostra a tabela */}
        <div className="md:hidden space-y-6">
          {displayedRows.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-gray-800 mb-4">{r.item}</p>
                  <p className="text-xs text-gray-600 mb-4">{r.obra}</p>
                  <p className="text-xs text-gray-600 mb-4">{r.risco}</p>
                </div>
                <div className={`text-sm font-semibold ${r.prob >= 90 ? "text-red-600" : r.prob >= 75 ? "text-yellow-600" : "text-green-600"}`}>
                  {r.prob}%
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  aria-label={r.actionLabel}
                  className={`w-full px-4 py-2 rounded-lg text-sm transition ${r.danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {r.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/tablet: mostrar tabela a partir de md */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[850px]">
            <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="text-gray-500 border-b">
                <th scope="col" className="py-6 px-8 whitespace-nowrap">Item</th>
                <th scope="col" className="py-6 px-8 whitespace-nowrap">Obra</th>
                <th scope="col" className="py-6 px-8 whitespace-nowrap">Risco</th>
                <th scope="col" className="py-6 px-8 whitespace-nowrap">Probabilidade</th>
                <th scope="col" className="py-6 px-8 text-right whitespace-nowrap">Ação</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((r) => (
                <React.Fragment key={r.id}>
                  <AlertRowItem row={r} />
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </main>
  );
}