-- Create test users data and listings
-- First, let's insert some test data for users and listings

-- Create test business
INSERT INTO public.businesses (name, description, affiliate_code) VALUES
('Test Business Corp', 'A test business for development', 'TESTBIZ001')
ON CONFLICT (affiliate_code) DO NOTHING;

-- Get the business ID for reference
-- We'll assume the test business exists or create sample listings without business association

-- We'll create sample listings with realistic data that references our new categories and conditions
-- First, let's create some sample listings for existing users (we'll use existing user_ids from profiles)

WITH category_conditions AS (
  SELECT 
    c.id as category_id, c.name as category_name,
    cond.id as condition_id, cond.name as condition_name
  FROM public.categories c
  CROSS JOIN public.conditions cond
), sample_listings AS (
  SELECT * FROM (VALUES
    ('Industrial Conveyor Belt System', 'High-capacity conveyor system for warehouse operations, 50m length, includes motor and controls.', 15500, 'Industrial Equipment', 'Like New', 'Paris, France', '{"https://picsum.photos/seed/conveyor/400/300"}'),
    ('Caterpillar Excavator 320D', 'Professional grade excavator, 2019 model, 1200 hours, full service history available.', 85000, 'Construction Machinery', 'Used', 'Berlin, Germany', '{"https://picsum.photos/seed/excavator/400/300"}'),
    ('Commercial Coffee Machine Setup', 'Complete commercial coffee setup including espresso machine, grinder, and accessories.', 3200, 'Office Equipment', 'New', 'Amsterdam, Netherlands', '{"https://picsum.photos/seed/coffee/400/300"}'),
    ('Warehouse Forklift - Toyota 8FBE20', 'Electric forklift, 2000kg capacity, battery included, maintenance records available.', 22000, 'Industrial Equipment', 'Used', 'Lyon, France', '{"https://picsum.photos/seed/forklift/400/300"}'),
    ('3D Printer Industrial Grade', 'Large format 3D printer suitable for prototyping and small batch production.', 45000, 'Industrial Equipment', 'Like New', 'Munich, Germany', '{"https://picsum.photos/seed/printer3d/400/300"}'),
    ('Office Furniture Package - 50 Desks', 'Complete office setup including 50 ergonomic desks, chairs, and storage units.', 8500, 'Office Equipment', 'New', 'Brussels, Belgium', '{"https://picsum.photos/seed/office/400/300"}'),
    ('CNC Milling Machine', 'Professional CNC milling machine with automated controls and precision tooling.', 75000, 'Industrial Equipment', 'Used', 'Frankfurt, Germany', '{"https://picsum.photos/seed/cnc/400/300"}'),
    ('Commercial Kitchen Equipment', 'Complete commercial kitchen setup including ovens, refrigeration, and prep tables.', 12000, 'Office Equipment', 'Like New', 'Rotterdam, Netherlands', '{"https://picsum.photos/seed/kitchen/400/300"}'),
    ('Construction Crane - Tower Crane', 'Heavy-duty tower crane suitable for high-rise construction projects.', 150000, 'Construction Machinery', 'Used', 'Vienna, Austria', '{"https://picsum.photos/seed/crane/400/300"}'),
    ('Server Rack Equipment', 'Complete server rack with networking equipment and backup power systems.', 25000, 'Technology Hardware', 'Like New', 'Zurich, Switzerland', '{"https://picsum.photos/seed/server/400/300"}'),
    ('Packaging Machine Line', 'Automated packaging line with conveyor systems and quality control sensors.', 95000, 'Industrial Equipment', 'New', 'Milan, Italy', '{"https://picsum.photos/seed/packaging/400/300"}'),
    ('Medical Equipment - X-Ray Machine', 'Digital X-ray machine with modern imaging capabilities and software.', 180000, 'Technology Hardware', 'Used', 'Barcelona, Spain', '{"https://picsum.photos/seed/xray/400/300"}'),
    ('Warehouse Shelving System', 'Industrial shelving system with 50 units, perfect for warehouse storage.', 8900, 'Industrial Equipment', 'New', 'Prague, Czech Republic', '{"https://picsum.photos/seed/shelving/400/300"}'),
    ('Electric Vehicle Charging Station', 'Commercial EV charging station with multiple ports and payment system.', 35000, 'Technology Hardware', 'New', 'Oslo, Norway', '{"https://picsum.photos/seed/evcharger/400/300"}'),
    ('Conference Room Setup', 'Complete conference room with video conferencing equipment and furniture.', 15000, 'Office Equipment', 'Like New', 'Stockholm, Sweden', '{"https://picsum.photos/seed/conference/400/300"}'),
    ('Solar Panel Installation Kit', 'Commercial solar panel system with inverters and monitoring equipment.', 65000, 'Technology Hardware', 'New', 'Madrid, Spain', '{"https://picsum.photos/seed/solar/400/300"}'),
    ('Bulldozer CAT D6', 'Heavy construction bulldozer in excellent working condition with low hours.', 120000, 'Construction Machinery', 'Used', 'Warsaw, Poland', '{"https://picsum.photos/seed/bulldozer/400/300"}'),
    ('Restaurant Equipment Package', 'Complete restaurant setup including tables, chairs, kitchen equipment.', 28000, 'Office Equipment', 'Used', 'Budapest, Hungary', '{"https://picsum.photos/seed/restaurant/400/300"}'),
    ('Printing Press Machine', 'Industrial printing press for high-volume commercial printing operations.', 85000, 'Industrial Equipment', 'Refurbished', 'Dublin, Ireland', '{"https://picsum.photos/seed/printing/400/300"}'),
    ('Security Camera System', 'Complete security system with 20 cameras, recording equipment, and monitoring software.', 18000, 'Technology Hardware', 'New', 'Copenhagen, Denmark', '{"https://picsum.photos/seed/security/400/300"}')
  ) AS listings(title, description, price, category_name, condition_name, location, images)
)
INSERT INTO public.listings (title, description, price, category_id, condition_id, location, images, status, user_id)
SELECT 
  sl.title,
  sl.description,
  sl.price,
  cc.category_id,
  cc.condition_id,
  sl.location,
  sl.images::text[],
  'published',
  -- Cycle through first 5 profiles as user_ids (we'll distribute 20 listings among 5 users = 4 each)
  (SELECT user_id FROM public.profiles ORDER BY created_at LIMIT 1 OFFSET (ROW_NUMBER() OVER() - 1) % 5)
FROM sample_listings sl
JOIN category_conditions cc ON cc.category_name = sl.category_name AND cc.condition_name = sl.condition_name;