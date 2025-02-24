import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { GlobalSettingsSeeder } from './database/seeders/global-settings.seeder';
import { PermissionSeeder } from './database/seeders/permission.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure Stripe Webhooks Receive Raw Body
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  // Configure CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'Last-Event-ID',
      'refresh-token'
    ],
    exposedHeaders: [
      'Content-Type',
      'Cache-Control',
      'Connection',
      'Last-Event-ID'
    ],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  // Run seeders
  const globalSettingsSeeder = app.get(GlobalSettingsSeeder);
  await globalSettingsSeeder.seed();

  const permissionSeeder = app.get(PermissionSeeder);
  await permissionSeeder.seed();

  // Setup Swagger with proper configuration
  AppModule.setupSwagger(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
