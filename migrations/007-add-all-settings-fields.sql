ALTER TABLE subaccount_settings
ADD COLUMN logo_url TEXT,
ADD COLUMN google_review_link TEXT,
ADD COLUMN review_threshold INTEGER DEFAULT 4,
ADD COLUMN primary_color TEXT,
ADD COLUMN thank_you_message TEXT;
