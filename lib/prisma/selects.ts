import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Centralized Prisma select objects to ensure DRY principle
 * and consistent data shapes across the application.
 */

// ============================================
// LESSON SELECTS
// ============================================

/**
 * Basic lesson select - id, title, position
 */
export const lessonBasicSelect = {
	id: true,
	title: true,
	position: true,
} as const satisfies Prisma.LessonSelect;

/**
 * Lesson with description - for admin views
 */
export const lessonWithDescriptionSelect = {
	...lessonBasicSelect,
	description: true,
} as const satisfies Prisma.LessonSelect;

// ============================================
// CHAPTER SELECTS
// ============================================

/**
 * Basic chapter select with lessons
 */
export const chapterWithLessonsSelect = {
	id: true,
	title: true,
	position: true,
	lessons: {
		select: lessonBasicSelect,
		orderBy: {
			position: "asc" as const,
		},
	},
} as const satisfies Prisma.ChapterSelect;

/**
 * Chapter with detailed lessons (includes description)
 */
export const chapterWithDetailedLessonsSelect = {
	id: true,
	title: true,
	position: true,
	lessons: {
		select: lessonWithDescriptionSelect,
	},
} as const satisfies Prisma.ChapterSelect;

// ============================================
// COURSE SELECTS
// ============================================

/**
 * Core course fields - shared across most course queries
 */
export const courseBaseSelect = {
	id: true,
	title: true,
	description: true,
	fileKey: true,
	smallDescription: true,
	division: true,
	status: true,
	slug: true,
} as const satisfies Prisma.CourseSelect;

/**
 * Course with chapters and basic lessons - for public/user views
 */
export const courseWithChaptersSelect = {
	...courseBaseSelect,
	updatedAt: true,
	chapters: {
		select: chapterWithLessonsSelect,
		orderBy: {
			position: "asc" as const,
		},
	},
} as const satisfies Prisma.CourseSelect;

/**
 * Course with detailed chapters - for admin views
 */
export const courseWithDetailedChaptersSelect = {
	...courseBaseSelect,
	chapters: {
		select: chapterWithDetailedLessonsSelect,
	},
} as const satisfies Prisma.CourseSelect;

/**
 * Minimal course card select - for listings
 */
export const courseCardSelect = {
	id: true,
	title: true,
	smallDescription: true,
	fileKey: true,
	slug: true,
	division: true,
	status: true,
	updatedAt: true,
} as const satisfies Prisma.CourseSelect;
