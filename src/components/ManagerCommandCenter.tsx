import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Unlock,
  Sliders,
  FileCheck2,
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  BookingRecord,
  CredentialBadge,
  IncidentReport,
  ResourceCategory,
  ResourceItem,
  SupervisionMode,
} from '../types/labgrid';

interface ManagerCommandCenterProps {
  resources: ResourceItem[];
  bookings: BookingRecord[];
  credentials: CredentialBadge[];
  incidents: IncidentReport[];
  onApproveBooking: (bookingId: string, reason: string, alsoVerifyBadgeCode?: string) => void;
  onWaitlistBooking: (bookingId: string, reason: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onVerifyCredential: (credentialId: string) => void;
  onResolveIncidentAndUnlock: (incidentId: string, resolutionNote: string) => void;
  onCreateResource: (newResource: Omit<ResourceItem, 'id' | 'ownerId' | 'ownerName' | 'status'>) => void;
  openCreateDrawerDefault?: boolean;
}

export const ManagerCommandCenter: React.FC<ManagerCommandCenterProps> = ({
  resources,
  bookings,
  credentials,
  incidents,
  onApproveBooking,
  onWaitlistBooking,
  onRejectBooking,
  onVerifyCredential,
  onResolveIncidentAndUnlock,
  onCreateResource,
  openCreateDrawerDefault = false,
}) => {
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // Step 1: Guided 3-Step Resource Creation Drawer State
  const [showCreateDrawer, setShowCreateDrawer] = useState(openCreateDrawerDefault);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('Formlabs Form 4B Biocompatible SLA Printer');
  const [serialId, setSerialId] = useState('BIO-SLA-204');
  const [category, setCategory] = useState<ResourceCategory>('Fabrication');
  const [location, setLocation] = useState('Bldg 34 · Room 108 (Sterile Bench)');
  const [building, setBuilding] = useState('Engineering Foundry');
  const [replacementValueUsd, setReplacementValueUsd] = useState(8900);
  const [hourlySlotSize, setHourlySlotSize] = useState(2);
  const [badgeCode, setBadgeCode] = useState('FAB-SLA-BIO');
  const [badgeLabel, setBadgeLabel] = useState('Biocompatible Photopolymer Resin Handling L2');
  const [supervisionMode, setSupervisionMode] = useState<SupervisionMode>('AUTONOMOUS');
  const [maxHrsPerWeek, setMaxHrsPerWeek] = useState(6);
  const [safetySopSummary, setSafetySopSummary] = useState(
    'Nitrile gloves mandatory when handling uncured resin tanks. Wash parts in IPA bath #2 for 10 minutes before UV post-cure.'
  );

  const pendingOrWaitlistedBookings = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'WAITLISTED'
  );
  const pendingCredentials = credentials.filter((c) => c.status === 'PENDING');

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateResource({
      serialId,
      name,
      category,
      location,
      building,
      replacementValueUsd,
      hourlySlotSize,
      maxHrsPerWeek,
      supervisionMode,
      requiredBadges: [{ code: badgeCode, label: badgeLabel }],
      requiresSopSignoff: true,
      preFlightChecklist: [
        'Inspect optical resin tank film for cured debris before build platform descent',
        'Verify nitrile PPE & IPA wash station ventilation active',
        'Confirm wiper arm locked into resin cartridge carriage',
      ],
      specifications: [
        { label: 'XY Resolution', value: '50 Microns LFD Optical Engine' },
        { label: 'Build Volume', value: '200 × 125 × 210 mm' },
        { label: 'Approved Resins', value: 'BioMed Clear, Tough 1500, High Temp' },
      ],
      safetySopSummary,
      visualType: 'printer_3d',
    });
    setShowCreateDrawer(false);
    setWizardStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Command Center Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-indigo-600 font-semibold">
            STEP 1, 5, 6 & 9 · OWNER COMMAND CENTER (DR. ARIS THORNE)
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Fair-Allocation Triage Queue, AI Badge Sign-Off & Fleet Governance
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Review competing requests ranked by the Anti-Monopolization Priority Formula, sign off AI-screened safety certificates, and manage safety lockouts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateDrawer(true);
            setWizardStep(1);
          }}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>List New Resource (Step 1 Wizard)</span>
        </button>
      </div>

      {/* Step 5 & 6: Manager Triage Queue & Side-by-Side Fair Allocation Comparison */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Step 5 & 6. Fair-Allocation Request Triage & Contention Resolver
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Requests are ranked deterministically: Base (50) − Recent Usage Penalty (5 × hrs) + Purpose Weight (+20/+5) + Reliability Bonus (+10)
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
            {pendingOrWaitlistedBookings.length} IN QUEUE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const pendingBadge = credentials.find(
              (c) => c.userId === booking.userId && c.status === 'PENDING'
            );
            const reasonValue =
              rejectionReasons[booking.id] ??
              'Deferred to off-peak hours due to competing Capstone deadline with higher fair-use priority.';

            return (
              <div
                key={booking.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span>{booking.resourceSerial}</span>
                        <span>·</span>
                        <span>{booking.dateLabel}</span>
                        <span>·</span>
                        <span>
                          {booking.startHour}:00–{booking.startHour + booking.durationHours}:00
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {booking.resourceName}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono font-bold text-indigo-700 tabular-nums">
                        {booking.priorityBreakdown.totalScore} / 100 PTS
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        STATUS: {booking.status}
                      </div>
                    </div>
                  </div>

                  {/* Requester & Explainable Math */}
                  <div className="p-3 rounded-md bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        Requester: {booking.userName} ({booking.userDepartment})
                      </span>
                      <span className="font-mono text-slate-700">{booking.purpose}</span>
                    </div>
                    <p className="text-slate-600">{booking.projectDescription}</p>
                    <div className="pt-1.5 border-t border-slate-100 font-mono text-[11px] text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{booking.priorityBreakdown.explanation}</span>
                    </div>
                  </div>

                  {/* Human-in-the-Loop AI Document Pre-Check Card */}
                  {booking.verificationReport.aiDocumentPreCheck && (
                    <div className="p-3 rounded-md border border-indigo-200 bg-indigo-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-indigo-600" />
                          <span>
                            AI Pre-Verified Certificate ({booking.verificationReport.aiDocumentPreCheck.confidence}% Match)
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Pre-Screened • Requires Authorised Manager Sign-off</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        {booking.verificationReport.aiDocumentPreCheck.summary}
                      </p>
                      {pendingBadge && (
                        <button
                          type="button"
                          onClick={() => onVerifyCredential(pendingBadge.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                        >
                          Authorise & Sign Off {pendingBadge.badgeCode} Credential Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mandatory Decision / Reason Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Manager Justification / Audit Reason Code (Logged to Immutable Ledger)
                    </label>
                    <input
                      type="text"
                      value={reasonValue}
                      onChange={(e) =>
                        setRejectionReasons((prev) => ({
                          ...prev,
                          [booking.id]: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>
                </div>

                {/* One-Click Manager Decision Controls */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onApproveBooking(
                          booking.id,
                          `Approved by Dr. Aris Thorne: Priority Score ${booking.priorityBreakdown.totalScore}/100 pts verified.`,
                          pendingBadge?.badgeCode
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {pendingBadge ? 'Sign Off Badge & Approve' : 'Approve Request'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onWaitlistBooking(
                          booking.id,
                          `Waitlisted #1 via Anti-Monopolization Engine: Higher priority score request allocated primary slot.`
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Place on Smart Waitlist</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRejectBooking(booking.id, reasonValue)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject with Reason</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending Credentials Sign-Off Queue & Incident Lockout Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Credentials */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Safety Training Badges Awaiting Human Sign-Off
              </h3>
              <p className="text-xs text-slate-500">
                Rule #12 Guardrail: AI pre-screens documents; Lab Director holds final authority.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {pendingCredentials.length} PENDING
            </span>
          </div>

          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <span className="font-mono">{cred.badgeCode}</span>
                  <span>·</span>
                  <span>{cred.title}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {cred.aiExtractedSummary || `Issued by ${cred.issuer} (${cred.issuedAt})`}
                </p>
                {cred.aiConfidenceScore && (
                  <span className="inline-block mt-1 text-[11px] font-mono text-indigo-700">
                    AI Pre-Screened ({cred.aiConfidenceScore}% Conf) • Requires Authorised Manager Sign-off
                  </span>
                )}
              </div>

              {cred.status === 'VERIFIED' ? (
                <span className="text-xs font-mono font-semibold text-emerald-700 whitespace-nowrap">
                  VERIFIED ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onVerifyCredential(cred.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sign Off Badge</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Fleet Health & Incident Lockout Board */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fleet Health, Damage Reports & Safety Lockout Control
              </h3>
              <p className="text-xs text-slate-500">
                Critical damage reports automatically lock equipment until cleared by the Lab Manager.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {incidents.length} INCIDENT LOGS
            </span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => {
              const noteVal =
                resolutionNotes[inc.id] ??
                'Replaced thermistor cartridge, verified PID thermal stability at 260°C, and cleared safety interlock.';
              return (
                <div
                  key={inc.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono text-slate-500">
                        {inc.resourceName} · Reported by {inc.reporterName}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Severity: {inc.severity} · Status: {inc.resolutionStatus}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Pre-Screened • Requires Authorised Manager Sign-off</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{inc.description}</p>
                  <div className="p-2.5 rounded bg-white border border-slate-200 text-xs text-slate-800 font-mono">
                    {inc.aiSummary}
                  </div>

                  {inc.resolutionStatus !== 'RESOLVED_CLEARED' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={noteVal}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({ ...prev, [inc.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => onResolveIncidentAndUnlock(inc.id, noteVal)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Clear Lockout & Restore Operational</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 font-medium">
                      Cleared by {inc.resolvedBy}: {inc.resolutionNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 1: Guided 3-Step Resource Creation Drawer */}
      {showCreateDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto border-l border-slate-200 flex flex-col justify-between">
            <div>
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">
                    STEP 1 · GUIDED 3-STEP RESOURCE CREATION WIZARD
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    List New Institutional Equipment & Governance Rules
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateDrawer(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3-Step Indicator */}
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className={`py-1.5 px-2 rounded text-left ${
                    wizardStep === 1 ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  1. Asset Details
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className={`py-1.5 px-2 rounded text-left ${
                    wizardStep === 2 ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  2. Safety Gates
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className={`py-1.5 px-2 rounded text-left ${
                    wizardStep === 3 ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
                  }`}
                >
                  3. Fair-Use Quotas
                </button>
              </div>

              <form id="create-resource-form" onSubmit={handleWizardSubmit} className="p-6 space-y-4">
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Equipment Name & Model
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Department Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Fabrication">Fabrication</option>
                          <option value="Optics & Bio-Imaging">Optics & Bio-Imaging</option>
                          <option value="Precision Electronics">Precision Electronics</option>
                          <option value="Media & Acoustics">Media & Acoustics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Asset Serial ID
                        </label>
                        <input
                          type="text"
                          required
                          value={serialId}
                          onChange={(e) => setSerialId(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Building & Room Location
                        </label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Replacement Value (USD)
                        </label>
                        <input
                          type="number"
                          required
                          value={replacementValueUsd}
                          onChange={(e) => setReplacementValueUsd(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Required Safety Training Badge Code
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeCode}
                        onChange={(e) => setBadgeCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Certification Title
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeLabel}
                        onChange={(e) => setBadgeLabel(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Mandatory Safety SOP Summary
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={safetySopSummary}
                        onChange={(e) => setSafetySopSummary(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Supervision & Access Governance Mode
                      </label>
                      <select
                        value={supervisionMode}
                        onChange={(e) => setSupervisionMode(e.target.value as SupervisionMode)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="AUTONOMOUS">Autonomous Access (Instant if Badges Verified)</option>
                        <option value="STAFF_SUPERVISION">Staff Supervision Required</option>
                        <option value="MANAGER_APPROVAL">Manager Approval Mandatory</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Standard Slot Size (Hours)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={hourlySlotSize}
                          onChange={(e) => setHourlySlotSize(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Fair-Use Max Peak Hours / Week
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={20}
                          value={maxHrsPerWeek}
                          onChange={(e) => setMaxHrsPerWeek(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((wizardStep - 1) as 1 | 2 | 3)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((wizardStep + 1) as 1 | 2 | 3)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="create-resource-form"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Resource & Log to Audit Ledger</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
