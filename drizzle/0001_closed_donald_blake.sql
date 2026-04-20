CREATE TABLE `focus_session_task` (
	`focus_session_id` text NOT NULL,
	`task_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`focus_session_id`, `task_id`),
	FOREIGN KEY (`focus_session_id`) REFERENCES `focus_session`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `focus_session_task_task_id_idx` ON `focus_session_task` (`task_id`);--> statement-breakpoint
CREATE TABLE `focus_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`duration_minutes` integer,
	`started_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`ended_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `focus_session_user_id_idx` ON `focus_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `focus_session_user_started_idx` ON `focus_session` (`user_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`priority` text NOT NULL,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "task_priority_check" CHECK("task"."priority" in ('low', 'medium', 'high'))
);
--> statement-breakpoint
CREATE INDEX `task_user_id_idx` ON `task` (`user_id`);--> statement-breakpoint
CREATE INDEX `task_user_completed_idx` ON `task` (`user_id`,`completed_at`);--> statement-breakpoint
CREATE INDEX `task_user_priority_idx` ON `task` (`user_id`,`priority`);
