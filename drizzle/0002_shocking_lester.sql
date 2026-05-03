CREATE TABLE `task_list` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `task_list_user_id_idx` ON `task_list` (`user_id`);--> statement-breakpoint
CREATE INDEX `task_list_user_created_idx` ON `task_list` (`user_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `task` ADD `list_id` text REFERENCES task_list(id) ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX `task_user_list_idx` ON `task` (`user_id`,`list_id`);
