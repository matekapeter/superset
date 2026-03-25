import { db } from "@superset/db/client";
import { agentTelemetry } from "@superset/db/schema";
import { z } from "zod";
import { verifyToken } from "@/lib/verify-token";

const telemetryPayload = z
	.object({
		session_id: z.string(),
		agent: z.object({ name: z.string().nullish() }).nullish(),
		model: z
			.object({
				id: z.string().nullish(),
				display_name: z.string().nullish(),
			})
			.nullish(),
		cost: z
			.object({
				total_cost_usd: z.number().nullish(),
				total_duration_ms: z.number().nullish(),
				total_api_duration_ms: z.number().nullish(),
				total_lines_added: z.number().nullish(),
				total_lines_removed: z.number().nullish(),
			})
			.nullish(),
		context_window: z
			.object({
				total_input_tokens: z.number().nullish(),
				total_output_tokens: z.number().nullish(),
				context_window_size: z.number().nullish(),
				used_percentage: z.number().nullish(),
				current_usage: z
					.object({
						input_tokens: z.number().nullish(),
						output_tokens: z.number().nullish(),
						cache_creation_input_tokens: z.number().nullish(),
						cache_read_input_tokens: z.number().nullish(),
					})
					.nullish(),
			})
			.nullish(),
		rate_limits: z
			.object({
				five_hour: z
					.object({ used_percentage: z.number().nullish() })
					.nullish(),
				seven_day: z
					.object({ used_percentage: z.number().nullish() })
					.nullish(),
			})
			.nullish(),
		workspace: z
			.object({
				current_dir: z.string().nullish(),
				project_dir: z.string().nullish(),
			})
			.nullish(),
		version: z.string().nullish(),
		exceeds_200k_tokens: z.boolean().nullish(),
	})
	.passthrough();

export async function POST(req: Request): Promise<Response> {
	const verified = await verifyToken(req);
	if (!verified) {
		return new Response("Unauthorized", { status: 401 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const parsed = telemetryPayload.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Validation failed", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const data = parsed.data;

	await db.insert(agentTelemetry).values({
		userId: verified.userId,
		organizationId: verified.organizationId,
		sessionId: data.session_id,
		agentName: data.agent?.name ?? null,
		modelId: data.model?.id ?? null,
		modelDisplayName: data.model?.display_name ?? null,
		totalCostUsd: data.cost?.total_cost_usd ?? null,
		totalDurationMs: data.cost?.total_duration_ms ?? null,
		totalApiDurationMs: data.cost?.total_api_duration_ms ?? null,
		totalLinesAdded: data.cost?.total_lines_added ?? null,
		totalLinesRemoved: data.cost?.total_lines_removed ?? null,
		totalInputTokens: data.context_window?.total_input_tokens ?? null,
		totalOutputTokens: data.context_window?.total_output_tokens ?? null,
		contextWindowSize: data.context_window?.context_window_size ?? null,
		usedPercentage: data.context_window?.used_percentage ?? null,
		currentInputTokens:
			data.context_window?.current_usage?.input_tokens ?? null,
		currentOutputTokens:
			data.context_window?.current_usage?.output_tokens ?? null,
		currentCacheCreationTokens:
			data.context_window?.current_usage?.cache_creation_input_tokens ?? null,
		currentCacheReadTokens:
			data.context_window?.current_usage?.cache_read_input_tokens ?? null,
		fiveHourUsedPercentage:
			data.rate_limits?.five_hour?.used_percentage ?? null,
		sevenDayUsedPercentage:
			data.rate_limits?.seven_day?.used_percentage ?? null,
		workingDir: data.workspace?.current_dir ?? null,
		projectDir: data.workspace?.project_dir ?? null,
		claudeCodeVersion: data.version ?? null,
		exceeds200kTokens: data.exceeds_200k_tokens ?? null,
	});

	return Response.json({ ok: true });
}
