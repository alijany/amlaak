import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CityEntity } from './city.entity';

const PROVINCE_CODES = [
  'IR-00',
  'IR-01',
  'IR-02',
  'IR-03',
  'IR-04',
  'IR-05',
  'IR-06',
  'IR-07',
  'IR-08',
  'IR-09',
  'IR-10',
  'IR-11',
  'IR-12',
  'IR-13',
  'IR-14',
  'IR-15',
  'IR-16',
  'IR-17',
  'IR-18',
  'IR-19',
  'IR-20',
  'IR-21',
  'IR-22',
  'IR-23',
  'IR-24',
  'IR-25',
  'IR-26',
  'IR-27',
  'IR-28',
  'IR-29',
  'IR-30',
];

const DATA_DIR = path.join(process.cwd(), 'src', 'city', 'data');

interface GeoJSONFeature {
  type: string;
  properties: {
    name?: string;
    'name:fa'?: string;
    'name:en'?: string;
    tags?: {
      name?: string;
      'name:en'?: string;
      'name:fa'?: string;
    };
  };
  geometry: { type: string };
}

interface GeoJSONFeatureCollection {
  type: string;
  features: GeoJSONFeature[];
}

@Injectable()
export class CitySeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CitySeeder.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap() {
    try {
      const em = this.em.fork();
      const count = await em.count(CityEntity, {});
      if (count > 0) {
        this.logger.log('Cities already seeded, skipping...');
        return;
      }
      this.logger.log('Starting city seeding from bundled data...');
      await this.seed();
      this.logger.log('City seeding completed successfully');
    } catch (error) {
      this.logger.error('City seeding failed:', error);
    }
  }

  private toSlug(nameEn?: string, nameFa?: string): string {
    if (nameEn) {
      return nameEn
        .toLowerCase()
        .replace(/county/gi, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    return (nameFa ?? '')
      .replace(/شهرستان\s*/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private async seed(): Promise<void> {
    const em = this.em.fork();

    const seen = new Set<string>();
    const cities: { nameFa: string; nameEn?: string; slug: string }[] = [];

    for (const code of PROVINCE_CODES) {
      const filePath = path.join(DATA_DIR, `${code}.geojson`);

      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Data file missing: ${filePath}, skipping ${code}`);
        continue;
      }

      let data: GeoJSONFeatureCollection;
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (err) {
        this.logger.warn(`Failed to parse ${code}: ${err}`);
        continue;
      }

      for (const feature of data.features) {
        if (feature.geometry?.type === 'Point') continue;

        const props = feature.properties;
        const tags = props?.tags;

        const nameFa = (
          props?.['name:fa'] ||
          tags?.['name:fa'] ||
          props?.name ||
          tags?.name ||
          ''
        )
          .replace(/شهرستان\s*/g, '')
          .trim();

        const nameEn = (props?.['name:en'] || tags?.['name:en'] || '')
          .replace(/County/gi, '')
          .trim();

        if (!nameFa) continue;
        if (seen.has(nameFa)) continue;
        seen.add(nameFa);

        const slugBase = this.toSlug(nameEn || undefined, nameFa);
        let slug = slugBase || `city-${seen.size}`;
        let counter = 1;
        while (cities.some((c) => c.slug === slug)) {
          slug = `${slugBase}-${counter++}`;
        }

        cities.push({ nameFa, nameEn: nameEn || undefined, slug });
      }
    }

    this.logger.log(`Found ${cities.length} unique cities, inserting...`);

    let created = 0;
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      em.persist(
        em.create(CityEntity, {
          nameFa: city.nameFa,
          nameEn: city.nameEn,
          slug: city.slug,
          order: i + 1,
          isActive: true,
        }),
      );
      created++;
      if (created % 50 === 0) {
        await em.flush();
      }
    }

    if (created % 50 !== 0) {
      await em.flush();
    }

    this.logger.log(`Cities seeded: ${created} created.`);
  }
}
