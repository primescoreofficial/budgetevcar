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

function getMatchScore(filename, car) {
  const cleanStr = (str) => {
    if (!str) return [];
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ') // replace special chars with space
      .split(/\s+/)
      .filter((w) => w.length > 1); // ignore single character matches
  };

  // Decode URI component to handle spaces/special characters in filename
  const decodedFilename = decodeURIComponent(filename);
  const fileWords = cleanStr(decodedFilename);
  const carWords = cleanStr(car.detailed_name || '');
  const variantWords = cleanStr(car.variant_name || '');
  const targetWords = new Set([...carWords, ...variantWords]);

  let score = 0;
  for (const word of fileWords) {
    if (targetWords.has(word)) {
      score += 1;
    }
  }
  return score;
}

export function enrichCarWithLocalImage(car) {
  if (!car) return car;
  const localImages = getCarLocalImages(car.brand, car.model_name || car.detailed_name);
  if (localImages && localImages.length > 0) {
    if (localImages.length === 1) {
      return {
        ...car,
        vehicle_image: localImages[0]
      };
    }

    // Score all local images
    const scoredImages = localImages.map((img) => {
      const score = getMatchScore(img, car);
      return { img, score };
    });

    // Find highest score
    const maxScore = Math.max(...scoredImages.map(si => si.score));
    
    let candidateImages = [];
    if (maxScore > 0) {
      candidateImages = scoredImages.filter(si => si.score === maxScore).map(si => si.img);
    } else {
      candidateImages = localImages;
    }

    if (candidateImages.length === 1) {
      return {
        ...car,
        vehicle_image: candidateImages[0]
      };
    }

    // Deterministically pick from candidates
    const seed = car.detailed_name || car.variant_name || String(car.serial_no || '');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % candidateImages.length;

    return {
      ...car,
      vehicle_image: candidateImages[index]
    };
  }
  return car;
}

export function enrichCarsWithLocalImages(cars) {
  if (!cars || !Array.isArray(cars)) return [];
  return cars.map(enrichCarWithLocalImage);
}
