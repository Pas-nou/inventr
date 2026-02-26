import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { default as helmet } from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP header security
  app.use(helmet());

  // CORS - only the frontend is allowed
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'https://localhost:4200',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
