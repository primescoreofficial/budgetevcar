import fs from 'fs';
import path from 'path';

// Helper to normalize strings for robust comparison (handles lowercase, accents, special chars)
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD') // Normalizes unicode characters (like ë to e)
    .replace(/[\u0300-\u036f]/g, '') // Strips combining diacritical marks
    .replace(/[^a-z0-9]/g, ''); // Removes any non-alphanumeric character
}

export function getCarLocalImages(brand, modelName) {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'EV Cars', 'EV Cars');
    if (!fs.existsSync(baseDir)) {
      return [];
    }

    const brandDirs = fs.readdirSync(baseDir);
    const targetBrandNorm = normalize(brand);
    
    // Find matching brand directory
    const matchedBrandDir = brandDirs.find(
      (dir) => normalize(dir) === targetBrandNorm
    );

    if (!matchedBrandDir) {
      return [];
    }

    const brandPath = path.join(baseDir, matchedBrandDir);
    const modelDirs = fs.readdirSync(brandPath);
    const targetModelNorm = normalize(modelName);

    // Find matching model directory
    const matchedModelDir = modelDirs.find(
      (dir) => normalize(dir) === targetModelNorm
    );

    if (!matchedModelDir) {
      return [];
    }

    const modelPath = path.join(brandPath, matchedModelDir);
    const files = fs.readdirSync(modelPath);

    // Filter for image files
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        const fullPath = path.join(modelPath, file);
        try {
          const stat = fs.statSync(fullPath);
          return stat.isFile() && imageExtensions.includes(ext);
        } catch {
          return false;
        }
      })
      .map((file) => {
        // Return URL relative to public directory
        return `/EV Cars/EV Cars/${matchedBrandDir}/${matchedModelDir}/${file}`;
      });

    return images;
  } catch (error) {
    console.error('Error reading local car images:', error);
    return [];
  }
}

export function enrichCarWithLocalImage(car) {
  if (!car) return car;
  const localImages = getCarLocalImages(car.brand, car.model_name || car.detailed_name);
  if (localImages && localImages.length > 0) {
    return {
      ...car,
      vehicle_image: localImages[0]
    };
  }
  return car;
}

export function enrichCarsWithLocalImages(cars) {
  if (!cars || !Array.isArray(cars)) return [];
  return cars.map(enrichCarWithLocalImage);
}
