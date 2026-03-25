import { db, dbWs } from "@superset/db/client";
import {
	agentCommands,
	agentTelemetry,
	commandStatusValues,
} from "@superset/db/schema";
import { getCurrentTxid } from "@superset/db/utils";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const agentRouter = {
	/**
	 * Update a command's status (called by device executors via Electric sync)
	 */
	updateCommand: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				status: z.enum(commandStatusValues).optional(),
				result: z.record(z.string(), z.unknown()).nullable().optional(),
				error: z.string().nullable().optional(),
				executedAt: z.date().nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const organizationId = ctx.session.session.activeOrganizationId;
			if (!organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No active organization selected",
				});
			}

			const { id, ...changes } = input;

			const result = await dbWs.transaction(async (tx) => {
				const [existingCommand] = await tx
					.select()
					.from(agentCommands)
					.where(
						and(
							eq(agentCommands.id, id),
							eq(agentCommands.organizationId, organizationId),
							eq(agentCommands.userId, ctx.session.user.id),
						),
					);

				if (!existingCommand) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Command not found",
					});
				}

				const [updated] = await tx
					.update(agentCommands)
					.set(changes)
					.where(eq(agentCommands.id, id))
					.returning();

				const txid = await getCurrentTxid(tx);

				return { command: updated, txid };
			});

			return result;
		}),

	/**
	 * Get the latest telemetry snapshot for each active session in the org
	 */
	getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
		const organizationId = ctx.session.session.activeOrganizationId;
		if (!organizationId) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "No active organization selected",
			});
		}

		const sessions = await db.execute(sql`
			SELECT DISTINCT ON (${agentTelemetry.sessionId}) *
			FROM ${agentTelemetry}
			WHERE ${agentTelemetry.organizationId} = ${organizationId}
			ORDER BY ${agentTelemetry.sessionId}, ${agentTelemetry.createdAt} DESC
		`);

		return { sessions: sessions.rows };
	}),

	/**
	 * Get telemetry time-series for a specific session
	 */
	getSessionTelemetry: protectedProcedure
		.input(
			z.object({
				sessionId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const organizationId = ctx.session.session.activeOrganizationId;
			if (!organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No active organization selected",
				});
			}

			const rows = await db
				.select()
				.from(agentTelemetry)
				.where(
					and(
						eq(agentTelemetry.organizationId, organizationId),
						eq(agentTelemetry.sessionId, input.sessionId),
					),
				)
				.orderBy(desc(agentTelemetry.createdAt));

			return { telemetry: rows };
		}),

	/**
	 * Get aggregated agent metrics for the org over a time period
	 */
	getAgentMetrics: protectedProcedure
		.input(
			z.object({
				days: z.number().min(1).max(90).default(7),
			}),
		)
		.query(async ({ ctx, input }) => {
			const organizationId = ctx.session.session.activeOrganizationId;
			if (!organizationId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No active organization selected",
				});
			}

			const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

			const result = await db.execute(sql`
				SELECT
					COUNT(DISTINCT ${agentTelemetry.sessionId})::int AS session_count,
					MAX(${agentTelemetry.totalCostUsd}) AS total_cost_usd,
					SUM(${agentTelemetry.currentInputTokens})::bigint AS total_input_tokens,
					SUM(${agentTelemetry.currentOutputTokens})::bigint AS total_output_tokens,
					COUNT(*)::int AS telemetry_count
				FROM ${agentTelemetry}
				WHERE ${agentTelemetry.organizationId} = ${organizationId}
				AND ${agentTelemetry.createdAt} >= ${since}
			`);

			return { metrics: result.rows[0] ?? null };
		}),
} satisfies TRPCRouterRecord;
