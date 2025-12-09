import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { env } from "./env";
import { admin, emailOTP } from "better-auth/plugins";
import { resend } from "./resend";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.AUTH_GITHUB_CLIENT_ID,
			clientSecret: env.AUTH_GITHUB_CLIENT_SECRET,
		},
	},

	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp }) {
				await resend.emails.send({
					from: "CERC LMS <onboarding@resend.dev>",
					to: [email],
					subject: "Welcome to CERC LMS.",
					html: `<p>Your OTP is <strong>${otp}</strong></p>`,
				});
			},
		}),
		admin(),
		nextCookies(),
	],
});
