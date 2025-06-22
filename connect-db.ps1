# Set the password as environment variable
$env:PGPASSWORD = "8Z5R7xSu3DKBj0IUy0JPadxhJINHcEJ0"

# Connect to the database
Write-Host "Connecting to PostgreSQL database..."
Write-Host "Host: dpg-d1c6h96uk2gs73adsj8g-a.oregon-postgres.render.com"
Write-Host "Database: parcel_delivery_db_5tof"
Write-Host "User: parcel_delivery_db_5tof_user"
Write-Host ""

# Run the SQL commands directly
$sqlCommands = @"
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

-- Show the created table
SELECT * FROM parcels;
"@

# Execute the SQL commands
$sqlCommands | psql -h dpg-d1c6h96uk2gs73adsj8g-a.oregon-postgres.render.com -U parcel_delivery_db_5tof_user -d parcel_delivery_db_5tof

Write-Host ""
Write-Host "Database setup completed!" 