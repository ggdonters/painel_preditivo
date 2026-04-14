"use client";

import React from "react";
import {
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Filter,
  ArrowDownUp,
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

  const obraOptions = ["all", "Residencial Altos", "Torre Norte"];

  function parseDays(risco: string) {
    const m = risco.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
  }

  function applyFilters() {
    let result = [...initialRows];

    if (obraFilter !== "all") {
      result = result.filter((r) => r.obra === obraFilter);
    }

    if (activeSort === "risk") {
      result.sort((a, b) => b.prob - a.prob);
    } else if (activeSort === "urgent") {
      result.sort((a, b) => parseDays(a.risco) - parseDays(b.risco));
    }

    setDisplayedRows(result);
  }

  React.useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraFilter, activeSort]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
  <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed text-gray-800 mb-6">Painel Preditivo de Risco Operacional</h1>

      {/* Filter bar */}
      <div className="flex gap-3 overflow-x-auto mb-4">
        <button
          type="button"
          onClick={() => setObraFilter((prev) => {
            const idx = obraOptions.indexOf(prev);
            const next = obraOptions[(idx + 1) % obraOptions.length];
            return next;
          })}
          className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${obraFilter !== "all" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <Filter size={16} className="mr-2" />
          Por Obra{obraFilter !== "all" ? `: ${obraFilter}` : ""}
        </button>

        <button
          type="button"
          onClick={() => setActiveSort((prev) => (prev === "risk" ? "none" : "risk"))}
          className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${activeSort === "risk" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <ArrowDownUp size={16} className="mr-2" />
          Maior Risco
        </button>

        <button
          type="button"
          onClick={() => setActiveSort((prev) => (prev === "urgent" ? "none" : "urgent"))}
          className={`flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${activeSort === "urgent" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-700 border-gray-200"}`}
        >
          <ArrowDownUp size={16} className="mr-2" />
          Mais Urgente
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