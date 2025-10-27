const { NestFactory } = require('@nestjs/core');

let app;

async function bootstrap() {
  if (app) return app;
  
  try {
    // Carrega o AppModule dinamicamente
    const { AppModule } = require('../dist/app.module');
    
    app = await NestFactory.create(AppModule, {
      logger: false,
    });
    
    app.enableCors();
    await app.init();
    
    return app;
  } catch (error) {
    console.error('Bootstrap error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    const nestApp = await bootstrap();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: error.message });
  }
};