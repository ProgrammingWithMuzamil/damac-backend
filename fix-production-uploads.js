import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Property, Collaboration, Slide, YourPerfect, SidebarCard, DAMAC, sequelize } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixProductionUploads = async () => {
  try {
    console.log('🔧 Fixing production upload issues...');
    
    // 1. Ensure upload directories exist
    const uploadDirs = [
      'uploads',
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
    
    // 2. Check for database records with missing files
    console.log('\n🔍 Checking for orphaned database records...');
    
    const models = [
      { name: 'Properties', model: Property },
      { name: 'Collaborations', model: Collaboration },
      { name: 'Slides', model: Slide },
      { name: 'YourPerfect', model: YourPerfect },
      { name: 'SidebarCard', model: SidebarCard },
      { name: 'DAMAC', model: DAMAC }
    ];
    
    let totalOrphaned = 0;
    
    for (const { name, model } of models) {
      try {
        const records = await model.findAll();
        let orphanedCount = 0;
        
        for (const record of records) {
          const hasMissingFiles = [];
          
          // Check img field
          if (record.img) {
            const imgPath = path.join(__dirname, record.img);
            if (!fs.existsSync(imgPath)) {
              hasMissingFiles.push('img');
            }
          }
          
          // Check logo field (for collaborations)
          if (record.logo) {
            const logoPath = path.join(__dirname, record.logo);
            if (!fs.existsSync(logoPath)) {
              hasMissingFiles.push('logo');
            }
          }
          
          if (hasMissingFiles.length > 0) {
            console.log(`⚠️  ${name} ID ${record.id}: Missing ${hasMissingFiles.join(', ')}`);
            orphanedCount++;
            totalOrphaned++;
          }
        }
        
        if (orphanedCount === 0) {
          console.log(`✅ ${name}: All files present`);
        } else {
          console.log(`❌ ${name}: ${orphanedCount} records with missing files`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${name}:`, error.message);
      }
    }
    
    // 3. Create placeholder files for missing images
    if (totalOrphaned > 0) {
      console.log('\n🖼️  Creating placeholder images for missing files...');
      
      // Create a simple 1x1 pixel PNG as placeholder
      const placeholderPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      
      for (const { name, model } of models) {
        try {
          const records = await model.findAll();
          
          for (const record of records) {
            if (record.img) {
              const imgPath = path.join(__dirname, record.img);
              if (!fs.existsSync(imgPath)) {
                // Ensure directory exists
                const dir = path.dirname(imgPath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                
                // Write placeholder image
                fs.writeFileSync(imgPath, placeholderPNG);
                console.log(`📝 Created placeholder for ${name} ID ${record.id}: ${record.img}`);
              }
            }
            
            if (record.logo) {
              const logoPath = path.join(__dirname, record.logo);
              if (!fs.existsSync(logoPath)) {
                const dir = path.dirname(logoPath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(logoPath, placeholderPNG);
                console.log(`📝 Created placeholder for ${name} ID ${record.id}: ${record.logo}`);
              }
            }
          }
        } catch (error) {
          console.log(`❌ Error fixing ${name}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Production upload fix completed!');
    console.log('📁 Upload directories are ready');
    console.log('🖼️  Missing images have placeholder files');
    console.log('🔄 Redeploy your application to apply changes');
    
  } catch (error) {
    console.error('❌ Error fixing production uploads:', error);
  } finally {
    await sequelize.close();
  }
};

fixProductionUploads();
