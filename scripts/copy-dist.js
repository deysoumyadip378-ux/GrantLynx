import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve('frontend/dist');
const dest = path.resolve('dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log('✓ Successfully synchronized frontend/dist to root dist/ for Netlify deployment');
} else {
  console.error('Error: frontend/dist does not exist. Run frontend build first.');
  process.exit(1);
}
