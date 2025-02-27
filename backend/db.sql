CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    current_address TEXT,
    bio TEXT,
    occupation VARCHAR(255),
    monthly_income DECIMAL(10,2),
    preferred_locations TEXT[],
    max_budget DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS apartment_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    apartment_id INTEGER REFERENCES apartments(id),
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    documents TEXT[], -- Array of document IDs
    property_manager_email VARCHAR(255),
    UNIQUE(user_id, apartment_id)
);

CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    price DECIMAL(10,2),
    location TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    image_url TEXT,
    amenitites TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    apartment_id INTEGER REFERENCES apartments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, apartment_id)
);

-- If the table already exists and needs the column added:
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- First check if constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_apartment'
    ) THEN
        ALTER TABLE favorites ADD CONSTRAINT unique_user_apartment UNIQUE (user_id, apartment_id);
    END IF;
END $$;

-- Clean up existing duplicates (keep the most recent)
DELETE FROM favorites a USING favorites b
WHERE a.user_id = b.user_id 
  AND a.apartment_id = b.apartment_id 
  AND a.id < b.id; 