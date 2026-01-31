// Middleware to add full URLs to image fields in API responses
const imageUrlsMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Helper function to get full URL
    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return null;
      
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Get the base URL from request host (more reliable than env var)
      const protocol = req.protocol || 'https';
      const host = req.get('host') || 'damac-backend-xssr.onrender.com';
      const baseUrl = `${protocol}://${host}`;
      
      // Remove leading slash if present to avoid double slashes
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      
      return `${baseUrl}/${cleanPath}`;
    };
    
    // Helper function to process object recursively
    const processObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => processObject(item));
      } else if (obj && typeof obj === 'object') {
        const processed = { ...obj };
        
        // Process common image field names
        const imageFields = ['img', 'image', 'logo', 'photo', 'picture', 'avatar', 'thumbnail'];
        
        imageFields.forEach(field => {
          if (processed[field]) {
            processed[field] = getFullImageUrl(processed[field]);
          }
        });
        
        // Process all other properties recursively
        Object.keys(processed).forEach(key => {
          if (typeof processed[key] === 'object' && processed[key] !== null) {
            processed[key] = processObject(processed[key]);
          }
        });
        
        return processed;
      }
      return obj;
    };
    
    // Process the data
    const processedData = processObject(data);
    
    return originalJson.call(this, processedData);
  };
  
  next();
};

export default imageUrlsMiddleware;
