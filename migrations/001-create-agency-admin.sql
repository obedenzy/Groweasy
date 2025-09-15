-- Migration script to create a default agency and an admin user

-- Step 1: Create the Agency
WITH new_agency AS (
  INSERT INTO agencies (name, slug)
  VALUES ('Default Agency', 'default-agency')
  RETURNING id
),

-- Step 2: Create the Admin User
new_user AS (
  INSERT INTO users (name, email, password)
  -- IMPORTANT: This is a placeholder password. 
  -- In a real-world scenario, you should replace 'placeholder_password' 
  -- with a securely generated password hash (e.g., using bcrypt).
  VALUES ('Admin User', 'admin@example.com', 'placeholder_password')
  RETURNING id
)

-- Step 3: Link the User to the Agency as an Admin
INSERT INTO user_agency_memberships (user_id, agency_id, role)
SELECT new_user.id, new_agency.id, 'AGENCY_ADMIN'
FROM new_user, new_agency;
