ALTER TABLE subaccount_settings
ADD COLUMN business_type TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN country TEXT,
ADD COLUMN timezone TEXT;