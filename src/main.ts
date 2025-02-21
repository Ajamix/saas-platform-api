import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalSettingsSeeder } from './database/seeders/global-settings.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Keep this - it's our single source of API prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation pipes with transform enabled
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Run database seeders
  const globalSettingsSeeder = app.get(GlobalSettingsSeeder);
  await globalSettingsSeeder.seed();

  // Setup Swagger with proper configuration
  AppModule.setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
