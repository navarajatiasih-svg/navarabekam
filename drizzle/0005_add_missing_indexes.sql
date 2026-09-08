-- ============================================
-- 0005_add_missing_indexes.sql
-- Optimasi Indexing Database Navara Reflexology
-- ============================================

-- 1. Expression Index (Case-Insensitive Filter)
CREATE INDEX IF NOT EXISTS "finance_category_lower_idx" ON "finance_transactions" (lower("category"));--> statement-breakpoint

-- 2. Missing B-Tree & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS "tsc_therapist_idx" ON "therapist_service_commissions" USING btree ("therapist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tsc_therapist_service_idx" ON "therapist_service_commissions" USING btree ("therapist_id", "service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finance_reference_idx" ON "finance_transactions" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finance_type_idx" ON "finance_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "finance_type_branch_date_idx" ON "finance_transactions" USING btree ("type", "branch_id", "date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "syslog_created_idx" ON "system_logs" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_therapist_date_idx" ON "attendance" USING btree ("therapist_id", "date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spr_staff_idx" ON "staff_payroll_reports" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spr_month_idx" ON "staff_payroll_reports" USING btree ("month");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tmr_therapist_idx" ON "therapist_monthly_reports" USING btree ("therapist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visit_status_idx" ON "patient_visits" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visit_service_idx" ON "patient_visits" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservation_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_number_idx" ON "invoices" USING btree ("invoice_number");
