const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

try {
  // Query all tracked files under public/EV Cars and public/EV Cars Interior using git ls-files
  console.log('Querying git tracked files...');
  const stdout = execSync('git ls-files "public/EV Cars" "public/EV Cars Interior"', { encoding: 'utf8' });
  const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);

  const supportedExtensions = ['.webp', '.avif', '.png', '.jpg', '.jpeg'];
  const cache = {};

  // Manifest maps brand -> models -> exterior images
  const manifestPath = path.join(__dirname, '..', 'lib', 'carImagesManifest.json');
  const carImagesManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Initialize keys from the original manifest to keep matching consistent
  Object.keys(carImagesManifest).forEach(brand => {
    const models = carImagesManifest[brand];
    Object.keys(models).forEach(model => {
      const cacheKey = `${normalize(brand)}/${normalize(model)}`;
      cache[cacheKey] = {
        exterior: { label: 'Exterior', images: [] },
        interior: { label: 'Interior', images: [] }
      };
    });
  });

  lines.forEach(filePath => {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExtensions.includes(ext)) return;

    // Split path to identify brand, model, and category
    // Examples:
    // public/EV Cars/EV Cars/Audi/e-tron-gt/image.png
    // public/EV Cars Interior/Mahindra/Be-6/1.webp
    const parts = filePath.split('/');
    if (parts[1] === 'EV Cars') {
      // Exterior: parts[0]='public', parts[1]='EV Cars', parts[2]='EV Cars', parts[3]=Brand, parts[4]=Model
      if (parts.length >= 6) {
        const brand = parts[3];
        const model = parts[4];
        const cacheKey = `${normalize(brand)}/${normalize(model)}`;
        
        if (!cache[cacheKey]) {
          cache[cacheKey] = {
            exterior: { label: 'Exterior', images: [] },
            interior: { label: 'Interior', images: [] }
          };
        }
        cache[cacheKey].exterior.images.push('/' + parts.slice(1).join('/'));
      }
    } else if (parts[1] === 'EV Cars Interior') {
      // Interior: parts[0]='public', parts[1]='EV Cars Interior', parts[2]=Brand, parts[3]=Model
      if (parts.length >= 5) {
        const brand = parts[2];
        const model = parts[3];
        const cacheKey = `${normalize(brand)}/${normalize(model)}`;
        
        if (!cache[cacheKey]) {
          cache[cacheKey] = {
            exterior: { label: 'Exterior', images: [] },
            interior: { label: 'Interior', images: [] }
          };
        }
        cache[cacheKey].interior.images.push('/' + parts.slice(1).join('/'));
      }
    }
  });

  // Sort images naturally for consistency
  Object.keys(cache).forEach(cacheKey => {
    cache[cacheKey].exterior.images.sort(naturalSort);
    cache[cacheKey].interior.images.sort(naturalSort);
  });

  const cacheManifestPath = path.join(__dirname, '..', 'lib', 'carImagesCacheManifest.json');
  fs.writeFileSync(cacheManifestPath, JSON.stringify(cache, null, 2), 'utf8');
  console.log('Successfully generated git-cased carImagesCacheManifest.json!');
} catch (error) {
  console.error('Failed to generate manifest from git:', error);
}
