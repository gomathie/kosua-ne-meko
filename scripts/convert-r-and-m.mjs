import sharp from 'sharp';

async function convertImage() {
  try {
    await sharp('C:\\Users\\gomat\\.gemini\\antigravity-ide\\brain\\dba54427-69ec-41d1-8c09-47f7a78388db\\.user_uploaded\\media_1787818279052.jpg')
      .webp({ quality: 80 })
      .toFile('c:\\Users\\gomat\\Downloads\\DEV PROJECTS\\kosua-ne-meko\\public\\logos\\r-and-m-vibes.webp');
    console.log('Conversion successful');
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

convertImage();
