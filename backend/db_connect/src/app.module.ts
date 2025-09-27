import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from './student/student.module';
import { Student } from './student/student.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'your-db-username',
      password: 'your-db-password',
      database: 'contact_form_db',
      entities: [Student],  // entity
      synchronize: true,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    }),
    ContactModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
