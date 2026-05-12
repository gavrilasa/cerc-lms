/**
 * Centralized constants for the application.
 * Re-exports Prisma enums for convenience and provides additional constants.
 */

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

export const ROLE_LEVELS = {
	GUEST: 0,
	USER: 1,
	MEMBER: 2,
	MENTOR: 3,
	ADMIN: 4,
} as const;

export const DIVISION_LABELS: Record<string, string> = {
	SOFTWARE: "Software Development",
	EMBEDDED: "Embedded Systems",
	MULTIMEDIA: "Multimedia",
	NETWORKING: "Networking",
	GLOBAL: "Global",
} as const;

export const COURSE_STATUS_LABELS: Record<string, string> = {
	DRAFT: "Draft",
	PUBLISHED: "Published",
	ARCHIVED: "Archived",
} as const;

export const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
	PENDING: "Pending",
	ACTIVE: "Active",
	CANCELLED: "Cancelled",
} as const;
