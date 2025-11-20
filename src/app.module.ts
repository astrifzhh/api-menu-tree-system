import { Module } from '@nestjs/common';
import { DatabaseModule } from './module/database/database.module';
import { MenusModule } from './module/menu/menu.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MenusModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
