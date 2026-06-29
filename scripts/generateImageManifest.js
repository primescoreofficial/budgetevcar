const fs = require('fs');
const path = require('path');

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

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getInteriorBrandFolder(brand) {
  const key = brand.toLowerCase();
  return brandToInteriorFolder[key] || brand;
}

function getInteriorModelFolder(model) {
  const key = model.toLowerCase();
  return modelToInteriorFolder[key] || model;
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

const CATEGORIES_CONFIG = {
  exterior: {
    getPath: (brandFolder, modelFolder) => path.join(__dirname, '..', 'public', 'EV Cars', 'EV Cars', brandFolder, modelFolder),
    getUrlPrefix: (brandFolder, modelFolder) => `/EV Cars/EV Cars/${brandFolder}/${modelFolder}`
  },
  interior: {
    getPath: (brandFolder, modelFolder) => path.join(__dirname, '..', 'public', 'EV Cars Interior', getInteriorBrandFolder(brandFolder), getInteriorModelFolder(modelFolder)),
    getUrlPrefix: (brandFolder, modelFolder) => `/EV Cars Interior/${getInteriorBrandFolder(brandFolder)}/${getInteriorModelFolder(modelFolder)}`
  }
};

const manifestPath = path.join(__dirname, '..', 'lib', 'carImagesManifest.json');
const carImagesManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const cache = {};
const supportedExtensions = ['.webp', '.avif', '.png', '.jpg', '.jpeg'];

Object.keys(carImagesManifest).forEach(brand => {
  const models = carImagesManifest[brand];
  Object.keys(models).forEach(model => {
    const cacheKey = `${normalize(brand)}/${normalize(model)}`;
    
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
        label: catKey === 'exterior' ? 'Exterior' : 'Interior',
        images: images
      };
    });

    cache[cacheKey] = resolvedCategories;
  });
});

const cacheManifestPath = path.join(__dirname, '..', 'lib', 'carImagesCacheManifest.json');
fs.writeFileSync(cacheManifestPath, JSON.stringify(cache, null, 2), 'utf8');
console.log('Successfully generated carImagesCacheManifest.json!');
