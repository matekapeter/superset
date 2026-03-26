CREATE TABLE `agent_telemetry` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`agent_name` text,
	`model_id` text,
	`model_display_name` text,
	`total_cost_usd` text,
	`total_duration_ms` integer,
	`total_api_duration_ms` integer,
	`total_lines_added` integer,
	`total_lines_removed` integer,
	`total_input_tokens` integer,
	`total_output_tokens` integer,
	`context_window_size` integer,
	`used_percentage` text,
	`current_input_tokens` integer,
	`current_output_tokens` integer,
	`cache_creation_input_tokens` integer,
	`cache_read_input_tokens` integer,
	`five_hour_used_percentage` text,
	`seven_day_used_percentage` text,
	`current_dir` text,
	`project_dir` text,
	`version` text,
	`exceeds_200k_tokens` integer,
	`transcript_path` text,
	`recorded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_telemetry_session_id_idx` ON `agent_telemetry` (`session_id`);
--> statement-breakpoint
CREATE INDEX `agent_telemetry_recorded_at_idx` ON `agent_telemetry` (`recorded_at`);
--> statement-breakpoint
CREATE INDEX `agent_telemetry_project_dir_idx` ON `agent_telemetry` (`project_dir`);
