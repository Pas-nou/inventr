import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Asset } from './assets/entities/asset.entity';
import { AssetCategory } from './assets/enums/asset-category.enum';
import { AssetCondition } from './assets/enums/asset-condition.enum';
import { MaintenanceEvent } from './maintenance-events/entities/maintenance-event.entity';
import { MaintenanceEventType } from './maintenance-events/enums/maintenance-event-type.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const assetRepo = app.get<Repository<Asset>>(getRepositoryToken(Asset));

  // Clean
  await assetRepo.query(
    'TRUNCATE TABLE document, maintenance_event, asset, "user" CASCADE',
  );

  // User creation
  const password_hash = await bcrypt.hash('password123', 10);
  const user = userRepo.create({
    email: 'john@inventr.app',
    password_hash,
    first_name: 'John',
    last_name: 'Doe',
  });
  await userRepo.save(user);

  // Asset creation
  const assets = assetRepo.create([
    {
      name: 'MacBook Pro M3',
      category: AssetCategory.TECH,
      purchase_date: new Date('2023-11-01'),
      purchase_price_cents: 249900,
      condition: AssetCondition.GOOD,
      warranty_end_date: new Date('2026-04-01'), // expire bientôt
      notes: 'MacBook Pro 14" M3 Pro 18Go RAM',
      user,
    },
    {
      name: 'iPhone 15 Pro',
      category: AssetCategory.TECH,
      purchase_date: new Date('2023-09-22'),
      purchase_price_cents: 119900,
      condition: AssetCondition.GOOD,
      warranty_end_date: new Date('2026-03-22'), // expire bientôt
      user,
    },
    {
      name: 'Canapé Söderhamn',
      category: AssetCategory.FURNITURE,
      purchase_date: new Date('2022-06-15'),
      purchase_price_cents: 89900,
      condition: AssetCondition.USED,
      user,
    },
    {
      name: 'Peugeot 308',
      category: AssetCategory.VEHICLE,
      purchase_date: new Date('2021-03-10'),
      purchase_price_cents: 2200000,
      condition: AssetCondition.GOOD,
      warranty_end_date: new Date('2027-03-10'),
      user,
    },
    {
      name: 'Lave-vaisselle Bosch',
      category: AssetCategory.APPLIANCE,
      purchase_date: new Date('2022-01-20'),
      purchase_price_cents: 55000,
      condition: AssetCondition.GOOD,
      warranty_end_date: new Date('2027-01-20'),
      user,
    },
    {
      name: 'Vélo de route Trek',
      category: AssetCategory.SPORT,
      purchase_date: new Date('2023-04-05'),
      purchase_price_cents: 180000,
      condition: AssetCondition.GOOD,
      user,
    },
  ]);

  await assetRepo.save(assets);

  // MaintenanceEvents creation
  const maintenanceRepo = app.get<Repository<MaintenanceEvent>>(
    getRepositoryToken(MaintenanceEvent),
  );

  const macbook = assets[0];
  const peugeot = assets[3];

  const maintenanceEvents = maintenanceRepo.create([
    {
      name: 'Nettoyage ventilateur',
      type: MaintenanceEventType.CLEANING,
      date: new Date('2024-06-12'),
      cost_cents: 5000,
      notes: 'Nettoyage complet poussières internes',
      next_due_date: new Date('2025-06-01'),
      asset: macbook,
    },
    {
      name: 'Remplacement SSD',
      type: MaintenanceEventType.UPGRADE,
      date: new Date('2024-03-03'),
      cost_cents: 32000,
      notes: 'SSD 1To remplacé par 2To',
      asset: macbook,
    },
    {
      name: 'Diagnostic général',
      type: MaintenanceEventType.INSPECTION,
      date: new Date('2024-01-15'),
      cost_cents: 0,
      asset: macbook,
    },
    {
      name: 'Vidange',
      type: MaintenanceEventType.SERVICE,
      date: new Date('2024-09-15'),
      cost_cents: 8900,
      notes: 'Vidange + filtre à huile',
      next_due_date: new Date('2025-09-15'),
      asset: peugeot,
    },
  ]);

  await maintenanceRepo.save(maintenanceEvents);

  console.log('✅ Seed terminé — 1 utilisateur, 6 assets créés');
  console.log('📧 Email : john@inventr.app');
  console.log('🔑 Mot de passe : password123');
  console.log(
    '✅ Seed terminé — 1 utilisateur, 6 assets, 4 événements maintenance créés',
  );

  await app.close();
}

void bootstrap();
