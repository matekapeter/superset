import { agentTelemetry } from "@superset/local-db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { localDb } from "main/lib/local-db";
import { z } from "zod";
import { publicProcedure, router } from "../..";

export const createAgentTelemetryRouter = () => {
	return router({
		getLatestSessions: publicProcedure
			.input(
				z
					.object({
						limit: z.number().min(1).max(100).default(20),
						projectDir: z.string().optional(),
					})
					.optional(),
			)
			.query(({ input }) => {
				const limit = input?.limit ?? 20;

				return localDb
					.select()
					.from(agentTelemetry)
					.where(
						and(
							input?.projectDir
								? eq(agentTelemetry.projectDir, input.projectDir)
								: undefined,
							sql`${agentTelemetry.recordedAt} = (
								SELECT MAX(t2.recorded_at) FROM agent_telemetry t2
								WHERE t2.session_id = ${agentTelemetry.sessionId}
							)`,
						),
					)
					.orderBy(desc(agentTelemetry.recordedAt))
					.limit(limit)
					.all();
			}),

		getSessionTimeline: publicProcedure
			.input(z.object({ sessionId: z.string() }))
			.query(({ input }) => {
				return localDb
					.select()
					.from(agentTelemetry)
					.where(eq(agentTelemetry.sessionId, input.sessionId))
					.orderBy(agentTelemetry.recordedAt)
					.all();
			}),

		getStats: publicProcedure
			.input(
				z
					.object({
						sinceMs: z.number().optional(),
						projectDir: z.string().optional(),
					})
					.optional(),
			)
			.query(({ input }) => {
				const since = input?.sinceMs ?? Date.now() - 24 * 60 * 60 * 1000;
				const conditions = [gte(agentTelemetry.recordedAt, since)];
				if (input?.projectDir) {
					conditions.push(eq(agentTelemetry.projectDir, input.projectDir));
				}

				return localDb
					.select({
						totalSessions: sql<number>`COUNT(DISTINCT ${agentTelemetry.sessionId})`,
						snapshotCount: sql<number>`COUNT(*)`,
					})
					.from(agentTelemetry)
					.where(and(...conditions))
					.get();
			}),

		cleanup: publicProcedure
			.input(z.object({ olderThanDays: z.number().min(1).default(30) }))
			.mutation(({ input }) => {
				const cutoff = Date.now() - input.olderThanDays * 24 * 60 * 60 * 1000;
				const result = localDb
					.delete(agentTelemetry)
					.where(sql`${agentTelemetry.recordedAt} < ${cutoff}`)
					.run();
				return { deletedCount: result.changes };
			}),
	});
};
