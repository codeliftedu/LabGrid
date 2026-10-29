import React, { useState } from 'react';
import { Shield, Search, Lock, FileText } from 'lucide-react';
import { AuditLedgerEntry, BookingRecord, UserPersona } from '../types/labgrid';

interface AuditFairnessLedgerProps {
  auditLogs: AuditLedgerEntry[];
  users: UserPersona[];
  bookings: BookingRecord[];
}

export const AuditFairnessLedger: React.FC<AuditFairnessLedgerProps> = ({
  auditLogs,
  users,
  bookings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((entry) => {
    const matchesEntity = entityFilter === 'ALL' || entry.entityType === entityFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      entry.actionType.toLowerCase().includes(q) ||
      entry.actorName.toLowerCase().includes(q) ||
      entry.justification.toLowerCase().includes(q) ||
      entry.entityId.toLowerCase().includes(q) ||
      entry.hash.toLowerCase().includes(q);
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Institutional Fairness & Anti-Monopolization Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-indigo-600 font-semibold">
              STEP 10 · IMMUTABLE CRYPTOGRAPHIC AUDIT & FAIRNESS LEDGER
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Append-Only Transaction Ledger & Anti-Monopolization Telemetry
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Every state transition, condition photo, and manager rejection reason is hash-chained. Neither users nor lab owners can delete historical records.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg whitespace-nowrap shrink-0">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>WRITE-ONCE APPEND LEDGER VERIFIED ({auditLogs.length} BLOCKS)</span>
          </div>
        </div>

        {/* Institutional Quota Fairness Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {users.map((u) => {
            const pct = Math.min(100, Math.round((u.weeklyQuotaUsed / u.weeklyQuotaCap) * 100));
            return (
              <div
                key={u.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-500">{u.department}</div>
                  </div>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {u.weeklyQuotaUsed}h / {u.weeklyQuotaCap}h
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-transform"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>RELIABILITY: {u.reliabilityScore}%</span>
                  <span>SESSIONS: {u.completedSessions}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search immutable ledger by Actor, Hash, Action Type, or Justification..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['ALL', 'BOOKING', 'CREDENTIAL', 'RESOURCE', 'INCIDENT'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEntityFilter(type)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  entityFilter === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Immutable Audit Timeline Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500">
                <th className="py-2.5 px-3">BLOCK HASH / UTC TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTOR & ROLE</th>
                <th className="py-2.5 px-3">ACTION & ENTITY</th>
                <th className="py-2.5 px-3">STATE TRANSITION</th>
                <th className="py-2.5 px-3">JUSTIFICATION RECORD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono whitespace-nowrap align-top">
                    <div className="font-semibold text-indigo-700">{log.hash}</div>
                    <div className="text-[11px] text-slate-500 tabular-nums">{log.timestamp}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap align-top">
                    <div className="font-semibold text-slate-900">{log.actorName}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {log.actorRole} · {log.actorId}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap align-top">
                    <div className="font-mono font-semibold text-slate-900">{log.actionType}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {log.entityType} ({log.entityId})
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] align-top">
                    <div className="text-slate-500">{log.beforeState}</div>
                    <div className="text-emerald-700 font-semibold mt-0.5">→ {log.afterState}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-md align-top leading-relaxed">
                    {log.justification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Deletable Historical Condition Evidence Vault */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Non-Repudiable Visual Condition Evidence Archive
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            DELETION LOCKED BY INSTITUTIONAL POLICY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings
            .filter((b) => b.checkInLog || b.checkOutLog)
            .map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-mono font-semibold text-slate-900">
                    {b.resourceSerial} · {b.userName} ({b.dateLabel})
                  </div>
                  <div className="text-slate-600">
                    Check-In: {b.checkInLog?.conditionRating || 'N/A'} · Check-Out:{' '}
                    {b.checkOutLog?.conditionRating || 'IN PROGRESS'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{b.checkOutLog?.notes || b.checkInLog?.notes}</span>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                  HASH LOCKED
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
