-- Add review and notification settings to the subaccount_settings table
ALTER TABLE subaccount_settings
ADD COLUMN google_review_link TEXT,
ADD COLUMN review_threshold INTEGER DEFAULT 4,
ADD COLUMN thank_you_message TEXT,
ADD COLUMN enable_reviews BOOLEAN DEFAULT TRUE,
ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN primary_color VARCHAR(20) DEFAULT '#3B82F6',
ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';

-- Ensure review_threshold is within a valid range
ALTER TABLE subaccount_settings
ADD CONSTRAINT review_threshold_check CHECK (review_threshold >= 1 AND review_threshold <= 5);
