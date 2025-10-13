import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
const port =
  Number(process.env.PORT) ||
  5000;

await app.listen(port);
console.log(`API listening on http://localhost:${port}`);
}
bootstrap();