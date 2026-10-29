import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Upload,
  FileCheck2,
  ShieldAlert,
  Calendar,
  Clock,
  Sliders,
  X,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  BookingPurpose,
  BookingRecord,
  CredentialBadge,
  ResourceItem,
  UserPersona,
  VerificationReport,
} from '../types/labgrid';
import { calculatePriorityScore } from '../data/seedData';
import { getEquipmentSchematicUrl } from '../utils/inspectionArtwork';

interface ResourceDetailDrawerProps {
  resource: ResourceItem | null;
  currentUser: UserPersona;
  userCredentials: CredentialBadge[];
  existingBookings: BookingRecord[];
  onClose: () => void;
  onUploadAndPreVerifyBadge: (badgeCode: string, badgeTitle: string, fileName: string, certNotes: string) => Promise<void>;
  onSubmitBooking: (payload: {
    resource: ResourceItem;
    dateLabel: string;
    startHour: number;
    durationHours: number;
    isPeakWindow: boolean;
    purpose: BookingPurpose;
    projectDescription: string;
    verificationReport: VerificationReport;
  }) => void;
}

const TIME_SLOTS = [
  { startHour: 10, label: '10:00 – 12:00', isPeak: false, demandLabel: 'Off-Peak · Low Demand' },
  { startHour: 12, label: '12:00 – 14:00', isPeak: true, demandLabel: 'Peak Window · Moderate' },
  { startHour: 14, label: '14:00 – 16:00', isPeak: true, demandLabel: 'Peak Window · High Demand' },
  { startHour: 16, label: '16:00 – 18:00', isPeak: true, demandLabel: 'Peak Window · Moderate' },
];

