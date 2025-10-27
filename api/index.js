const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');

let app;

async function createNestServer() {
  if (!app) {
    try {
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });
      
      app.enableCors({
        origin: true,
        credentials: true,
      });
      
      // Configura para funcionar com Vercel
      app.setGlobalPrefix('');
      
      await app.init();
    } catch (error) {
      console.error('Failed to create Nest application:', error);
      throw error;
    }
  }
  return app;
}

module.exports = async (req, res) => {
  try {
    const nestApp = await createNestServer();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    
    // Adiciona headers necessários
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    return expressApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};