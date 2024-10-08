import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationModule } from 'config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { ExpenseModule } from './expense/expense.module';
import { Expense } from './expense/entities/expense.entity';
import { ExpenseItemsModule } from './expense_items/expense_items.module';
import { ExpenseItem } from './expense_items/entities/expense_item.entity';
import { ReportsModule } from './reports/reports.module';
import { Report } from './reports/entities/report.entity';
import { OrganizationModule } from './organizations/organizations.module'; // Adjust the path if necessary
import { Organization } from './organizations/entities/organization.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigurationModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: +ConfigService.get('DB_PORT'),
        username: ConfigService.get('DB_USERNAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_NAME'),
        entities: [User, Category, Product, Expense, ExpenseItem, Report, Organization],
        // entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        // do NOT use synchronize: true in real projects
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthenticationModule,
    CategoriesModule,
    ProductsModule,
    ExpenseModule,
    ExpenseItemsModule,
    ReportsModule,
    OrganizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
