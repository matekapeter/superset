import { auth } from "@superset/auth/server";
import type { McpContext } from "@superset/mcp/auth";
import { verifyAccessToken } from "better-auth/oauth2";
import { env } from "@/env";

export interface VerifiedAuth {
	userId: string;
	organizationId: string;
}

export async function verifyToken(req: Request): Promise<VerifiedAuth | null> {
	const authorization = req.headers.get("authorization");
	const bearerToken = authorization?.startsWith("Bearer ")
		? authorization.slice(7)
		: undefined;

	// 1. Try session auth (for desktop/web app)
	const session = await auth.api.getSession({ headers: req.headers });
	if (session?.session) {
		const extendedSession = session.session as {
			activeOrganizationId?: string;
		};
		if (extendedSession.activeOrganizationId) {
			return {
				userId: session.user.id,
				organizationId: extendedSession.activeOrganizationId,
			};
		}
	}

	// 2. Try API key verification (for sk_live_ tokens)
	if (bearerToken) {
		try {
			const result = await auth.api.verifyApiKey({
				body: { key: bearerToken },
			});
			if (result.valid && result.key) {
				const userId = result.key.userId;
				if (!userId) return null;
				const metadata =
					typeof result.key.metadata === "string"
						? JSON.parse(result.key.metadata)
						: result.key.metadata;
				const organizationId = metadata?.organizationId as string | undefined;
				if (!organizationId) return null;
				return { userId, organizationId };
			}
		} catch {
			// Fall through to next auth method
		}
	}

	// 3. Try OAuth access token verification via JWKS
	if (bearerToken) {
		try {
			const payload = await verifyAccessToken(bearerToken, {
				jwksUrl: `${env.NEXT_PUBLIC_API_URL}/api/auth/jwks`,
				verifyOptions: {
					issuer: env.NEXT_PUBLIC_API_URL,
					audience: [env.NEXT_PUBLIC_API_URL, `${env.NEXT_PUBLIC_API_URL}/`],
				},
			});
			if (payload?.sub && payload.organizationId) {
				return {
					userId: payload.sub,
					organizationId: payload.organizationId as string,
				};
			}
		} catch {
			// Fall through
		}
	}

	return null;
}

export function toMcpAuthInfo(verified: VerifiedAuth) {
	return {
		token: "api-key" as const,
		clientId: "api-key" as const,
		scopes: ["mcp:full"],
		extra: {
			mcpContext: {
				userId: verified.userId,
				organizationId: verified.organizationId,
			} satisfies McpContext,
		},
	};
}
