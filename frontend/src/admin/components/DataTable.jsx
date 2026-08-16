import { LuPencil, LuTrash2, LuSearch, LuInbox } from "react-icons/lu";

export default function DataTable({ columns, rows, onEdit, onDelete, search, onSearchChange, filterSlot, loading, extraActions }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-ink-700">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cloud-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl bg-ink-900 border border-ink-600 pl-9 pr-3 py-2 text-sm text-cloud-100 placeholder:text-cloud-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {filterSlot}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-cloud-400">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-cloud-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-14 text-center text-cloud-500">
                  <div className="flex flex-col items-center gap-2">
                    <LuInbox className="h-8 w-8" />
                    <span>No records found.</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={row._id} className="border-b border-ink-700/60 hover:bg-ink-700/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-cloud-200 max-w-[240px] truncate">
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {extraActions && extraActions(row)}
                      <button
                        onClick={() => onEdit(row)}
                        className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-blue-400"
                        aria-label="Edit"
                      >
                        <LuPencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="p-2 rounded-lg text-cloud-300 hover:bg-ink-700 hover:text-coral-400"
                        aria-label="Delete"
                      >
                        <LuTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
