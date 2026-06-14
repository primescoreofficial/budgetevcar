import { supabase } from './supabase';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80';

// -------------------- HELPERS --------------------

function withPlaceholderImage(car) {
  return {
    ...car,
    vehicle_image:
      car.vehicle_image && car.vehicle_image.trim() !== ''
        ? car.vehicle_image
        : PLACEHOLDER_IMAGE,
  };
}

function withPlaceholderImages(cars) {
  return (cars || []).map(withPlaceholderImage);
}

// -------------------- GET ALL CARS --------------------

export async function getAllCars() {
  const { data, error } = await supabase.from('cars').select('*');

  if (error) {
    console.error('Error fetching cars:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

// -------------------- GET CAR BY SERIAL --------------------

export async function getCarBySerialNo(serialNo) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('serial_no', serialNo)
    .single();

  if (error) {
    console.error('Error fetching car:', error);
    return null;
  }

  return data ? withPlaceholderImage(data) : null;
}

// -------------------- FILTERS --------------------

export async function getCarsByBrand(brand) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .ilike('brand', `%${brand}%`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cars by brand:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

export async function getCarsBySegment(segment) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .ilike('segment', `%${segment}%`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cars by segment:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

export async function getCarsByBodyType(bodyType) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .ilike('body_type', `%${bodyType}%`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cars by body type:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

// -------------------- BATTERY RANGE --------------------

export async function getCarsByBatteryRange(min, max) {
  let query = supabase.from('cars').select('*');

  if (min !== undefined && min !== null) {
    query = query.gte('battery_capacity', min);
  }

  if (max !== undefined && max !== null) {
    query = query.lte('battery_capacity', max);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cars by battery range:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

// -------------------- SEARCH --------------------

export async function searchCars(queryStr) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .or(
      `brand.ilike.%${queryStr}%,model_name.ilike.%${queryStr}%,detailed_name.ilike.%${queryStr}%`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error searching cars:', error);
    return [];
  }

  return withPlaceholderImages(data);
}

// -------------------- UNIQUE FIELDS --------------------

export async function getUniqueBrands() {
  const { data, error } = await supabase.from('cars').select('brand');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return [...new Set((data || []).map((d) => d.brand).filter(Boolean))];
}

export async function getUniqueSegments() {
  const { data, error } = await supabase.from('cars').select('segment');

  if (error) {
    console.error('Error fetching segments:', error);
    return [];
  }

  return [...new Set((data || []).map((d) => d.segment).filter(Boolean))];
}

export async function getUniqueBodyTypes() {
  const { data, error } = await supabase.from('cars').select('body_type');

  if (error) {
    console.error('Error fetching body types:', error);
    return [];
  }

  return [...new Set((data || []).map((d) => d.body_type).filter(Boolean))];
}