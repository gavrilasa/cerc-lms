import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},

	user: {
		additionalFields: {
			division: {
				type: "string",
				required: false,
				input: true,
			},
			nim: {
				type: "string",
				required: false,
				input: true,
			},
			generation: {
				type: "number",
				required: false,
				input: true,
			},
			status: {
				type: "string",
				defaultValue: "PENDING",
				input: false,
			},
		},
	},

	plugins: [
		admin({
			defaultRole: "GUEST",
			adminRoles: ["ADMIN"],
		}),
		nextCookies(),
	],
});
