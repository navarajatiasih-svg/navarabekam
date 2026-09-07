CREATE INDEX IF NOT EXISTS "inv_tx_item_idx" ON "inventory_transactions" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inv_tx_branch_idx" ON "inventory_transactions" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inv_tx_date_idx" ON "inventory_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patient_phone_idx" ON "patients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "patient_name_idx" ON "patients" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visit_patient_idx" ON "patient_visits" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visit_branch_date_idx" ON "patient_visits" USING btree ("branch_id","visit_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visit_therapist_status_idx" ON "patient_visits" USING btree ("therapist_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "commission_therapist_status_idx" ON "therapist_commissions" USING btree ("therapist_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_entry_date_idx" ON "journal_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_entry_ref_idx" ON "journal_entries" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_line_entry_idx" ON "journal_lines" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "journal_line_account_idx" ON "journal_lines" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_visit_idx" ON "invoices" USING btree ("visit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_patient_idx" ON "invoices" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_branch_date_idx" ON "invoices" USING btree ("branch_id","created_at");
