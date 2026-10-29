import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  Camera,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Columns,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BookingRecord,
  ConditionRating,
  IncidentSeverity,
  ResourceItem,
  UserPersona,
} from '../types/labgrid';
import { getConditionPhotoDataUrl } from '../utils/inspectionArtwork';

interface ActiveSessionHubProps {
  bookings: BookingRecord[];
  resources: ResourceItem[];
  currentUser: UserPersona;
  selectedBookingId: string | null;
  onSelectBooking: (id: string) => void;
  onCompleteCheckIn: (
    bookingId: string,
    payload: {
      qrVerified: boolean;
      checklistCompleted: { item: string; checked: boolean }[];
      conditionRating: ConditionRating;
      notes: string;
      photoDataUrl: string;
    }
  ) => void;
  onCompleteCheckOut: (
    bookingId: string,
    payload: {
      conditionRating: ConditionRating;
      notes: string;
      photoDataUrl: string;
    }
  ) => void;
  onRequestExtension: (bookingId: string, minutes: number) => void;
  onReportIncident: (payload: {
    bookingId: string;
    resourceId: string;
    severity: IncidentSeverity;
    description: string;
  }) => Promise<void>;
}

const LIFECYCLE_STAGES = [
  { key: 'REQUESTED', label: '1. Requested' },
  { key: 'VERIFIED', label: '2. 4-Pt Verified' },
  { key: 'APPROVED', label: '3. Approved' },
  { key: 'ACTIVE_IN_USE', label: '4. Checked-In' },
  { key: 'COMPLETED', label: '5. Returned & Audited' },
];

