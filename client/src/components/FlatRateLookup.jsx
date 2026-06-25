import { useState, useEffect, useMemo, useCallback } from "react";

const PAGE_SIZE = 50;
const DATA_URL = "/flat-rates.json";

const SOURCE_STYLES = {
  "NCM RV": { background: "#dbeafe", color: "#1e40af" },
  RVDA: { background: "#d1fae5", color: "#065f46" },
};

function hoursColor(h) {
  if (h >= 4) return "#dc2626";
  if (h >= 2) return "#d97706";
  return "#059669";
}

export default function FlatRateLookup({ onSelectJob }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [srcFilter, setSrcFilter] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const categories = useMemo(
    () => [...new Set(data.map((r) => r.category).filter(Boolean))].sort(),
    [data]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let res = data;
    if (q) res = res.filter((r) =>
      r.description.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
    if (catFilter) res = res.filter((r) => r.category === catFilter);
    if (srcFilter) res = res.filter((r) => r.source === srcFilter);
    if (sortCol) {
      res = [...res].sort((a, b) => {
        if (sortCol === "hours") return sortDir * (a.hours - b.hours);
        return sortDir * String(a[sortCol]).localeCompare(String(b[sortCol]));
      });
    }
    return res;
  }, [data, search, catFilter, srcFilter, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback((col) => {
    setSortCol((prev) => {
      if (prev === col) setSortDir((d) => d * -1);
      else { setSortDir(1); }
      return col;
    });
    setPage(1);
  }, []);

  const clearFilters = () => {
    setSearch(""); setCatFilter(""); setSrcFilter(""); setPage(1);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
      Loading flat rate data...
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>
      Failed to load flat rates: {error}.<br />
      Make sure flat-rates.json is in the public/ folder.
    </div>
  );

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "#1e3a5f", padding: "12px 20px", borderRadius: "8px 8px 0 0",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <span style={{ color: "#fbbf24", fontSize: 18 }}>🔧</span>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "0.02em" }}>
          Flat Rate Labor Lookup
        </span>
        <span style={{
          marginLeft: "auto", background: "rgba(255,255,255,0.12)",
          color: "#94a3b8", fontSize: 11, padding: "3px 8px", borderRadius: 20
        }}>
          {data.length.toLocaleString()} jobs
        </span>
      </div>

      {/* Filter bar */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderTop: "none",
        padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "#9ca3af", fontSize: 14
          }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs — e.g. water heater, awning, slideout..."
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "9px 12px 9px 32px",
              border: "1px solid #d1d5db", borderRadius: 6,
              fontSize: 13, background: "#f9fafb"
            }}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          style={{ padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, background: "#f9fafb", minWidth: 180 }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <select
          value={srcFilter}
          onChange={(e) => { setSrcFilter(e.target.value); setPage(1); }}
          style={{ padding: "9px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, background: "#f9fafb" }}
        >
          <option value="">All sources</option>
          <option value="NCM RV">NCM RV</option>
          <option value="RVDA">RVDA</option>
        </select>
        <button
          onClick={clearFilters}
          style={{
            padding: "9px 14px", border: "1px solid #d1d5db", borderRadius: 6,
            fontSize: 12, background: "#fff", cursor: "pointer", color: "#6b7280"
          }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderTop: "none", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 110 }} />
            <col />
            <col style={{ width: 150 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 70 }} />
          </colgroup>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {[
                ["code", "Code"],
                ["description", "Job Description"],
                ["category", "Category"],
                ["model_class", "Model/Class"],
                ["source", "Source"],
                ["hours", "Hours"],
              ].map(([col, label]) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{
                    textAlign: col === "hours" ? "right" : "left",
                    padding: "10px 12px", fontWeight: 500, fontSize: 12,
                    color: "#6b7280", cursor: "pointer", userSelect: "none"
                  }}
                >
                  {label} {sortCol === col ? (sortDir === 1 ? "▲" : "▼") : "⇅"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  No jobs found. Try a different search term.
                </td>
              </tr>
            ) : pageData.map((r, i) => {
              const sc = SOURCE_STYLES[r.source] || { background: "#f3f4f6", color: "#374151" };
              return (
                <tr
                  key={`${r.code}-${i}`}
                  onClick={() => onSelectJob && onSelectJob(r)}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f9fafb",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: onSelectJob ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => onSelectJob && (e.currentTarget.style.background = "#eff6ff")}
                  onMouseLeave={(e) => onSelectJob && (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f9fafb")}
                >
                  <td style={{ padding: "9px 12px", fontFamily: "monospace", fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.code}</td>
                  <td style={{ padding: "9px 12px", color: "#111827" }}>{r.description}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.category || "—"}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.model_class || "—"}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ ...sc, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap" }}>
                      {r.source}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, fontSize: 14, color: hoursColor(r.hours) }}>
                    {r.hours > 0 ? r.hours.toFixed(2) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        background: "#f9fafb", border: "1px solid #e5e7eb", borderTop: "none",
        padding: "10px 16px", borderRadius: "0 0 8px 8px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {filtered.length.toLocaleString()} job{filtered.length !== 1 ? "s" : ""} found
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", color: "#6b7280" }}
          >‹</button>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 12, background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", color: "#6b7280" }}
          >›</button>
        </div>
      </div>
    </div>
  );
}
