import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueryErrorFilter } from './common/filters/query-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new QueryErrorFilter());
const port =
  Number(process.env.PORT) ||
  5000;

await app.listen(port, '0.0.0.0');
console.log(`API listening on http://localhost:${port}`);
}
bootstrap();