import sharp from 'sharp';

async function mergeImages() {
  try {
    const img1Path = 'C:\\Users\\gomat\\.gemini\\antigravity-ide\\brain\\71bb67c6-8f0a-405c-a218-2debfd033ff4\\.user_uploaded\\media_1788046585972.jpg';
    const img2Path = 'C:\\Users\\gomat\\.gemini\\antigravity-ide\\brain\\71bb67c6-8f0a-405c-a218-2debfd033ff4\\.user_uploaded\\media_1788046585980.jpg';

    // Resize both to height 600
    const img1Buffer = await sharp(img1Path).resize({ height: 600 }).toBuffer();
    const img2Buffer = await sharp(img2Path).resize({ height: 600 }).toBuffer();

    const img1Meta = await sharp(img1Buffer).metadata();
    const img2Meta = await sharp(img2Buffer).metadata();

    const totalWidth = img1Meta.width + img2Meta.width;
    const height = 600;

    await sharp({
      create: {
        width: totalWidth,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([
      { input: img1Buffer, left: 0, top: 0 },
      { input: img2Buffer, left: img1Meta.width, top: 0 }
    ])
    .webp({ quality: 80 })
    .toFile('c:\\Users\\gomat\\Downloads\\DEV PROJECTS\\kosua-ne-meko\\public\\logos\\baysas.webp');

    console.log('Merged image saved as baysas.webp');
  } catch (error) {
    console.error('Error merging images:', error);
  }
}

mergeImages();
