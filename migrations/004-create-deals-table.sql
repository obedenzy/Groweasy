CREATE TYPE deal_stage AS ENUM ('LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subaccount_id UUID NOT NULL REFERENCES subaccounts(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    stage deal_stage NOT NULL DEFAULT 'LEAD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
