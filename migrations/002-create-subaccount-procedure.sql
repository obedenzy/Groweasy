-- Migration script to create the `create_subaccount_for_default_agency` stored procedure

CREATE OR REPLACE FUNCTION create_subaccount_for_default_agency(
    p_email TEXT,
    p_full_name TEXT,
    p_password TEXT,
    p_subaccount_name TEXT,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_agency_id UUID;
    v_subaccount_id UUID;
    v_slug TEXT;
BEGIN
    -- Insert the new user into the public.users table
    INSERT INTO public.users (id, name, email, password)
    VALUES (p_user_id, p_full_name, p_email, p_password);

    -- 1. Find the ID of the "Default Agency"
    SELECT id INTO v_agency_id FROM agencies WHERE slug = 'default-agency' LIMIT 1;

    -- If the agency doesn't exist, raise an exception
    IF v_agency_id IS NULL THEN
        RAISE EXCEPTION 'Default agency not found';
    END IF;

    -- Generate a URL-friendly slug from the subaccount name
    v_slug := lower(regexp_replace(p_subaccount_name, E'\s+', '-', 'g'));

    -- 2. Create a new subaccount
    INSERT INTO subaccounts (name, agency_id, slug)
    VALUES (p_subaccount_name, v_agency_id, v_slug)
    RETURNING id INTO v_subaccount_id;

    -- 3. Assign the new user to the subaccount
    INSERT INTO subaccount_users (user_id, subaccount_id, role)
    VALUES (p_user_id, v_subaccount_id, 'SUBACCOUNT_USER');

END;
$$ LANGUAGE plpgsql;
