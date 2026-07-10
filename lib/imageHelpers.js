import { supabase } from './supabase';
import carImagesCacheManifest from './carImagesCacheManifest.json';

// Pre-build local images cache lookup Set
const localImagesSet = new Set();
Object.values(carImagesCacheManifest).forEach(val => {
  if (val.exterior && val.exterior.images) {
    val.exterior.images.forEach(img => localImagesSet.add(img));
  }
  if (val.interior && val.interior.images) {
    val.interior.images.forEach(img => localImagesSet.add(img));
  }
});

/**
 * Returns the resolved public URL of an image path.
 * Supports absolute URLs, local static public assets, and Supabase Storage assets.
 */
export function getImageUrl(pathString) {
  if (!pathString) return '';
  if (
    pathString.startsWith('http://') || 
    pathString.startsWith('https://') || 
    pathString.startsWith('data:')
  ) {
    return pathString;
  }

  // Check if it's in the local static public folder assets manifest
  if (localImagesSet.has(pathString)) {
    return pathString;
  }

  // Handle Supabase Storage bucket resolution
  // Format: 'car-interior/tata-nexon-ev/1.webp' or 'cars/tata-nexon-ev/1.webp'
  // Or relative-style: '/EV Cars/...' or '/EV Cars Interior/...'
  let cleanPath = pathString.startsWith('/') ? pathString.slice(1) : pathString;
  
  if (cleanPath.startsWith('car-interior/')) {
    const key = cleanPath.replace(/^car-interior\//, '');
    return supabase.storage.from('car-interior').getPublicUrl(key).data.publicUrl;
  } else if (cleanPath.startsWith('cars/')) {
    const key = cleanPath.replace(/^cars\//, '');
    return supabase.storage.from('cars').getPublicUrl(key).data.publicUrl;
  } else if (cleanPath.startsWith('logos/')) {
    const key = cleanPath.replace(/^logos\//, '');
    return supabase.storage.from('logos').getPublicUrl(key).data.publicUrl;
  } else if (cleanPath.startsWith('EV Cars Interior/')) {
    // Old legacy relative style stored in DB but fetched from storage
    return supabase.storage.from('cars').getPublicUrl(cleanPath).data.publicUrl;
  } else if (cleanPath.startsWith('EV Cars/')) {
    // Old legacy relative style
    return supabase.storage.from('cars').getPublicUrl(cleanPath).data.publicUrl;
  }

  // Default fallback: return as-is
  return pathString;
}

/**
 * Returns the resolved URL of the AI Bot Logo.
 * If pathString is missing or empty, returns the default local fallback logo.
 */
export function getBotLogo(pathString) {
  const defaultLogo = '/logo/budgetev-ai-assistant.jpg';
  if (!pathString) return defaultLogo;

  if (
    pathString.startsWith('http://') || 
    pathString.startsWith('https://') || 
    pathString.startsWith('data:')
  ) {
    return pathString;
  }

  let cleanPath = pathString.startsWith('/') ? pathString.slice(1) : pathString;

  if (cleanPath.startsWith('logos/')) {
    const key = cleanPath.replace(/^logos\//, '');
    return supabase.storage.from('logos').getPublicUrl(key).data.publicUrl;
  }

  if (cleanPath.startsWith('logo/')) {
    return '/' + cleanPath;
  }

  return getImageUrl(pathString) || defaultLogo;
}


/**
 * Resolves the primary vehicle image URL.
 */
export function getVehicleImage(car) {
  if (!car) return '';
  if (car.vehicle_image && !car.vehicle_image.includes('images.unsplash.com/photo-1593941707882-a5bba14938c7')) {
    return getImageUrl(car.vehicle_image);
  }
  // Fallback to local image resolving logic if database field is empty
  const localImages = getLocalImagesFallback(car);
  if (localImages && localImages.length > 0) {
    return localImages[0];
  }
  return 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80';
}

export function getVehicleThumbnail(car) {
  return getVehicleImage(car);
}

/**
 * Returns a sorted array of exterior image objects.
 */
export function getExteriorImages(car) {
  if (!car) return [];
  
  // 1. Prefer database exterior_images JSONB field
  if (car.exterior_images && Array.isArray(car.exterior_images) && car.exterior_images.length > 0) {
    return [...car.exterior_images]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(img => ({
        ...img,
        url: getImageUrl(img.path)
      }));
  }

  // 2. Fallback to local images manifest
  const localImages = getLocalImagesFallback(car, 'exterior');
  return localImages.map((path, idx) => ({
    path,
    url: path,
    order: idx + 1,
    alt: `${car.brand || ''} ${car.model_name || ''} Exterior View ${idx + 1}`
  }));
}

/**
 * Returns a sorted array of interior image objects.
 */
export function getInteriorImages(car) {
  if (!car) return [];

  // 1. Prefer database interior_images JSONB field
  if (car.interior_images && Array.isArray(car.interior_images) && car.interior_images.length > 0) {
    return [...car.interior_images]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(img => ({
        ...img,
        url: getImageUrl(img.path)
      }));
  }

  // 2. Fallback to local images manifest
  const localImages = getLocalImagesFallback(car, 'interior');
  return localImages.map((path, idx) => ({
    path,
    url: path,
    order: idx + 1,
    alt: `${car.brand || ''} ${car.model_name || ''} Interior View ${idx + 1}`
  }));
}

// Internal fallback using standard normalize lookup
function getLocalImagesFallback(car, category = 'exterior') {
  try {
    const brandNorm = (car.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Find matching brand key in manifest (using partial/contain match)
    const matchedKey = Object.keys(carImagesCacheManifest).find(k => {
      const kBrand = k.split('/')[0];
      return kBrand.includes(brandNorm) || brandNorm.includes(kBrand);
    });

    if (matchedKey) {
      // Find models matching under this brand
      const brandKeys = Object.keys(carImagesCacheManifest).filter(k => {
        const kBrand = k.split('/')[0];
        const targetBrand = matchedKey.split('/')[0];
        return kBrand === targetBrand;
      });

      const modelNorm = (car.model_name || car.detailed_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      // Find exact or closest model match
      const matchedModelKey = brandKeys.find(k => {
        const kModel = k.split('/')[1] || '';
        return kModel === modelNorm || kModel.includes(modelNorm) || modelNorm.includes(kModel);
      });

      if (matchedModelKey && carImagesCacheManifest[matchedModelKey]) {
        return carImagesCacheManifest[matchedModelKey][category]?.images || [];
      }
    }
  } catch (err) {
    console.warn('Fallback local image lookup failed:', err);
  }
  return [];
}
