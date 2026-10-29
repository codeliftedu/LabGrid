export type UserRole = 'USER' | 'MANAGER' | 'ADMIN';

export type SupervisionMode = 'AUTONOMOUS' | 'STAFF_SUPERVISION' | 'MANAGER_APPROVAL';

export type ResourceCategory = 'Fabrication' | 'Optics & Bio-Imaging' | 'Precision Electronics' | 'Media & Acoustics';

export type ResourceStatus = 'OPERATIONAL' | 'IN_USE' | 'MAINTENANCE_LOCKED';

export type BookingPurpose =
  | 'Academic Research'
  | 'Capstone Project'
  | 'Safety-Critical Testing'
  | 'Personal Prototype';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'WAITLISTED'
  | 'REJECTED'
  | 'ACTIVE_IN_USE'
  | 'COMPLETED'
  | 'FLAGGED_FOR_REVIEW';

export type ConditionRating = 'MINT' | 'MINOR_WEAR' | 'PRE_EXISTING_ISSUE' | 'CONSUMABLES_LOW' | 'DAMAGE_OCCURRED';

export type IncidentSeverity = 'MINOR_COSMETIC' | 'CALIBRATION_NEEDED' | 'UNSAFE_OUT_OF_COMMISSION';

export interface UserPersona {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  department: string;
  email: string;
  weeklyQuotaCap: number;
  weeklyQuotaUsed: number;
  reliabilityScore: number; // e.g. 98%
  completedSessions: number;
  lateReturns: number;
}

export interface CredentialBadge {
  id: string;
  userId: string;
  badgeCode: string;
  title: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  verifiedBy?: string;
  aiConfidenceScore?: number;
  aiExtractedSummary?: string;
  certificateDocumentName?: string;
}

export interface ResourceItem {
  id: string;
  serialId: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: ResourceCategory;
  location: string;
  building: string;
  status: ResourceStatus;
  replacementValueUsd: number;
  hourlySlotSize: number;
  maxHrsPerWeek: number;
  supervisionMode: SupervisionMode;
  requiredBadges: {
    code: string;
    label: string;
  }[];
  requiresSopSignoff: boolean;
  preFlightChecklist: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  safetySopSummary: string;
  visualType: 'printer_3d' | 'laser_cutter' | 'oscilloscope' | 'confocal_microscope' | 'cinema_rig' | 'anechoic_chamber';
  lockReason?: string;
}

export interface PriorityBreakdown {
  baseFairness: number; // 50
  recentUsageHours: number;
  recentUsagePenalty: number; // -5 * hours
  purpose: BookingPurpose;
  purposeWeight: number; // +20 for Academic/Capstone/Safety, +5 for Personal
  reliabilityBonus: number; // +10 if reliability >= 95%
  totalScore: number;
  explanation: string;
}

export interface VerificationReport {
  badgeMatchPassed: boolean;
  missingBadges: string[];
  quotaCheckPassed: boolean;
  projectedWeeklyHours: number;
  maxAllowedWeeklyHours: number;
  conflictCheckPassed: boolean;
  conflictingBookingId?: string;
  aiDocumentPreCheck?: {
    scanned: boolean;
    extractedHolder: string;
    extractedBadge: string;
    extractedDate: string;
    confidence: number;
    requiresHumanSignoff: boolean;
    summary: string;
  };
}

export interface ConditionLog {
  id: string;
  bookingId: string;
  phase: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  actorId: string;
  actorName: string;
  photoDataUrl: string;
  conditionRating: ConditionRating;
  checklistCompleted: {
    item: string;
    checked: boolean;
  }[];
  notes: string;
  qrVerified: boolean;
}

export interface BookingRecord {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceSerial: string;
  userId: string;
  userName: string;
  userDepartment: string;
  dateLabel: string; // e.g., "Thu, Oct 29"
  startHour: number; // e.g., 14 for 14:00
  durationHours: number;
  isPeakWindow: boolean;
  purpose: BookingPurpose;
  projectDescription: string;
  priorityBreakdown: PriorityBreakdown;
  verificationReport: VerificationReport;
  status: BookingStatus;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
  waitlistPosition?: number;
  extensionRequestedMinutes?: number;
  extensionConflictDetected?: boolean;
  checkInLog?: ConditionLog;
  checkOutLog?: ConditionLog;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  bookingId: string;
  resourceId: string;
  resourceName: string;
  reporterId: string;
  reporterName: string;
  severity: IncidentSeverity;
  description: string;
  aiSummary: string;
  aiRequiresManagerSignoff: boolean;
  resourceLocked: boolean;
  resolutionStatus: 'OPEN_LOCKED' | 'UNDER_INVESTIGATION' | 'RESOLVED_CLEARED';
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface AuditLedgerEntry {
  id: string;
  hash: string;
  prevHash: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  entityType: 'RESOURCE' | 'BOOKING' | 'CREDENTIAL' | 'INCIDENT' | 'QUOTA_POLICY';
  entityId: string;
  actionType: string;
  beforeState: string;
  afterState: string;
  justification: string;
}

export interface TourStepProgress {
  stepNumber: number;
  title: string;
  pillar: 'Compliance' | 'Fair Allocation' | 'Chain-of-Custody';
  description: string;
  targetNav: 'explore' | 'session' | 'manager' | 'audit';
  targetRole: UserRole;
  completed: boolean;
}
