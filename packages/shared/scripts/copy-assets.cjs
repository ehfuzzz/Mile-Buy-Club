const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve(__dirname, '..', 'src');
const distRoot = path.resolve(__dirname, '..', 'dist');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyJsonFiles(srcDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const relativePath = path.relative(srcRoot, srcPath);
    const distPath = path.join(distRoot, relativePath);

    if (entry.isDirectory()) {
      copyJsonFiles(srcPath);
    } else if (entry.isFile() && srcPath.endsWith('.json')) {
      ensureDirSync(path.dirname(distPath));
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

if (!fs.existsSync(distRoot)) {
  throw new Error('Shared package build output missing: run "npm run build:ts" before copying assets.');
}

copyJsonFiles(srcRoot);
