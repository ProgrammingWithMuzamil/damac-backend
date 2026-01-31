import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Property, Collaboration, Slide, YourPerfect, SidebarCard, DAMAC, sequelize } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple 1x1 pixel PNG as placeholder
const createPlaceholderImage = () => {
  // This is a 1x1 transparent PNG in base64
  return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
};

const createMissingImages = async () => {
  try {
    console.log('🖼️ Creating missing images for all records...');
    
    // Ensure all upload directories exist
    const uploadDirs = [
      'uploads/slides',
      'uploads/properties', 
      'uploads/collaborations',
      'uploads/yourperfect',
      'uploads/sidebarcard',
      'uploads/damac'
    ];
    
    uploadDirs.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
    
    const placeholderImage = createPlaceholderImage();
    let createdCount = 0;
    
    // Process each model
    const models = [
      { name: 'Properties', model: Property },
      { name: 'Collaborations', model: Collaboration },
      { name: 'Slides', model: Slide },
      { name: 'YourPerfect', model: YourPerfect },
      { name: 'SidebarCard', model: SidebarCard },
      { name: 'DAMAC', model: DAMAC }
    ];
    
    for (const { name, model } of models) {
      try {
        console.log(`\n📁 Processing ${name}...`);
        const records = await model.findAll();
        
        for (const record of records) {
          // Check and create img field
          if (record.img) {
            const imgPath = path.join(__dirname, record.img);
            if (!fs.existsSync(imgPath)) {
              // Ensure directory exists
              const dir = path.dirname(imgPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              
              fs.writeFileSync(imgPath, placeholderImage);
              console.log(`  📝 Created placeholder: ${record.img}`);
              createdCount++;
            }
          }
          
          // Check and create logo field (for collaborations)
          if (record.logo) {
            const logoPath = path.join(__dirname, record.logo);
            if (!fs.existsSync(logoPath)) {
              const dir = path.dirname(logoPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              
              fs.writeFileSync(logoPath, placeholderImage);
              console.log(`  📝 Created placeholder: ${record.logo}`);
              createdCount++;
            }
          }
        }
        
        console.log(`✅ ${name}: Processed ${records.length} records`);
      } catch (error) {
        console.log(`❌ Error processing ${name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Created ${createdCount} missing image files!`);
    console.log('📁 All upload directories are ready');
    console.log('🔄 Deploy to see the changes');
    
  } catch (error) {
    console.error('❌ Error creating missing images:', error);
  } finally {
    await sequelize.close();
  }
};

createMissingImages();
