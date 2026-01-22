-- Create sample listings for existing users
-- We'll split 20 listings between the 2 existing users (10 each) instead of 5 users

WITH existing_users AS (
  SELECT user_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.profiles 
  LIMIT 2
), sample_data AS (
  SELECT * FROM (VALUES
    (1, 'Industrial Conveyor Belt System', 'High-capacity conveyor system for warehouse operations, 50m length, includes motor and controls.', 15500, 'Industrial Equipment', 'Like New', 'Paris, France', 'https://picsum.photos/seed/conveyor/400/300'),
    (2, 'Caterpillar Excavator 320D', 'Professional grade excavator, 2019 model, 1200 hours, full service history available.', 85000, 'Construction Machinery', 'Used', 'Berlin, Germany', 'https://picsum.photos/seed/excavator/400/300'),
    (3, 'Commercial Coffee Machine Setup', 'Complete commercial coffee setup including espresso machine, grinder, and accessories.', 3200, 'Office Equipment', 'New', 'Amsterdam, Netherlands', 'https://picsum.photos/seed/coffee/400/300'),
    (4, 'Warehouse Forklift - Toyota 8FBE20', 'Electric forklift, 2000kg capacity, battery included, maintenance records available.', 22000, 'Industrial Equipment', 'Used', 'Lyon, France', 'https://picsum.photos/seed/forklift/400/300'),
    (5, '3D Printer Industrial Grade', 'Large format 3D printer suitable for prototyping and small batch production.', 45000, 'Industrial Equipment', 'Like New', 'Munich, Germany', 'https://picsum.photos/seed/printer3d/400/300'),
    (6, 'Office Furniture Package - 50 Desks', 'Complete office setup including 50 ergonomic desks, chairs, and storage units.', 8500, 'Office Equipment', 'New', 'Brussels, Belgium', 'https://picsum.photos/seed/office/400/300'),
    (7, 'CNC Milling Machine', 'Professional CNC milling machine with automated controls and precision tooling.', 75000, 'Industrial Equipment', 'Used', 'Frankfurt, Germany', 'https://picsum.photos/seed/cnc/400/300'),
    (8, 'Commercial Kitchen Equipment', 'Complete commercial kitchen setup including ovens, refrigeration, and prep tables.', 12000, 'Office Equipment', 'Like New', 'Rotterdam, Netherlands', 'https://picsum.photos/seed/kitchen/400/300'),
    (9, 'Construction Crane - Tower Crane', 'Heavy-duty tower crane suitable for high-rise construction projects.', 150000, 'Construction Machinery', 'Used', 'Vienna, Austria', 'https://picsum.photos/seed/crane/400/300'),
    (10, 'Server Rack Equipment', 'Complete server rack with networking equipment and backup power systems.', 25000, 'Technology Hardware', 'Like New', 'Zurich, Switzerland', 'https://picsum.photos/seed/server/400/300'),
    (11, 'Packaging Machine Line', 'Automated packaging line with conveyor systems and quality control sensors.', 95000, 'Industrial Equipment', 'New', 'Milan, Italy', 'https://picsum.photos/seed/packaging/400/300'),
    (12, 'Medical Equipment - X-Ray Machine', 'Digital X-ray machine with modern imaging capabilities and software.', 180000, 'Technology Hardware', 'Used', 'Barcelona, Spain', 'https://picsum.photos/seed/xray/400/300'),
    (13, 'Warehouse Shelving System', 'Industrial shelving system with 50 units, perfect for warehouse storage.', 8900, 'Industrial Equipment', 'New', 'Prague, Czech Republic', 'https://picsum.photos/seed/shelving/400/300'),
    (14, 'Electric Vehicle Charging Station', 'Commercial EV charging station with multiple ports and payment system.', 35000, 'Technology Hardware', 'New', 'Oslo, Norway', 'https://picsum.photos/seed/evcharger/400/300'),
    (15, 'Conference Room Setup', 'Complete conference room with video conferencing equipment and furniture.', 15000, 'Office Equipment', 'Like New', 'Stockholm, Sweden', 'https://picsum.photos/seed/conference/400/300'),
    (16, 'Solar Panel Installation Kit', 'Commercial solar panel system with inverters and monitoring equipment.', 65000, 'Technology Hardware', 'New', 'Madrid, Spain', 'https://picsum.photos/seed/solar/400/300'),
    (17, 'Bulldozer CAT D6', 'Heavy construction bulldozer in excellent working condition with low hours.', 120000, 'Construction Machinery', 'Used', 'Warsaw, Poland', 'https://picsum.photos/seed/bulldozer/400/300'),
    (18, 'Restaurant Equipment Package', 'Complete restaurant setup including tables, chairs, kitchen equipment.', 28000, 'Office Equipment', 'Used', 'Budapest, Hungary', 'https://picsum.photos/seed/restaurant/400/300'),
    (19, 'Printing Press Machine', 'Industrial printing press for high-volume commercial printing operations.', 85000, 'Industrial Equipment', 'Refurbished', 'Dublin, Ireland', 'https://picsum.photos/seed/printing/400/300'),
    (20, 'Security Camera System', 'Complete security system with 20 cameras, recording equipment, and monitoring software.', 18000, 'Technology Hardware', 'New', 'Copenhagen, Denmark', 'https://picsum.photos/seed/security/400/300')
  ) AS t(id, title, description, price, category_name, condition_name, location, image_url)
)
INSERT INTO public.listings (title, description, price, category_id, condition_id, location, images, status, user_id)
SELECT 
  sd.title,
  sd.description,
  sd.price,
  c.id as category_id,
  cond.id as condition_id,
  sd.location,
  ARRAY[sd.image_url] as images,
  'published' as status,
  -- Alternate between the two users (user 1 gets odds, user 2 gets evens)
  CASE WHEN sd.id % 2 = 1 THEN 
    (SELECT user_id FROM existing_users WHERE rn = 1)
  ELSE 
    (SELECT user_id FROM existing_users WHERE rn = 2)
  END as user_id
FROM sample_data sd
JOIN public.categories c ON c.name = sd.category_name
JOIN public.conditions cond ON cond.name = sd.condition_name;