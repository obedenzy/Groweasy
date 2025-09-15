CREATE TYPE campaign_status AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subaccount_id UUID NOT NULL REFERENCES subaccounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    budget DECIMAL(10, 2),
    status campaign_status NOT NULL DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
