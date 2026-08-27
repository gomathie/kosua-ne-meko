import sharp from 'sharp';

async function convertImages() {
  try {
    // Bite Mogul
    await sharp('C:\\Users\\gomat\\.gemini\\antigravity-ide\\brain\\71bb67c6-8f0a-405c-a218-2debfd033ff4\\.user_uploaded\\media_1787862548829.jpg')
      .webp({ quality: 80 })
      .toFile('c:\\Users\\gomat\\Downloads\\DEV PROJECTS\\kosua-ne-meko\\public\\logos\\bite-mogul.webp');
    console.log('Bite Mogul converted');

    // Waakye On The Go
    await sharp('C:\\Users\\gomat\\.gemini\\antigravity-ide\\brain\\71bb67c6-8f0a-405c-a218-2debfd033ff4\\.user_uploaded\\media_1787862870085.jpg')
      .webp({ quality: 80 })
      .toFile('c:\\Users\\gomat\\Downloads\\DEV PROJECTS\\kosua-ne-meko\\public\\logos\\waakye-on-the-go.webp');
    console.log('Waakye converted');
  } catch (error) {
    console.error('Error converting images:', error);
  }
}

convertImages();
