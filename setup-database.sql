-- Create the parcels table
CREATE TABLE IF NOT EXISTS parcels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the id for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcels_id ON parcels(id);

-- Insert some sample data (optional)
INSERT INTO parcels (name, description, status) VALUES 
    ('Sample Parcel 1', 'This is a sample parcel for testing', 'pending'),
    ('Sample Parcel 2', 'Another sample parcel', 'in_transit')
ON CONFLICT DO NOTHING; 