-- Migration: Add application settings fields to user_preferences
ALTER TABLE user_preferences
ADD COLUMN notification_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN expiration_threshold_days integer NOT NULL DEFAULT 3,
ADD COLUMN inventory_threshold integer NOT NULL DEFAULT 1;