import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import crypto from 'crypto';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (res.statusCode === 200) {
        res.setEncoding('binary');
        let chunks = [];
        res.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk, 'binary'));
        });
        res.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(filepath, buffer);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${res.statusCode} ${res.statusMessage}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const isImageUrl = (str) => {
  if (typeof str !== 'string') return false;
  if (!str.startsWith('http')) return false;
  return str.includes('unsplash.com') || 
         str.includes('istockphoto.com') || 
         str.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
};

const processObject = async (obj, targetDir) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = await processObject(obj[i], targetDir);
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      obj[key] = await processObject(obj[key], targetDir);
    }
  } else if (typeof obj === 'string' && isImageUrl(obj)) {
    console.log(`Found image URL: ${obj}`);
    
    try {
      const hash = crypto.createHash('md5').update(obj).digest('hex').substring(0, 10);
      const filename = `img_${hash}.jpg`;
      const filepath = path.join(targetDir, filename);
      
      try {
        await fs.access(filepath);
        console.log(`Image already exists: ${filename}`);
      } catch (e) {
        console.log(`Downloading to: ${filename}`);
        await downloadImage(obj, filepath);
        await delay(300);
      }
      return `/images/${filename}`;
    } catch (err) {
      console.error(`Failed to process ${obj}:`, err.message);
      return obj;
    }
  }
  return obj;
};

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');
  
  try {
    await fs.mkdir(publicDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
  } catch(e) {}

  const filesToProcess = [
    path.join(process.cwd(), 'src', 'data', 'db.json'),
    path.join(process.cwd(), 'src', 'data', 'collections.json')
  ];

  for (const file of filesToProcess) {
    console.log(`\nProcessing ${file}...`);
    try {
      const data = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(data);
      const processed = await processObject(json, imagesDir);
      await fs.writeFile(file, JSON.stringify(processed, null, 2));
      console.log(`Successfully updated ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

main().catch(console.error);
