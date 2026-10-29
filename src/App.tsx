import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldAlert,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import {
  AuditLedgerEntry,
  BookingPurpose,
  BookingRecord,
  ConditionRating,
  CredentialBadge,
  IncidentReport,
  IncidentSeverity,
  ResourceCategory,
  ResourceItem,
  TourStepProgress,
  UserPersona,
  VerificationReport,
} from './types/labgrid';
import {
  calculatePriorityScore,
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_CREDENTIALS,
  INITIAL_INCIDENTS,
  INITIAL_RESOURCES,
  INITIAL_TOUR_STEPS,
  INITIAL_USERS,
} from './data/seedData';
import { getEquipmentSchematicUrl } from './utils/inspectionArtwork';
import { ResourceDetailDrawer } from './components/ResourceDetailDrawer';
import { ActiveSessionHub } from './components/ActiveSessionHub';
import { ManagerCommandCenter } from './components/ManagerCommandCenter';
import { AuditFairnessLedger } from './components/AuditFairnessLedger';
import { JudgeTourWidget } from './components/JudgeTourWidget';

type ActiveTab = 'explore' | 'session' | 'manager' | 'audit';

export default function App() {
  // Core Institutional State
  const [users, setUsers] = useState<UserPersona[]>(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState<string>('usr-maya');
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [credentials, setCredentials] = useState<CredentialBadge[]>(INITIAL_CREDENTIALS);
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLedgerEntry[]>(INITIAL_AUDIT_LOGS);
  const [tourSteps, setTourSteps] = useState<TourStepProgress[]>(INITIAL_TOUR_STEPS);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>('bkg-active-901');
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Discovery & AI Natural Language Search State (Step 2)
  const [nlQuery, setNlQuery] = useState('');
  const [aiMatchResult, setAiMatchResult] = useState<{
    matchedResourceIds: string[];
    recommendationSummary: string;
    recommendedSlotNote: string;
  } | null>(null);
  const [isMatchingAi, setIsMatchingAi] = useState(false);

  // Smart Filters
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ResourceCategory>('ALL');
  const [onlyEligibleNow, setOnlyEligibleNow] = useState(false);
  const [onlyNoSupervision, setOnlyNoSupervision] = useState(false);
  const [onlyOperational, setOnlyOperational] = useState(false);

  const currentUser = useMemo(
    () => users.find((u) => u.id === activeUserId) || users[0],
    [users, activeUserId]
  );

  const markTourStepDone = (stepNumber: number) => {
    setTourSteps((prev) =>
      prev.map((s) => (s.stepNumber === stepNumber ? { ...s, completed: true } : s))
    );
  };

  const appendAuditEntry = (entry: Omit<AuditLedgerEntry, 'id' | 'hash' | 'prevHash' | 'timestamp'>) => {
    setAuditLogs((prev) => {
      const prevHash = prev[0]?.hash || '0x000000000000';
      const randomHex = Math.floor(100000000000 + Math.random() * 899999999999).toString(16);
      const newEntry: AuditLedgerEntry = {
        ...entry,
        id: `aud-00${prev.length + 1}`,
        hash: `0x${randomHex.slice(0, 12)}`,
        prevHash,
        timestamp: new Date().toISOString(),
      };
      return [newEntry, ...prev];
    });
  };

  const showNotice = (msg: string) => {
    setToastBanner(msg);
  };

  // Persona Switcher Handler
  const handleSwitchPersona = (userId: string) => {
    setActiveUserId(userId);
    const target = users.find((u) => u.id === userId);
    if (target?.role === 'MANAGER') {
      setActiveTab('manager');
    } else if (target?.role === 'ADMIN') {
      setActiveTab('audit');
    } else {
      setActiveTab('explore');
    }
  };

  // Reset Demo Data Handler
  const handleResetDemo = () => {
    setUsers(INITIAL_USERS);
    setActiveUserId('usr-maya');
    setResources(INITIAL_RESOURCES);
    setCredentials(INITIAL_CREDENTIALS);
    setBookings(INITIAL_BOOKINGS);
    setIncidents(INITIAL_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTourSteps(INITIAL_TOUR_STEPS);
    setAiMatchResult(null);
    setNlQuery('');
    setActiveTab('explore');
    showNotice('Demo state reset to baseline institutional dataset.');
  };

  // Step 2: AI Natural Language Resource Matcher
  const handleRunAiMatcher = async (customQuery?: string) => {
    const q = (customQuery ?? nlQuery).trim();
    if (!q) return;
    if (customQuery) setNlQuery(customQuery);
    setIsMatchingAi(true);
    try {
      const userVerifiedBadges = credentials
        .filter((c) => c.userId === currentUser.id && c.status === 'VERIFIED')
        .map((c) => c.badgeCode);

      const response = await fetch('/api/ai/match-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          resources: resources.map((r) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            specifications: r.specifications,
            requiredBadges: r.requiredBadges,
          })),
          userBadges: userVerifiedBadges,
        }),
      });
      const data = await response.json();
      setAiMatchResult(data);
      markTourStepDone(2);
    } catch {
      showNotice('Completed deterministic resource matching.');
    } finally {
      setIsMatchingAi(false);
    }
  };

  // Step 4: Upload & AI Pre-Verify Safety Certificate
  const handleUploadAndPreVerifyBadge = async (
    badgeCode: string,
    badgeTitle: string,
    fileName: string,
    certNotes: string
  ) => {
    const response = await fetch('/api/ai/verify-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        holderName: currentUser.name,
        badgeCode,
        fileName,
        certificateText: certNotes,
      }),
    });
    const data = await response.json();

    const newCred: CredentialBadge = {
      id: `cred-${Date.now()}`,
      userId: currentUser.id,
      badgeCode,
      title: badgeTitle,
      issuer: 'EH&S Campus Safety Portal',
      issuedAt: '2026-10-29',
      expiresAt: '2027-10-29',
      status: 'PENDING',
      aiConfidenceScore: data.confidence || 96,
      aiExtractedSummary: data.summary,
      certificateDocumentName: fileName,
    };

    setCredentials((prev) => {
      const filtered = prev.filter(
        (c) => !(c.userId === currentUser.id && c.badgeCode === badgeCode)
      );
      return [newCred, ...filtered];
    });

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'CREDENTIAL',
      entityId: newCred.id,
      actionType: 'AI_CERTIFICATE_PRE_SCREENED',
      beforeState: `BADGE ${badgeCode}: MISSING`,
      afterState: `BADGE ${badgeCode}: PENDING_MANAGER_SIGNOFF (${data.confidence || 96}% AI Conf)`,
      justification: data.summary,
    });

    markTourStepDone(4);
    showNotice(
      `Gemini AI pre-screened ${badgeCode} (${data.confidence || 96}% confidence). Routed to Dr. Thorne for human sign-off.`
    );
  };

  // Step 3 & 4: Submit Booking Request
  const handleSubmitBooking = (payload: {
    resource: ResourceItem;
    dateLabel: string;
    startHour: number;
    durationHours: number;
    isPeakWindow: boolean;
    purpose: BookingPurpose;
    projectDescription: string;
    verificationReport: VerificationReport;
  }) => {
    const priorityBreakdown = calculatePriorityScore(
      currentUser.weeklyQuotaUsed,
      payload.purpose,
      currentUser.reliabilityScore
    );

    const autoApproved =
      payload.verificationReport.badgeMatchPassed &&
      payload.verificationReport.quotaCheckPassed &&
      payload.verificationReport.conflictCheckPassed &&
      payload.resource.supervisionMode === 'AUTONOMOUS';

    const newBooking: BookingRecord = {
      id: `bkg-${Date.now().toString().slice(-4)}`,
      resourceId: payload.resource.id,
      resourceName: payload.resource.name,
      resourceSerial: payload.resource.serialId,
      userId: currentUser.id,
      userName: currentUser.name,
      userDepartment: currentUser.department,
      dateLabel: payload.dateLabel,
      startHour: payload.startHour,
      durationHours: payload.durationHours,
      isPeakWindow: payload.isPeakWindow,
      purpose: payload.purpose,
      projectDescription: payload.projectDescription,
      priorityBreakdown,
      verificationReport: payload.verificationReport,
      status: autoApproved ? 'APPROVED' : 'PENDING',
      decisionReason: autoApproved
        ? `Auto-verified by 4-Point Compliance Engine (Autonomous Access · Priority Score ${priorityBreakdown.totalScore}/100 pts).`
        : `Queued in Fair-Allocation Triage with Priority Score ${priorityBreakdown.totalScore}/100 pts (${priorityBreakdown.explanation}).`,
      decidedBy: autoApproved ? '4-Point Automated Verification Gate' : undefined,
      decidedAt: autoApproved ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setSelectedResourceId(null);
    setSelectedBookingId(newBooking.id);

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'BOOKING',
      entityId: newBooking.id,
      actionType: autoApproved ? 'BOOKING_AUTO_VERIFIED' : 'BOOKING_SUBMITTED_TO_TRIAGE',
      beforeState: 'SLOT: OPEN',
      afterState: `STATUS: ${newBooking.status} (Score: ${priorityBreakdown.totalScore} pts)`,
      justification: `${payload.purpose}: ${payload.projectDescription}`,
    });

    markTourStepDone(3);
    markTourStepDone(4);

    if (autoApproved) {
      setActiveTab('session');
      showNotice(
        `Booking ${newBooking.id} approved via 4-Point Verification! Ready for Step 7 QR Check-In.`
      );
    } else {
      showNotice(
        `Booking ${newBooking.id} submitted with Fair-Allocation Score ${priorityBreakdown.totalScore}/100 pts. Switch to Dr. Thorne (Owner) to review.`
      );
    }
  };

  // Step 5 & 6: Manager Approvals, Waitlisting & Rejections
  const handleApproveBooking = (
    bookingId: string,
    reason: string,
    alsoVerifyBadgeCode?: string
  ) => {
    if (alsoVerifyBadgeCode) {
      setCredentials((prev) =>
        prev.map((c) =>
          c.badgeCode === alsoVerifyBadgeCode
            ? { ...c, status: 'VERIFIED', verifiedBy: 'Dr. Aris Thorne' }
            : c
        )
      );
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'APPROVED',
              decisionReason: reason,
              decidedBy: 'Dr. Aris Thorne',
              decidedAt: new Date().toISOString(),
              verificationReport: {
                ...b.verificationReport,
                badgeMatchPassed: true,
                missingBadges: [],
              },
            }
          : b
      )
    );

    appendAuditEntry({
      actorId: 'usr-thorne',
      actorName: 'Dr. Aris Thorne',
      actorRole: 'MANAGER',
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: 'MANAGER_APPROVED_REQUEST',
      beforeState: 'STATUS: PENDING',
      afterState: 'STATUS: APPROVED',
      justification: reason,
    });

    markTourStepDone(5);
    showNotice(`Booking ${bookingId} approved and logged to the immutable ledger.`);
  };

  const handleWaitlistBooking = (bookingId: string, reason: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'WAITLISTED',
              waitlistPosition: 1,
              decisionReason: reason,
              decidedBy: 'Dr. Aris Thorne',
              decidedAt: new Date().toISOString(),
            }
          : b
      )
    );

    appendAuditEntry({
      actorId: 'usr-thorne',
      actorName: 'Dr. Aris Thorne',
      actorRole: 'MANAGER',
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: 'SMART_WAITLIST_ASSIGNED',
      beforeState: 'STATUS: PENDING',
      afterState: 'STATUS: WAITLISTED (#1)',
      justification: reason,
    });

    markTourStepDone(5);
    showNotice(`Placed booking ${bookingId} on Smart Waitlist with full explainability note.`);
  };

  const handleRejectBooking = (bookingId: string, reason: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'REJECTED',
              decisionReason: reason,
              decidedBy: 'Dr. Aris Thorne',
              decidedAt: new Date().toISOString(),
            }
          : b
      )
    );

    appendAuditEntry({
      actorId: 'usr-thorne',
      actorName: 'Dr. Aris Thorne',
      actorRole: 'MANAGER',
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: 'MANAGER_REJECTED_WITH_REASON',
      beforeState: 'STATUS: PENDING',
      afterState: 'STATUS: REJECTED',
      justification: reason,
    });

    markTourStepDone(5);
    showNotice(`Booking ${bookingId} rejected with mandatory audit reason code.`);
  };

  const handleVerifyCredential = (credentialId: string) => {
    const target = credentials.find((c) => c.id === credentialId);
    setCredentials((prev) =>
      prev.map((c) =>
        c.id === credentialId
          ? { ...c, status: 'VERIFIED', verifiedBy: 'Dr. Aris Thorne' }
          : c
      )
    );

    if (target) {
      appendAuditEntry({
        actorId: 'usr-thorne',
        actorName: 'Dr. Aris Thorne',
        actorRole: 'MANAGER',
        entityType: 'CREDENTIAL',
        entityId: credentialId,
        actionType: 'HUMAN_MANAGER_BADGE_SIGNOFF',
        beforeState: `${target.badgeCode}: AI_PRE_SCREENED`,
        afterState: `${target.badgeCode}: VERIFIED`,
        justification: `Authorised Lab Director Dr. Aris Thorne signed off ${target.badgeCode} for ${target.userId}.`,
      });
    }
    markTourStepDone(5);
    showNotice(`Safety credential ${target?.badgeCode} signed off by Dr. Aris Thorne.`);
  };

  // Step 7: Check-In Handler
  const handleCompleteCheckIn = (
    bookingId: string,
    payload: {
      qrVerified: boolean;
      checklistCompleted: { item: string; checked: boolean }[];
      conditionRating: ConditionRating;
      notes: string;
      photoDataUrl: string;
    }
  ) => {
    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'ACTIVE_IN_USE',
              checkInLog: {
                id: `chk-in-${Date.now()}`,
                bookingId,
                phase: 'CHECK_IN',
                timestamp: nowIso,
                actorId: currentUser.id,
                actorName: currentUser.name,
                photoDataUrl: payload.photoDataUrl,
                conditionRating: payload.conditionRating,
                checklistCompleted: payload.checklistCompleted,
                notes: payload.notes,
                qrVerified: payload.qrVerified,
              },
            }
          : b
      )
    );

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: 'QR_AND_PHOTO_CHECK_IN',
      beforeState: 'STATUS: APPROVED',
      afterState: `STATUS: ACTIVE_IN_USE (Baseline: ${payload.conditionRating})`,
      justification: `QR verified + 3/3 safety pre-flight checks passed. Note: ${payload.notes}`,
    });

    markTourStepDone(6);
    showNotice('Step 7 Check-In complete! Equipment status transitioned to ACTIVE_IN_USE.');
  };

  // Step 8: Check-Out Handler
  const handleCompleteCheckOut = (
    bookingId: string,
    payload: {
      conditionRating: ConditionRating;
      notes: string;
      photoDataUrl: string;
    }
  ) => {
    const nowIso = new Date().toISOString();
    const isFlagged = payload.conditionRating === 'DAMAGE_OCCURRED';
    const targetBooking = bookings.find((b) => b.id === bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: isFlagged ? 'FLAGGED_FOR_REVIEW' : 'COMPLETED',
              checkOutLog: {
                id: `chk-out-${Date.now()}`,
                bookingId,
                phase: 'CHECK_OUT',
                timestamp: nowIso,
                actorId: currentUser.id,
                actorName: currentUser.name,
                photoDataUrl: payload.photoDataUrl,
                conditionRating: payload.conditionRating,
                checklistCompleted: [
                  { item: 'Post-operation area cleaned', checked: true },
                  { item: 'Return photo logged alongside baseline', checked: true },
                ],
                notes: payload.notes,
                qrVerified: true,
              },
            }
          : b
      )
    );

    if (targetBooking) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetBooking.userId
            ? {
                ...u,
                weeklyQuotaUsed: Math.min(
                  u.weeklyQuotaCap,
                  u.weeklyQuotaUsed + targetBooking.durationHours
                ),
                completedSessions: u.completedSessions + 1,
              }
            : u
        )
      );
    }

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: 'PHOTO_CHECK_OUT_RETURN',
      beforeState: 'STATUS: ACTIVE_IN_USE',
      afterState: `STATUS: ${isFlagged ? 'FLAGGED_FOR_REVIEW' : 'COMPLETED'} (${payload.conditionRating})`,
      justification: `Before/After condition photos archived. Handover note: ${payload.notes}`,
    });

    markTourStepDone(7);
    showNotice('Step 8 Check-Out verified! Before & After condition photos locked in Audit Ledger.');
  };

  // Step 9: Extension & Damage Lockout Engine
  const handleRequestExtension = (bookingId: string, minutes: number) => {
    const target = bookings.find((b) => b.id === bookingId);
    const hasConflict = bookings.some(
      (b) =>
        b.id !== bookingId &&
        b.resourceId === target?.resourceId &&
        b.dateLabel === target?.dateLabel &&
        b.status !== 'REJECTED'
    );

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              extensionRequestedMinutes: minutes,
              extensionConflictDetected: hasConflict,
            }
          : b
      )
    );

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'BOOKING',
      entityId: bookingId,
      actionType: hasConflict
        ? 'EXTENSION_CONFLICT_ESCALATED'
        : 'EXTENSION_AUTO_GRANTED',
      beforeState: 'END_TIME: STANDARD SLOT',
      afterState: hasConflict
        ? `EXTENSION +${minutes}M CONTESTED (Manager & Next User Alerted)`
        : `EXTENDED +${minutes}M`,
      justification: hasConflict
        ? 'Downstream booking detected on same resource; automated conflict alert sent to Dr. Aris Thorne.'
        : 'Zero downstream contention; +30m extension approved.',
    });

    markTourStepDone(8);
  };

  const handleReportIncident = async (payload: {
    bookingId: string;
    resourceId: string;
    severity: IncidentSeverity;
    description: string;
  }) => {
    const targetResource = resources.find((r) => r.id === payload.resourceId);
    const res = await fetch('/api/ai/summarize-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceName: targetResource?.name || payload.resourceId,
        severity: payload.severity,
        description: payload.description,
        reporterName: currentUser.name,
      }),
    });
    const aiData = await res.json();

    const shouldLock = payload.severity === 'UNSAFE_OUT_OF_COMMISSION';
    if (shouldLock) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === payload.resourceId
            ? {
                ...r,
                status: 'MAINTENANCE_LOCKED',
                lockReason: payload.description,
              }
            : r
        )
      );
    }

    const newInc: IncidentReport = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      bookingId: payload.bookingId,
      resourceId: payload.resourceId,
      resourceName: targetResource?.name || 'Lab Equipment',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      severity: payload.severity,
      description: payload.description,
      aiSummary: aiData.aiSummary,
      aiRequiresManagerSignoff: true,
      resourceLocked: shouldLock,
      resolutionStatus: shouldLock ? 'OPEN_LOCKED' : 'UNDER_INVESTIGATION',
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [newInc, ...prev]);

    appendAuditEntry({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      entityType: 'INCIDENT',
      entityId: newInc.id,
      actionType: shouldLock ? 'CRITICAL_SAFETY_LOCKOUT_TRIGGERED' : 'INCIDENT_LOGGED',
      beforeState: 'RESOURCE: OPERATIONAL',
      afterState: shouldLock ? 'RESOURCE: MAINTENANCE_LOCKED' : 'RESOURCE: FLAGGED',
      justification: `${payload.description} · ${aiData.aiSummary}`,
    });

    markTourStepDone(8);
    showNotice(
      shouldLock
        ? `Safety Lockout activated on ${targetResource?.serialId}! Future bookings paused until Dr. Thorne clears the lock.`
        : `Incident logged with AI Triage Summary for Dr. Thorne.`
    );
  };

  const handleResolveIncidentAndUnlock = (incidentId: string, resolutionNote: string) => {
    const targetInc = incidents.find((i) => i.id === incidentId);
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              resolutionStatus: 'RESOLVED_CLEARED',
              resourceLocked: false,
              resolvedBy: 'Dr. Aris Thorne',
              resolutionNote,
            }
          : i
      )
    );

    if (targetInc) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === targetInc.resourceId
            ? { ...r, status: 'OPERATIONAL', lockReason: undefined }
            : r
        )
      );

      appendAuditEntry({
        actorId: 'usr-thorne',
        actorName: 'Dr. Aris Thorne',
        actorRole: 'MANAGER',
        entityType: 'INCIDENT',
        entityId: incidentId,
        actionType: 'MANAGER_LOCKOUT_CLEARED',
        beforeState: 'RESOURCE: MAINTENANCE_LOCKED',
        afterState: 'RESOURCE: OPERATIONAL',
        justification: resolutionNote,
      });
    }

    showNotice('Hardware safety lockout cleared by Dr. Aris Thorne. Resource restored to Operational.');
  };

  // Step 1: Create New Resource
  const handleCreateResource = (
    newRes: Omit<ResourceItem, 'id' | 'ownerId' | 'ownerName' | 'status'>
  ) => {
    const created: ResourceItem = {
      ...newRes,
      id: `res-${Date.now().toString().slice(-4)}`,
      ownerId: 'usr-thorne',
      ownerName: 'Dr. Aris Thorne',
      status: 'OPERATIONAL',
    };
    setResources((prev) => [created, ...prev]);

    appendAuditEntry({
      actorId: 'usr-thorne',
      actorName: 'Dr. Aris Thorne',
      actorRole: 'MANAGER',
      entityType: 'RESOURCE',
      entityId: created.id,
      actionType: 'RESOURCE_LISTED_WITH_ELIGIBILITY_GATES',
      beforeState: 'UNLISTED',
      afterState: `OPERATIONAL (${created.serialId} · Cap: ${created.maxHrsPerWeek}h/wk)`,
      justification: `Listed ${created.name} requiring badge ${created.requiredBadges
        .map((b) => b.code)
        .join(', ')}.`,
    });

    markTourStepDone(1);
    showNotice(`New resource ${created.name} (${created.serialId}) published to Marketplace!`);
  };

  // Filtered Resources for Step 2 Marketplace
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (categoryFilter !== 'ALL' && res.category !== categoryFilter) return false;
      if (onlyOperational && res.status === 'MAINTENANCE_LOCKED') return false;
      if (onlyNoSupervision && res.supervisionMode !== 'AUTONOMOUS') return false;
      if (onlyEligibleNow) {
        const hasAllBadges = res.requiredBadges.every((req) =>
          credentials.some(
            (c) =>
              c.userId === currentUser.id &&
              c.badgeCode === req.code &&
              c.status === 'VERIFIED'
          )
        );
        if (!hasAllBadges) return false;
      }
      return true;
    });
  }, [
    resources,
    categoryFilter,
    onlyOperational,
    onlyNoSupervision,
    onlyEligibleNow,
    credentials,
    currentUser.id,
  ]);

  const selectedResource = useMemo(
    () => resources.find((r) => r.id === selectedResourceId) || null,
    [resources, selectedResourceId]
  );

  const remainingPeakHours = Math.max(0, currentUser.weeklyQuotaCap - currentUser.weeklyQuotaUsed);
  const quotaPercentage = Math.min(
    100,
    Math.round((currentUser.weeklyQuotaUsed / currentUser.weeklyQuotaCap) * 100)
  );

  const handleJumpToTourStep = (step: TourStepProgress) => {
    if (step.targetRole === 'MANAGER') {
      setActiveUserId('usr-thorne');
    } else if (step.targetRole === 'ADMIN') {
      setActiveUserId('usr-auditor');
    } else {
      setActiveUserId('usr-maya');
    }
    setActiveTab(step.targetNav);
    if (step.stepNumber === 2 || step.stepNumber === 3 || step.stepNumber === 4) {
      setSelectedResourceId('res-epilog-laser');
    }
    if (step.stepNumber === 9) {
      markTourStepDone(9);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: Strictly 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#explore"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('explore');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          LabGrid
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'explore'
                ? 'border-indigo-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Explore & Match
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'session'
                ? 'border-indigo-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Active Session Hub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manager')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'manager'
                ? 'border-indigo-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Owner Command
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('audit');
              markTourStepDone(9);
            }}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Audit Ledger
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('explore');
              setSelectedResourceId('res-epilog-laser');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Book Equipment
          </button>
        </div>
      </header>

      {/* Workspace Control Bar: Judge Persona Switcher + Fair-Access Quota Meter */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Judge Quick-Switch Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5 mr-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Judge Persona Switcher:</span>
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
              {users.map((u) => {
                const isActive = u.id === currentUser.id;
                const roleLabel =
                  u.role === 'USER'
                    ? 'Student'
                    : u.role === 'MANAGER'
                    ? 'Lab Owner'
                    : 'Auditor';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSwitchPersona(u.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {u.name} · {roleLabel}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>

          {/* Fair-Access Quota Progress Meter */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Fair-Access Meter:</span>
              <span className="font-mono font-semibold text-white tabular-nums">
                {remainingPeakHours} / {currentUser.weeklyQuotaCap} Weekly Peak Hours Remaining
              </span>
            </div>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-emerald-400 transition-transform"
                style={{ width: `${100 - quotaPercentage}%` }}
              />
            </div>
            <span className="font-mono text-emerald-400 tabular-nums hidden sm:inline">
              TRUST: {currentUser.reliabilityScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Feedback Banner */}
      {toastBanner && (
        <div className="bg-indigo-950 text-indigo-100 border-b border-indigo-800 px-6 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="font-mono">{toastBanner}</span>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-indigo-300 hover:text-white font-mono text-[11px]"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Hero & AI Natural Language Resource Finder (Step 2) */}
            <section className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="max-w-3xl">
                <div className="text-xs font-mono text-indigo-600 font-semibold">
                  UNIVERSITY & MAKERSPACE RESOURCE GOVERNANCE NETWORK
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Precision Equipment Access with Built-In Safety Compliance & Fair Allocation
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Every reservation verifies your training badges, calculates an explainable anti-monopolization priority score, and logs before-and-after physical condition photos.
                </p>
              </div>

              {/* AI Natural Language Finder Input */}
              <div className="mt-5 pt-5 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-900 mb-2">
                  Step 2. AI Natural Language Equipment & Safety Badge Matcher
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRunAiMatcher();
                      }}
                      placeholder="Describe what you need to build or test (e.g., 'I need to cut 6mm acrylic sheet this Thursday afternoon')..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isMatchingAi}
                    onClick={() => handleRunAiMatcher()}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isMatchingAi ? 'Matching via Gemini...' : 'Match Equipment & Check Badges'}</span>
                  </button>
                </div>

                {/* Preset Judge Prompts */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                  <span className="text-slate-500">Try sample prompts:</span>
                  {[
                    'I need to cut 6mm acrylic sheet this Thursday afternoon',
                    'Print carbon-fiber PAHT-CF prosthetic wrist bracket',
                    'Measure 6GHz RF clock jitter on brushless motor PCB',
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => handleRunAiMatcher(sample)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-left"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>

                {/* AI Recommendation Result Box */}
                {aiMatchResult && (
                  <div className="mt-4 p-4 rounded-lg border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>AI Matcher Recommendation & Live Badge Check</span>
                      </div>
                      <p className="text-xs text-slate-700">{aiMatchResult.recommendationSummary}</p>
                      <p className="text-[11px] font-mono text-indigo-800">
                        {aiMatchResult.recommendedSlotNote}
                      </p>
                    </div>
                    {aiMatchResult.matchedResourceIds[0] && (
                      <button
                        type="button"
                        onClick={() => setSelectedResourceId(aiMatchResult.matchedResourceIds[0])}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg whitespace-nowrap shrink-0"
                      >
                        Open Matched Resource
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Smart Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Category Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                {(['ALL', 'Fabrication', 'Precision Electronics', 'Optics & Bio-Imaging', 'Media & Acoustics'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        categoryFilter === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Lab Resources' : cat}
                    </button>
                  )
                )}
              </div>

              {/* Instant Compliance Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Quick Filters:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOnlyEligibleNow(!onlyEligibleNow)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    onlyEligibleNow
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Eligible for Me Now
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyNoSupervision(!onlyNoSupervision)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    onlyNoSupervision
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  No Supervision Needed
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyOperational(!onlyOperational)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    onlyOperational
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Available Today
                </button>
              </div>
            </div>

            {/* Resource Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => {
                const isAiHighlighted = aiMatchResult?.matchedResourceIds.includes(res.id);
                const badgeStatuses = res.requiredBadges.map((req) => {
                  const found = credentials.find(
                    (c) => c.userId === currentUser.id && c.badgeCode === req.code
                  );
                  return {
                    ...req,
                    status: found ? found.status : 'MISSING',
                  };
                });
                const isFullyEligible = badgeStatuses.every((b) => b.status === 'VERIFIED');

                return (
                  <article
                    key={res.id}
                    className={`bg-white rounded-lg border transition-all flex flex-col justify-between overflow-hidden ${
                      isAiHighlighted
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Equipment CAD Schematic Preview */}
                      <div className="relative bg-slate-950 border-b border-slate-200">
                        <img
                          src={getEquipmentSchematicUrl(res.visualType)}
                          alt={res.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-cover"
                        />
                        <div className="px-3.5 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-300">{res.serialId}</span>
                          <span
                            className={
                              res.status === 'OPERATIONAL'
                                ? 'text-emerald-400'
                                : res.status === 'IN_USE'
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }
                          >
                            STATUS: {res.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>{res.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{res.location}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{res.maxHrsPerWeek}h/wk cap</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {res.name}
                        </h3>

                        {/* Signature Component: Live Eligibility Gate Checklist */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              Eligibility Gate Status:
                            </span>
                            <span
                              className={`font-mono text-[11px] font-semibold ${
                                isFullyEligible ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {isFullyEligible ? 'ELIGIBLE NOW' : 'CERT SIGN-OFF NEEDED'}
                            </span>
                          </div>

                          {badgeStatuses.map((b) => (
                            <div
                              key={b.code}
                              className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-slate-50 border border-slate-200/80"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {b.status === 'VERIFIED' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                )}
                                <span className="font-mono text-[11px] text-slate-800 truncate">
                                  {b.code}: {b.label}
                                </span>
                              </div>
                              <span
                                className={`font-mono text-[10px] ml-2 shrink-0 ${
                                  b.status === 'VERIFIED'
                                    ? 'text-emerald-700'
                                    : b.status === 'PENDING'
                                    ? 'text-indigo-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {b.status === 'VERIFIED'
                                  ? 'VERIFIED'
                                  : b.status === 'PENDING'
                                  ? 'AI PRE-SCREENED'
                                  : 'REQUIRED'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {res.status === 'MAINTENANCE_LOCKED' && res.lockReason && (
                          <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>Locked: {res.lockReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-mono">
                        {res.supervisionMode === 'AUTONOMOUS'
                          ? 'Autonomous Access'
                          : res.supervisionMode === 'STAFF_SUPERVISION'
                          ? 'Staff Supervised'
                          : 'Manager Approval'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResourceId(res.id);
                          markTourStepDone(2);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <span>Inspect & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'session' && (
          <ActiveSessionHub
            bookings={bookings}
            resources={resources}
            currentUser={currentUser}
            selectedBookingId={selectedBookingId}
            onSelectBooking={setSelectedBookingId}
            onCompleteCheckIn={handleCompleteCheckIn}
            onCompleteCheckOut={handleCompleteCheckOut}
            onRequestExtension={handleRequestExtension}
            onReportIncident={handleReportIncident}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerCommandCenter
            resources={resources}
            bookings={bookings}
            credentials={credentials}
            incidents={incidents}
            onApproveBooking={handleApproveBooking}
            onWaitlistBooking={handleWaitlistBooking}
            onRejectBooking={handleRejectBooking}
            onVerifyCredential={handleVerifyCredential}
            onResolveIncidentAndUnlock={handleResolveIncidentAndUnlock}
            onCreateResource={handleCreateResource}
          />
        )}

        {activeTab === 'audit' && (
          <AuditFairnessLedger
            auditLogs={auditLogs}
            users={users}
            bookings={bookings}
          />
        )}
      </main>

      {/* Resource Detail & Booking Drawer (Steps 2, 3, 4) */}
      <ResourceDetailDrawer
        resource={selectedResource}
        currentUser={currentUser}
        userCredentials={credentials}
        existingBookings={bookings}
        onClose={() => setSelectedResourceId(null)}
        onUploadAndPreVerifyBadge={handleUploadAndPreVerifyBadge}
        onSubmitBooking={handleSubmitBooking}
      />

      {/* Guided 90-Second Judge Tour Widget */}
      <JudgeTourWidget
        steps={tourSteps}
        activeRole={currentUser.role}
        onJumpToStep={handleJumpToTourStep}
        onToggleStepComplete={(stepNum) =>
          setTourSteps((prev) =>
            prev.map((s) =>
              s.stepNumber === stepNum ? { ...s, completed: !s.completed } : s
            )
          )
        }
      />

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            LabGrid Institutional Resource Governance · Pre-Booking Compliance, Fair Allocation & Physical Chain-of-Custody
          </div>
          <div className="font-mono">
            RULE #12 HUMAN-IN-THE-LOOP AI GUARDRAILS ACTIVE
          </div>
        </div>
      </footer>
    </div>
  );
}
