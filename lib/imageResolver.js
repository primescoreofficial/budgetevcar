import fs from 'fs';
import path from 'path';
import carImagesManifest from './carImagesManifest.json';

// Helper to normalize strings for robust comparison (handles lowercase, accents, special chars)
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD') // Normalizes unicode characters (like ë to e)
    .replace(/[\u0300-\u036f]/g, '') // Strips combining diacritical marks
    .replace(/[^a-z0-9]/g, ''); // Removes any non-alphanumeric character
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

const brandToInteriorFolder = {
  'tata-motors': 'Tata',
  'tata': 'Tata',
  'hyundai': 'Hyndai',
  'mg-jsw-mg-motor': 'Mg',
  'mg': 'Mg',
  'mercedes-benz': 'Mercedes',
  'mercedes': 'Mercedes',
  'bmw': 'Bmw',
  'byd': 'Byd',
  'audi': 'Audi',
  'citroen': 'Citroen',
  'kia': 'Kia',
  'mahindra': 'Mahindra',
  'maruti-suzuki': 'Maruti-suzuki',
  'tesla': 'Tesla',
  'toyota': 'Toyota',
  'vinfast': 'Vinfast',
  'volvo': 'Volvo',
};

const modelToInteriorFolder = {
  'creta-electric': 'creata-electric',
};

function getInteriorBrandFolder(brand) {
  const key = brand.toLowerCase();
  return brandToInteriorFolder[key] || brand;
}

function getInteriorModelFolder(model) {
  const key = model.toLowerCase();
  return modelToInteriorFolder[key] || model;
}

const CATEGORIES_CONFIG = {
  exterior: {
    label: 'Exterior',
    getPath: (brandFolder, modelFolder) => path.join(process.cwd(), 'public', 'EV Cars', 'EV Cars', brandFolder, modelFolder),
    getUrlPrefix: (brandFolder, modelFolder) => `/EV Cars/EV Cars/${brandFolder}/${modelFolder}`
  },
  interior: {
    label: 'Interior',
    getPath: (brandFolder, modelFolder) => path.join(process.cwd(), 'public', 'EV Cars Interior', getInteriorBrandFolder(brandFolder), getInteriorModelFolder(modelFolder)),
    getUrlPrefix: (brandFolder, modelFolder) => `/EV Cars Interior/${getInteriorBrandFolder(brandFolder)}/${getInteriorModelFolder(modelFolder)}`
  }
};

let carImagesCache = null;

function initializeCarImagesCache() {
  if (carImagesCache) return carImagesCache;

  const cache = {};
  const supportedExtensions = ['.webp', '.avif', '.png', '.jpg', '.jpeg'];

  try {
    Object.keys(carImagesManifest).forEach(brand => {
      const models = carImagesManifest[brand];
      Object.keys(models).forEach(model => {
        const cacheKey = `${normalize(brand)}/${normalize(model)}`;
        
        // Determine original folders from manifest sample
        let extBrandFolder = brand;
        let extModelFolder = model;
        const sampleList = models[model];
        if (sampleList && sampleList.length > 0) {
          const parts = sampleList[0].split('/');
          if (parts.length >= 6) {
            extBrandFolder = parts[3];
            extModelFolder = parts[4];
          }
        }

        const resolvedCategories = {};
        Object.keys(CATEGORIES_CONFIG).forEach(catKey => {
          const cat = CATEGORIES_CONFIG[catKey];
          const folderPath = cat.getPath(extBrandFolder, extModelFolder);
          let images = [];
          if (fs.existsSync(folderPath)) {
            try {
              images = fs.readdirSync(folderPath)
                .filter(f => supportedExtensions.includes(path.extname(f).toLowerCase()))
                .sort(naturalSort)
                .map(f => `${cat.getUrlPrefix(extBrandFolder, extModelFolder)}/${f}`);
            } catch (e) {
              console.error(`Error reading directory for category ${catKey} at ${folderPath}:`, e);
            }
          }
          resolvedCategories[catKey] = {
            label: cat.label,
            images: images
          };
        });

        cache[cacheKey] = resolvedCategories;
      });
    });
  } catch (error) {
    console.error('Failed to build car images cache:', error);
  }

  carImagesCache = cache;
  return carImagesCache;
}

export function getCarImagesCategorized(brand, modelName) {
  const cache = initializeCarImagesCache();
  const brandNorm = normalize(brand);
  const modelNorm = normalize(modelName);

  const cacheKey = `${brandNorm}/${modelNorm}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const matchedKey = Object.keys(cache).find(k => {
    return k === cacheKey || k.includes(cacheKey) || cacheKey.includes(k);
  });

  if (matchedKey && cache[matchedKey]) {
    return cache[matchedKey];
  }

  const emptyResult = {};
  Object.keys(CATEGORIES_CONFIG).forEach(catKey => {
    emptyResult[catKey] = {
      label: CATEGORIES_CONFIG[catKey].label,
      images: []
    };
  });
  return emptyResult;
}

export function getCarLocalImages(brand, modelName) {
  try {
    const targetBrandNorm = normalize(brand);
    
    // Find matching brand key in manifest
    const matchedBrandKey = Object.keys(carImagesManifest).find(
      (key) => normalize(key) === targetBrandNorm
    );

    if (!matchedBrandKey) {
      return [];
    }

    const models = carImagesManifest[matchedBrandKey];
    const targetModelNorm = normalize(modelName);

    // 1. Try exact match
    let matchedModelKey = Object.keys(models).find(
      (key) => normalize(key) === targetModelNorm
    );

    // 2. Try prefix/substring match if no exact match (e.g. windsorevpro matching windsor-ev)
    if (!matchedModelKey) {
      matchedModelKey = Object.keys(models).find(
        (key) => {
          const keyNorm = normalize(key);
          return targetModelNorm.includes(keyNorm) || keyNorm.includes(targetModelNorm);
        }
      );
    }

    if (matchedModelKey) {
      return models[matchedModelKey];
    }

    // 3. Fallback: return ALL images for this brand and let scoring function decide
    const allBrandImages = [];
    Object.keys(models).forEach((key) => {
      allBrandImages.push(...models[key]);
    });
    return allBrandImages;
  } catch (error) {
    console.error('Error reading local car images from manifest:', error);
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
