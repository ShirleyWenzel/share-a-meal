require('dotenv').config(); 
const app = require('./index');

const PORT = process.env.PORT || 3000;

// Start de server alleen als dit bestand direct wordt uitgevoerd
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server draait op poort ${PORT}`);
    if (process.env.RENDER) {
      console.log('🌍 Live op je Render URL 🎉');
    } else {
      console.log(`🔧 Lokale omgeving: http://localhost:${PORT}`);
    }
  });
}
