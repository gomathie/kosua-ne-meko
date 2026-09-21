import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function processDirectory(dir) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        if (file.name.includes('icon') || file.name.includes('favicon')) {
          console.log(`Skipping icon file: ${file.name}`);
          continue;
        }

        const outPath = fullPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
        
        try {
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(outPath);
            
          console.log(`Converted: ${file.name} -> ${path.basename(outPath)}`);
          await fs.promises.unlink(fullPath); // Delete old file
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
        }
      }
    }
  }
}

processDirectory(publicDir).then(() => console.log('All conversions complete.'));
