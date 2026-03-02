-- ============================================
-- FleetPulse - NeonDB (PostgreSQL) Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VEHICLES TABLE
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

-- 2. GPS LOCATIONS TABLE
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

CREATE INDEX IF NOT EXISTS idx_gps_locations_vehicle_id ON gps_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_locations_recorded_at ON gps_locations(recorded_at DESC);

-- 3. VEHICLE ASSIGNMENTS TABLE
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

-- 4. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. VIEW: Latest GPS position per vehicle
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

-- 6. REAL-TIME NOTIFICATIONS (LISTEN/NOTIFY)
CREATE OR REPLACE FUNCTION notify_gps_update()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Build a payload for the notification
  -- We include the most vital info for the map
  SELECT json_build_object(
    'type', 'gps_update',
    'vehicle_id', NEW.vehicle_id,
    'latitude', NEW.latitude,
    'longitude', NEW.longitude,
    'speed', NEW.speed,
    'heading', NEW.heading,
    'recorded_at', NEW.recorded_at
  ) INTO payload;
  
  -- Notify the 'gps_updates' channel
  PERFORM pg_notify('gps_updates', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notify_gps_update ON gps_locations;
CREATE TRIGGER tr_notify_gps_update
  AFTER INSERT OR UPDATE ON gps_locations
  FOR EACH ROW EXECUTE FUNCTION notify_gps_update();

-- 7. SEED DATA (Demo)
INSERT INTO vehicles (name, plate_number, type, status, driver_name, fuel_level) VALUES
  ('Fleet Cruiser 01', 'MH-01-AB-1234', 'sedan', 'available', 'Rahul Sharma', 85),
  ('Fleet Cruiser 02', 'MH-01-CD-5678', 'sedan', 'in_use', 'Priya Patel', 62),
  ('Cargo Hauler 01', 'MH-02-EF-9012', 'truck', 'in_use', 'Amit Kumar', 45),
  ('City Runner 01', 'DL-03-GH-3456', 'van', 'maintenance', 'Suresh Reddy', 30),
  ('Highway Star 01', 'KA-04-IJ-7890', 'suv', 'available', 'Deepa Nair', 92),
  ('Metro Express 01', 'TN-05-KL-2345', 'bus', 'in_use', 'Vijay Singh', 55),
  ('Swift Rider 01', 'GJ-06-MN-6789', 'motorcycle', 'available', 'Karan Mehta', 78),
  ('Fleet Cruiser 03', 'RJ-07-OP-0123', 'sedan', 'offline', 'Neha Gupta', 10),
  ('Cargo Hauler 02', 'UP-08-QR-4567', 'truck', 'available', 'Ravi Verma', 70),
  ('City Runner 02', 'MP-09-ST-8901', 'van', 'in_use', 'Anita Desai', 38)
ON CONFLICT (plate_number) DO NOTHING;

-- Seed initial locations
DO $$
DECLARE
  v_id UUID;
BEGIN
  FOR v_id IN SELECT id FROM vehicles LOOP
    INSERT INTO gps_locations (vehicle_id, latitude, longitude, speed, heading)
    VALUES (v_id, 19.076 + (random()-0.5)*0.1, 72.877 + (random()-0.5)*0.1, random()*60, random()*360);
  END LOOP;
END $$;