export const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({
  resource,
  currentUser,
  userCredentials,
  existingBookings,
  onClose,
  onUploadAndPreVerifyBadge,
  onSubmitBooking,
}) => {
  const [selectedDate, setSelectedDate] = useState('Thu, Oct 29 (Today)');
  const [selectedSlotHour, setSelectedSlotHour] = useState(14);
  const [purpose, setPurpose] = useState<BookingPurpose>('Capstone Project');
  const [projectDescription, setProjectDescription] = useState(
    'Precision fabrication of structural test assembly for departmental milestone.'
  );
  const [sopAcknowledged, setSopAcknowledged] = useState(true);
  const [uploadingBadgeCode, setUploadingBadgeCode] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState('EHS_Signed_Training_Completion_2026.pdf');
  const [certNotes, setCertNotes] = useState(
    'Completed practical interlock test and emergency shutoff evaluation under EH&S supervision.'
  );
  const [isPreVerifying, setIsPreVerifying] = useState(false);

  if (!resource) return null;

  const selectedSlot = TIME_SLOTS.find((s) => s.startHour === selectedSlotHour) || TIME_SLOTS[2];
  const durationHours = resource.hourlySlotSize;

  // Evaluate each required badge for the logged-in user
  const badgeEvaluations = resource.requiredBadges.map((req) => {
    const match = userCredentials.find(
      (c) => c.userId === currentUser.id && c.badgeCode === req.code
    );
    return {
      ...req,
      status: match ? match.status : 'MISSING',
      credential: match,
    };
  });

  const allBadgesVerified = badgeEvaluations.every((b) => b.status === 'VERIFIED');
  const hasPendingPreScreenedBadge = badgeEvaluations.some((b) => b.status === 'PENDING');
  const missingBadgeLabels = badgeEvaluations
    .filter((b) => b.status !== 'VERIFIED')
    .map((b) =>
      b.status === 'PENDING'
        ? `${b.code} (AI Pre-Screened · Awaits Manager Sign-Off)`
        : `${b.code} (${b.label})`
    );

  // Check rolling 7-day quota cap
  const projectedWeeklyHours = currentUser.weeklyQuotaUsed + durationHours;
  const quotaCheckPassed =
    projectedWeeklyHours <= currentUser.weeklyQuotaCap &&
    durationHours <= resource.maxHrsPerWeek;

  // Check slot conflict
  const conflictingBooking = existingBookings.find(
    (b) =>
      b.resourceId === resource.id &&
      b.dateLabel === selectedDate &&
      b.startHour === selectedSlotHour &&
      b.status !== 'REJECTED' &&
      b.status !== 'COMPLETED'
  );

  // Calculate live Explainable Priority Score
  const priorityBreakdown = calculatePriorityScore(
    currentUser.weeklyQuotaUsed,
    purpose,
    currentUser.reliabilityScore
  );

  const handleCertSubmit = async (badgeCode: string, badgeLabel: string) => {
    setIsPreVerifying(true);
    try {
      await onUploadAndPreVerifyBadge(badgeCode, badgeLabel, certFileName, certNotes);
      setUploadingBadgeCode(null);
    } finally {
      setIsPreVerifying(false);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pendingCred = badgeEvaluations.find((b) => b.credential?.aiConfidenceScore)?.credential;

    const verificationReport: VerificationReport = {
      badgeMatchPassed: allBadgesVerified,
      missingBadges: missingBadgeLabels,
      quotaCheckPassed,
      projectedWeeklyHours,
      maxAllowedWeeklyHours: currentUser.weeklyQuotaCap,
      conflictCheckPassed: !conflictingBooking,
      conflictingBookingId: conflictingBooking?.id,
      aiDocumentPreCheck: pendingCred
        ? {
            scanned: true,
            extractedHolder: currentUser.name,
            extractedBadge: `${pendingCred.badgeCode} (${pendingCred.title})`,
            extractedDate: pendingCred.issuedAt,
            confidence: pendingCred.aiConfidenceScore || 96,
            requiresHumanSignoff: true,
            summary:
              pendingCred.aiExtractedSummary ||
              `AI Pre-Screened certificate for ${currentUser.name}. Awaits Manager human sign-off.`,
          }
        : undefined,
    };

    onSubmitBooking({
      resource,
      dateLabel: selectedDate,
      startHour: selectedSlotHour,
      durationHours,
      isPeakWindow: selectedSlot.isPeak,
      purpose,
      projectDescription,
      verificationReport,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto border-l border-slate-200 flex flex-col justify-between">
        <div>
          {/* Sticky Drawer Header */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>{resource.serialId}</span>
                <span aria-hidden="true">·</span>
                <span>{resource.category}</span>
                <span aria-hidden="true">·</span>
                <span>{resource.location}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{resource.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close resource drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Technical CAD Schematic & Specs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-6 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex flex-col justify-between">
                <img
                  src={getEquipmentSchematicUrl(resource.visualType)}
                  alt={resource.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
                <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>VALUE: ${resource.replacementValueUsd.toLocaleString()}</span>
                  <span>CAP: {resource.maxHrsPerWeek}H/WK</span>
                </div>
              </div>

              <div className="md:col-span-6 border border-slate-200 rounded-lg p-4 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 mb-2">
                    Technical Specifications & Access Policy
                  </div>
                  <dl className="space-y-1.5 text-xs">
                    {resource.specifications.map((spec) => (
                      <div key={spec.label} className="flex items-center justify-between py-1 border-b border-slate-200/70">
                        <dt className="text-slate-500">{spec.label}</dt>
                        <dd className="font-mono font-medium text-slate-900">{spec.value}</dd>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-1">
                      <dt className="text-slate-500">Supervision Gate</dt>
                      <dd className="font-medium text-slate-900">
                        {resource.supervisionMode === 'AUTONOMOUS'
                          ? 'Autonomous Access'
                          : resource.supervisionMode === 'STAFF_SUPERVISION'
                          ? 'Staff Supervision Required'
                          : 'Manager Approval Mandatory'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Safety SOP:</strong> {resource.safetySopSummary}
                </div>
              </div>
            </div>

            {/* Step 2 & 4: Live Eligibility Readiness Scorecard */}
            <section className="border border-slate-200 rounded-lg p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Step 2 & 4. Pre-Booking Eligibility Readiness Scorecard
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deterministic 4-point compliance check for active user{' '}
                    <span className="font-medium text-slate-800">{currentUser.name}</span>
                  </p>
                </div>
                <span className="text-xs font-mono font-medium text-slate-700">
                  {allBadgesVerified && quotaCheckPassed
                    ? '4/4 GATES READY'
                    : hasPendingPreScreenedBadge
                    ? 'AI PRE-SCREENED · AWAITS SIGN-OFF'
                    : 'ACTION REQUIRED'}
                </span>
              </div>

              <div className="space-y-2.5">
                {badgeEvaluations.map((badge) => (
                  <div
                    key={badge.code}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-start gap-2.5">
                      {badge.status === 'VERIFIED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                          <span className="font-mono">{badge.code}</span>
                          <span>·</span>
                          <span>{badge.label}</span>
                        </div>
                        {badge.status === 'VERIFIED' && badge.credential && (
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Verified by {badge.credential.verifiedBy} · Valid thru {badge.credential.expiresAt}
                          </p>
                        )}
                        {badge.status === 'PENDING' && badge.credential && (
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-amber-800">
                              {badge.credential.aiExtractedSummary}
                            </p>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              <Sparkles className="w-3 h-3" />
                              <span>
                                AI Pre-Screened ({badge.credential.aiConfidenceScore}% Conf) • Requires Authorised Manager Sign-off
                              </span>
                            </div>
                          </div>
                        )}
                        {badge.status === 'MISSING' && (
                          <p className="text-xs text-amber-700 mt-0.5">
                            Missing required safety credential. Upload training certificate for AI pre-verification.
                          </p>
                        )}
                      </div>
                    </div>

                    {badge.status !== 'VERIFIED' && (
                      <button
                        type="button"
                        onClick={() =>
                          setUploadingBadgeCode(uploadingBadgeCode === badge.code ? null : badge.code)
                        }
                        className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{badge.status === 'PENDING' ? 'Re-Upload Cert' : 'Upload Safety Cert'}</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* Inline AI Certificate Upload & Pre-Verifier Box */}
                {uploadingBadgeCode && (
                  <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-indigo-600" />
                        <span>
                          AI Certificate Pre-Verifier for <span className="font-mono">{uploadingBadgeCode}</span>
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">
                        AI Pre-Screened • Requires Authorised Manager Sign-off
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Certificate File / Document ID
                        </label>
                        <input
                          type="text"
                          value={certFileName}
                          onChange={(e) => setCertFileName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Training Issuer & Practical Sign-Off Notes
                        </label>
                        <input
                          type="text"
                          value={certNotes}
                          onChange={(e) => setCertNotes(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadingBadgeCode(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isPreVerifying}
                        onClick={() => {
                          const target = badgeEvaluations.find((b) => b.code === uploadingBadgeCode);
                          if (target) {
                            handleCertSubmit(target.code, target.label);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                      >
                        {isPreVerifying ? 'Running Gemini Vision Pre-Check...' : 'Run AI Pre-Verification'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Gate 2: Rolling Quota Check */}
                <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900">Fair-Use Weekly Quota Gate:</span>{' '}
                      <span className="text-slate-600">
                        Current usage {currentUser.weeklyQuotaUsed}h + {durationHours}h request ={' '}
                        <strong className="font-mono text-slate-900">{projectedWeeklyHours}h</strong> /{' '}
                        {currentUser.weeklyQuotaCap}h weekly cap
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-700 font-medium">WITHIN QUOTA</span>
                </div>

                {/* Gate 3: Conflict & Competing Demand Check */}
                <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    {conflictingBooking ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900">Slot Contention Check:</span>{' '}
                      <span className="text-slate-600">
                        {conflictingBooking
                          ? `Competing request on ${selectedSlot.label} by ${conflictingBooking.userName} (${conflictingBooking.priorityBreakdown.totalScore} pts). Fair-Allocation Engine will rank by score.`
                          : `Zero competing requests for ${selectedDate} at ${selectedSlot.label}.`}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-medium text-slate-700">
                    {conflictingBooking ? 'PRIORITY QUEUE' : 'CLEAR SLOT'}
                  </span>
                </div>
              </div>
            </section>

            {/* Step 3: Booking Request & Purpose Declaration Form */}
            <form id="booking-request-form" onSubmit={handleBookingSubmit} className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Step 3. Slot Selection & Purpose Declaration
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  SLOT SIZE: {resource.hourlySlotSize} HOURS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Reservation Date
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      <option value="Thu, Oct 29 (Today)">Thu, Oct 29 (Today)</option>
                      <option value="Fri, Oct 30">Fri, Oct 30</option>
                      <option value="Mon, Nov 02">Mon, Nov 02</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Declared Purpose of Use (Affects Priority Weight)
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as BookingPurpose)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    <option value="Capstone Project">Capstone Project (+20 Fair Priority Weight)</option>
                    <option value="Academic Research">Academic Research (+20 Fair Priority Weight)</option>
                    <option value="Safety-Critical Testing">Safety-Critical Testing (+20 Fair Priority Weight)</option>
                    <option value="Personal Prototype">Personal Prototype (+5 Fair Priority Weight)</option>
                  </select>
                </div>
              </div>

              {/* Interactive Time Slot Grid */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Select Time Window (Demand-Aware)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = slot.startHour === selectedSlotHour;
                    return (
                      <button
                        key={slot.startHour}
                        type="button"
                        onClick={() => setSelectedSlotHour(slot.startHour)}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-semibold">{slot.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{slot.demandLabel}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Technical Project Description & Material Spec
                </label>
                <textarea
                  rows={2}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  placeholder="Specify materials, tolerances, and academic milestone..."
                />
              </div>

              {/* Explainable Fair Allocation Score Calculator Card */}
              <div className="p-4 rounded-lg bg-slate-900 text-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Live Explainable Fair-Allocation Score</span>
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {priorityBreakdown.totalScore} / 100 PTS
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-slate-800/90">
                    <div className="text-[10px] text-slate-400">BASE FAIRNESS</div>
                    <div className="font-semibold text-white mt-0.5">+50</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/90">
                    <div className="text-[10px] text-slate-400">RECENT USE ({priorityBreakdown.recentUsageHours}H)</div>
                    <div className="font-semibold text-amber-400 mt-0.5">−{priorityBreakdown.recentUsagePenalty}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/90">
                    <div className="text-[10px] text-slate-400">PURPOSE WEIGHT</div>
                    <div className="font-semibold text-emerald-400 mt-0.5">+{priorityBreakdown.purposeWeight}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/90">
                    <div className="text-[10px] text-slate-400">TRUST ({currentUser.reliabilityScore}%)</div>
                    <div className="font-semibold text-sky-400 mt-0.5">+{priorityBreakdown.reliabilityBonus}</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-mono pt-1">
                  Formula: {priorityBreakdown.explanation}
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sopAcknowledged}
                  onChange={(e) => setSopAcknowledged(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I commit to completing the mandatory Before/After photo condition log and safety pre-flight checklist.
                </span>
              </label>
            </form>
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            {resource.status === 'MAINTENANCE_LOCKED' ? (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Resource Locked for Safety Triage
              </span>
            ) : allBadgesVerified && resource.supervisionMode === 'AUTONOMOUS' && !conflictingBooking ? (
              <span>Eligible for instant autonomous verification</span>
            ) : (
              <span>Routes to Manager Triage Queue with Fair-Allocation Score</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="booking-request-form"
              disabled={!sopAcknowledged || resource.status === 'MAINTENANCE_LOCKED'}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Submit Verified Booking Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
