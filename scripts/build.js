const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

const filesToCopy = [
  { src: 'Tomato .html', dest: 'index.html' },
  { src: 'Tomato.css', dest: 'Tomato.css' },
  { src: 'Tomato.js', dest: 'Tomato.js' }
];

async function copyFile(src, dest) {
  const srcPath = path.join(root, src);
  const destPath = path.join(distDir, dest);
  await fs.promises.copyFile(srcPath, destPath);
  console.log(`Copied ${src} → ${path.relative(root, destPath)}`);
}

async function copyDir(srcDir, destDir) {
  const srcPath = path.join(root, srcDir);
  const destPath = path.join(distDir, destDir);
  await fs.promises.mkdir(destPath, { recursive: true });
  const entries = await fs.promises.readdir(srcPath, { withFileTypes: true });
  for (const entry of entries) {
    const srcEntry = path.join(srcDir, entry.name);
    const destEntry = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcEntry, destEntry);
    } else if (entry.isFile()) {
      await fs.promises.copyFile(path.join(root, srcEntry), path.join(distDir, destEntry));
      console.log(`Copied ${srcEntry} → ${path.relative(root, path.join(distDir, destEntry))}`);
    }
  }
}

async function main() {
  await fs.promises.rm(distDir, { recursive: true, force: true });
  await fs.promises.mkdir(distDir, { recursive: true });

  for (const file of filesToCopy) {
    const srcPath = path.join(root, file.src);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing file: ${file.src}`);
    }
    await copyFile(file.src, file.dest);
  }

  const imagesDir = path.join(root, 'images');
  if (fs.existsSync(imagesDir)) {
    await copyDir('images', 'images');
  }

  console.log('Static dist folder created at dist/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
