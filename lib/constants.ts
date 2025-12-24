/**
 * Centralized constants for the application.
 * Re-exports Prisma enums for convenience and provides additional constants.
 */

// Re-export Prisma enums for consistent usage across the app
export {
	Role,
	Division,
	CourseStatus,
	EnrollmentStatus,
	UserStatus,
	CurriculumStatus,
	CurriculumCourseType,
	UserCurriculumStatus,
} from "@/lib/generated/prisma/enums";

// Role hierarchy levels for permission checking
export const ROLE_LEVELS = {
	GUEST: 0,
	USER: 1,
	MEMBER: 2,
	MENTOR: 3,
	ADMIN: 4,
} as const;

// Division display names
export const DIVISION_LABELS: Record<string, string> = {
	SOFTWARE: "Software Development",
	EMBEDDED: "Embedded Systems",
	MULTIMEDIA: "Multimedia",
	NETWORKING: "Networking",
	GLOBAL: "Global",
} as const;

// Course status display names
export const COURSE_STATUS_LABELS: Record<string, string> = {
	DRAFT: "Draft",
	PUBLISHED: "Published",
	ARCHIVED: "Archived",
} as const;

// Enrollment status display names
export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
	PENDING: "Pending",
	ACTIVE: "Active",
	CANCELLED: "Cancelled",
} as const;