export const ActiveSessionHub: React.FC<ActiveSessionHubProps> = ({
  bookings,
  resources,
  currentUser,
  selectedBookingId,
  onSelectBooking,
  onCompleteCheckIn,
  onCompleteCheckOut,
  onRequestExtension,
  onReportIncident,
}) => {
  const activeBooking =
    bookings.find((b) => b.id === selectedBookingId) ||
    bookings.find((b) => b.status === 'ACTIVE_IN_USE' || b.status === 'APPROVED') ||
    bookings[0];

  const resource = resources.find((r) => r.id === activeBooking?.resourceId) || resources[0];

  // Check-In State
  const [qrScanned, setQrScanned] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });
  const [checkInCondition, setCheckInCondition] = useState<ConditionRating>('MINT');
  const [checkInNotes, setCheckInNotes] = useState(
    'Optical enclosure, emergency stop interlock, and work surface verified clean prior to start.'
  );

  // Check-Out State
  const [checkOutCondition, setCheckOutCondition] = useState<ConditionRating>('MINT');
  const [checkOutNotes, setCheckOutNotes] = useState(
    'Work area vacuumed, optics clean, zero tool wear or calibration drift observed.'
  );
  const [diffMode, setDiffMode] = useState<'SIDE_BY_SIDE' | 'SLIDER'>('SIDE_BY_SIDE');
  const [sliderPos, setSliderPos] = useState(50);

  // Incident & Damage Reporting State (Step 9)
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>('UNSAFE_OUT_OF_COMMISSION');
  const [incidentDescription, setIncidentDescription] = useState(
    'Carbon-fiber nozzle thermistor fault triggered thermal runaway warning during layer 42; emergency stop pressed immediately.'
  );
  const [submittingIncident, setSubmittingIncident] = useState(false);

  if (!activeBooking) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-lg text-center">
        <p className="text-sm text-slate-600">No bookings available. Submit a booking from the Explore Marketplace first.</p>
      </div>
    );
  }

  const getStageIndex = (status: BookingRecord['status']) => {
    switch (status) {
      case 'PENDING':
      case 'WAITLISTED':
        return 1;
      case 'APPROVED':
        return 2;
      case 'ACTIVE_IN_USE':
        return 3;
      case 'COMPLETED':
      case 'FLAGGED_FOR_REVIEW':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(activeBooking.status);

  const beforePhotoUrl =
    activeBooking.checkInLog?.photoDataUrl ||
    getConditionPhotoDataUrl('BEFORE_MINT', activeBooking.resourceSerial, '2026-10-29 09:00 UTC');

  const afterPhotoUrl =
    activeBooking.checkOutLog?.photoDataUrl ||
    getConditionPhotoDataUrl(
      checkOutCondition === 'DAMAGE_OCCURRED' ? 'AFTER_ANOMALY' : 'AFTER_CLEAN',
      activeBooking.resourceSerial,
      '2026-10-29 10:55 UTC'
    );

  const allChecklistChecked = resource.preFlightChecklist.every((_, idx) => checkedItems[idx] !== false);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteCheckIn(activeBooking.id, {
      qrVerified: qrScanned,
      checklistCompleted: resource.preFlightChecklist.map((item, idx) => ({
        item,
        checked: Boolean(checkedItems[idx] !== false),
      })),
      conditionRating: checkInCondition,
      notes: checkInNotes,
      photoDataUrl: beforePhotoUrl,
    });
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteCheckOut(activeBooking.id, {
      conditionRating: checkOutCondition,
      notes: checkOutNotes,
      photoDataUrl: afterPhotoUrl,
    });
  };

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingIncident(true);
    try {
      await onReportIncident({
        bookingId: activeBooking.id,
        resourceId: activeBooking.resourceId,
        severity: incidentSeverity,
        description: incidentDescription,
      });
      setShowIncidentForm(false);
    } finally {
      setSubmittingIncident(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Booking Selector & Explainability Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono text-slate-500">
              STEP 7, 8 & 9 · PHYSICAL CHAIN-OF-CUSTODY & INCIDENT ENGINE
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Active Session & Photo Condition Verification Hub
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Select Booking Session:
            </label>
            <select
              value={activeBooking.id}
              onChange={(e) => onSelectBooking(e.target.value)}
              className="px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.status}] {b.resourceSerial} · {b.userName} ({b.dateLabel} {b.startHour}:00)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step-by-Step Lifecycle Tracker */}
        <div className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/70 text-slate-900 font-semibold'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px]">{stage.label}</span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Explainability Banner (Step 6 requirement) */}
        {activeBooking.decisionReason && (
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-semibold text-slate-900">
                Explainable Allocation Record ({activeBooking.priorityBreakdown.totalScore} / 100 pts):
              </span>{' '}
              <span className="text-slate-700">{activeBooking.decisionReason}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
              {activeBooking.priorityBreakdown.explanation}
            </span>
          </div>
        )}
      </div>

      {/* Main Split: Left = Check-In (Step 7), Right = Check-Out & Visual Diff Slider (Step 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Step 7: Check-In & Baseline Condition Log */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-600 font-semibold">STEP 7 WORKFLOW</span>
                <h3 className="text-base font-bold text-slate-900">
                  QR Check-In & Baseline Pre-Flight Verification
                </h3>
              </div>
              <span className="text-xs font-mono font-medium text-slate-600">
                {activeBooking.checkInLog ? 'CHECKED IN' : 'READY FOR CHECK-IN'}
              </span>
            </div>

            {/* 1. Simulate QR Scan */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Physical Asset Tag: <span className="font-mono">{activeBooking.resourceSerial}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {qrScanned
                      ? 'Cryptographic QR challenge-response verified at terminal'
                      : 'Scan machine interlock QR code to unlock check-in'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrScanned(true)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-md text-slate-800 whitespace-nowrap shrink-0"
              >
                {qrScanned ? 'QR Verified ✓' : 'Simulate QR Scan'}
              </button>
            </div>

            {/* 2. 3-Item Safety Pre-Flight Checklist */}
            <div>
              <div className="text-xs font-semibold text-slate-900 mb-2">
                Mandatory 3-Item Safety Pre-Flight Checklist
              </div>
              <div className="space-y-2">
                {resource.preFlightChecklist.map((item, idx) => (
                  <label
                    key={item}
                    className="flex items-start gap-2.5 p-2.5 rounded-md border border-slate-200 bg-slate-50/40 text-xs text-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems[idx] !== false}
                      onChange={(e) =>
                        setCheckedItems((prev) => ({ ...prev, [idx]: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-slate-300 text-indigo-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Baseline Condition Rating & Photo Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Baseline Physical Condition
                </label>
                <select
                  value={checkInCondition}
                  onChange={(e) => setCheckInCondition(e.target.value as ConditionRating)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                >
                  <option value="MINT">Mint · Calibrated & Clean</option>
                  <option value="MINOR_WEAR">Minor Cosmetic Wear (Safe)</option>
                  <option value="PRE_EXISTING_ISSUE">Pre-existing Issue (Documented)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Check-In Condition Log Note
                </label>
                <input
                  type="text"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950">
              <img
                src={beforePhotoUrl}
                alt="Before Use Baseline Inspection"
                referrerPolicy="no-referrer"
                className="w-full h-40 object-cover"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              {activeBooking.checkInLog
                ? `Logged at ${activeBooking.checkInLog.timestamp}`
                : 'Unlocks machine interlock power relay'}
            </span>
            <button
              type="button"
              onClick={handleCheckInSubmit}
              disabled={!allChecklistChecked || activeBooking.status === 'ACTIVE_IN_USE' || activeBooking.status === 'COMPLETED'}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>
                {activeBooking.status === 'ACTIVE_IN_USE' || activeBooking.status === 'COMPLETED'
                  ? 'Baseline Check-In Recorded'
                  : 'Complete Photo Check-In'}
              </span>
            </button>
          </div>
        </div>

        {/* Step 8: Guided Check-Out & Visual Condition Diff Slider */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-700 font-semibold">STEP 8 WORKFLOW</span>
                <h3 className="text-base font-bold text-slate-900">
                  Check-Out Return & Before/After Condition Diff
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="tabular-nums">01:42:18 REMAINING</span>
              </div>
            </div>

            {/* Visual Condition Diff Mode Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Visual Chain-of-Custody Comparison
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDiffMode('SIDE_BY_SIDE')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                    diffMode === 'SIDE_BY_SIDE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiffMode('SLIDER')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                    diffMode === 'SLIDER'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Interactive Diff Slider</span>
                </button>
              </div>
            </div>

            {diffMode === 'SIDE_BY_SIDE' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950">
                  <div className="px-2.5 py-1 bg-slate-900 text-[11px] font-mono text-slate-300 border-b border-slate-800">
                    BEFORE CHECK-IN BASELINE
                  </div>
                  <img
                    src={beforePhotoUrl}
                    alt="Before Check-In"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950">
                  <div className="px-2.5 py-1 bg-slate-900 text-[11px] font-mono text-emerald-400 border-b border-slate-800">
                    AFTER CHECK-OUT RETURN
                  </div>
                  <img
                    src={afterPhotoUrl}
                    alt="After Check-Out"
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 h-44 select-none">
                  <img
                    src={afterPhotoUrl}
                    alt="After Use Condition"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-indigo-400"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={beforePhotoUrl}
                      alt="Before Use Condition"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                  <span>BEFORE</span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span>AFTER</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Return State Declaration
                </label>
                <select
                  value={checkOutCondition}
                  onChange={(e) => setCheckOutCondition(e.target.value as ConditionRating)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                >
                  <option value="MINT">Returned Clean & Operational</option>
                  <option value="CONSUMABLES_LOW">Consumables Low (Resin / Filament / Wipe)</option>
                  <option value="DAMAGE_OCCURRED">Issue / Damage Occurred (Flags Review)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Check-Out Handover Note
                </label>
                <input
                  type="text"
                  value={checkOutNotes}
                  onChange={(e) => setCheckOutNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              {activeBooking.checkOutLog
                ? `Completed at ${activeBooking.checkOutLog.timestamp}`
                : 'Appends immutable hash to Audit Ledger'}
            </span>
            <button
              type="button"
              onClick={handleCheckOutSubmit}
              disabled={activeBooking.status === 'COMPLETED'}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>
                {activeBooking.status === 'COMPLETED'
                  ? 'Return Verified & Completed'
                  : 'Verify & Complete Return'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Step 9: Delay, Damage & Conflict Resolution Engine */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-amber-700 font-semibold">
              STEP 9 · DELAY, DAMAGE & AUTOMATIC LOCKOUT ENGINE
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Running Late Extension Check & Safety Incident Lockout
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onRequestExtension(activeBooking.id, 30)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Request +30m Extension</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIncidentForm(!showIncidentForm)}
              className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report Issue / Trigger Safety Lockout</span>
            </button>
          </div>
        </div>

        {activeBooking.extensionRequestedMinutes && (
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Extension Check (+{activeBooking.extensionRequestedMinutes} min):</strong>{' '}
                {activeBooking.extensionConflictDetected
                  ? 'Downstream slot contention detected! Alert dispatched to Lab Manager (Dr. Thorne) and next queued researcher.'
                  : 'No downstream booking conflict found. +30m extension granted and logged to immutable ledger.'}
              </span>
            </div>
            <span className="font-mono font-semibold">
              {activeBooking.extensionConflictDetected ? 'CONFLICT ALERTED' : 'EXTENDED +30M'}
            </span>
          </div>
        )}

        {showIncidentForm && (
          <form onSubmit={handleIncidentSubmit} className="p-4 rounded-lg border border-red-200 bg-red-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Structured Equipment Damage & Safety Incident Report</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                <Sparkles className="w-3 h-3" />
                <span>AI Pre-Screened • Requires Authorised Manager Sign-off</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Severity Classification
                </label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as IncidentSeverity)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                >
                  <option value="UNSAFE_OUT_OF_COMMISSION">
                    Unsafe / Out of Commission (Auto-Locks Resource)
                  </option>
                  <option value="CALIBRATION_NEEDED">Calibration Needed (Advisory Flag)</option>
                  <option value="MINOR_COSMETIC">Minor Cosmetic Wear</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physical Symptom & Fault Observation
                </label>
                <input
                  type="text"
                  required
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-600">
                Selecting <strong>Unsafe / Out of Commission</strong> immediately pauses all future bookings on{' '}
                <span className="font-mono font-medium">{activeBooking.resourceSerial}</span> until Dr. Thorne clears the lock.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIncident}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingIncident
                    ? 'Generating AI Triage & Locking...'
                    : 'Submit Incident & Execute Safety Lockout'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
