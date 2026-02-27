-- ============================================
-- Vehicle GPS Tracking Dashboard - Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  plate_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'sedan' CHECK (type IN ('sedan', 'suv', 'truck', 'van', 'bus', 'motorcycle')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'offline')),
  driver_name TEXT,
  driver_phone TEXT,
  fuel_level FLOAT DEFAULT 100,
  total_distance FLOAT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. GPS LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gps_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  altitude FLOAT8,
  speed FLOAT8 DEFAULT 0,
  heading FLOAT8 DEFAULT 0,
  accuracy FLOAT8,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries on vehicle_id and recorded_at
CREATE INDEX IF NOT EXISTS idx_gps_locations_vehicle_id ON gps_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_locations_recorded_at ON gps_locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_gps_locations_vehicle_time ON gps_locations(vehicle_id, recorded_at DESC);

-- ============================================
-- 3. VEHICLE ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  assigned_to TEXT NOT NULL,
  department TEXT,
  purpose TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_end TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_vehicle_id ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON vehicle_assignments(vehicle_id) WHERE actual_end IS NULL;

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. VIEW: Latest GPS position per vehicle
-- ============================================
CREATE OR REPLACE VIEW vehicle_latest_positions AS
SELECT DISTINCT ON (g.vehicle_id)
  g.vehicle_id,
  g.latitude,
  g.longitude,
  g.speed,
  g.heading,
  g.accuracy,
  g.recorded_at,
  v.name AS vehicle_name,
  v.plate_number,
  v.type AS vehicle_type,
  v.status AS vehicle_status,
  v.driver_name,
  v.fuel_level
FROM gps_locations g
JOIN vehicles v ON v.id = g.vehicle_id
ORDER BY g.vehicle_id, g.recorded_at DESC;

-- ============================================
-- 6. ROW LEVEL SECURITY (Enable for production)
-- ============================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON gps_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON vehicle_assignments
  FOR SELECT TO authenticated USING (true);

-- Allow anonymous read access (for demo purposes - remove in production)
CREATE POLICY "Allow anonymous read access" ON vehicles
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON gps_locations
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON vehicle_assignments
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================
-- 7. ENABLE REALTIME for vehicles & gps_locations
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE gps_locations;

-- ============================================
-- 8. SEED DATA (Demo Vehicles)
-- ============================================
INSERT INTO vehicles (name, plate_number, type, status, driver_name, driver_phone, fuel_level) VALUES
  ('Fleet Cruiser 01', 'MH-01-AB-1234', 'sedan', 'available', 'Rahul Sharma', '+91-98765-43210', 85),
  ('Fleet Cruiser 02', 'MH-01-CD-5678', 'sedan', 'in_use', 'Priya Patel', '+91-98765-43211', 62),
  ('Cargo Hauler 01', 'MH-02-EF-9012', 'truck', 'in_use', 'Amit Kumar', '+91-98765-43212', 45),
  ('City Runner 01', 'DL-03-GH-3456', 'van', 'maintenance', 'Suresh Reddy', '+91-98765-43213', 30),
  ('Highway Star 01', 'KA-04-IJ-7890', 'suv', 'available', 'Deepa Nair', '+91-98765-43214', 92),
  ('Metro Express 01', 'TN-05-KL-2345', 'bus', 'in_use', 'Vijay Singh', '+91-98765-43215', 55),
  ('Swift Rider 01', 'GJ-06-MN-6789', 'motorcycle', 'available', 'Karan Mehta', '+91-98765-43216', 78),
  ('Fleet Cruiser 03', 'RJ-07-OP-0123', 'sedan', 'offline', 'Neha Gupta', '+91-98765-43217', 10),
  ('Cargo Hauler 02', 'UP-08-QR-4567', 'truck', 'available', 'Ravi Verma', '+91-98765-43218', 70),
  ('City Runner 02', 'MP-09-ST-8901', 'van', 'in_use', 'Anita Desai', '+91-98765-43219', 38)
ON CONFLICT (plate_number) DO NOTHING;

-- Seed GPS locations for demo vehicles
DO $$
DECLARE
  v_record RECORD;
  base_lat FLOAT8;
  base_lng FLOAT8;
BEGIN
  -- Mumbai-area base coordinates
  base_lat := 19.0760;
  base_lng := 72.8777;
  
  FOR v_record IN SELECT id FROM vehicles LOOP
    INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading, recorded_at)
    VALUES (
      v_record.id,
      base_lat + (random() - 0.5) * 0.1,
      base_lng + (random() - 0.5) * 0.1,
      random() * 80,
      random() * 360,
      NOW() - interval '1 minute' * floor(random() * 5)
    );
  END LOOP;
END $$;

-- Seed active assignments for in_use vehicles
INSERT INTO vehicle_assignments (vehicle_id, assigned_to, department, purpose, start_time, estimated_end)
SELECT 
  id,
  driver_name,
  'Operations',
  'Field Visit',
  NOW() - interval '2 hours',
  NOW() + interval '1 hour' + (random() * interval '3 hours')
FROM vehicles
WHERE status = 'in_use'
ON CONFLICT DO NOTHING;
