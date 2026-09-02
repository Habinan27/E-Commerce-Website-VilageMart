import { prisma } from '@/lib/db/prisma';
import { serializeBigInt } from '@/lib/utils';
import type { LocationType } from '@/types';

export class LocationService {
  static async getProvinces() {
    const provinces = await prisma.location.findMany({
      where: { type: 'PROVINCE' },
      orderBy: { name: 'asc' },
    });
    return serializeBigInt(provinces);
  }

  static async getDistrictsByProvince(provinceId: string) {
    const districts = await prisma.location.findMany({
      where: {
        type: 'DISTRICT',
        parentId: BigInt(provinceId),
      },
      orderBy: { name: 'asc' },
    });
    return serializeBigInt(districts);
  }

  static async getCitiesByDistrict(districtId: string) {
    const cities = await prisma.location.findMany({
      where: {
        type: 'CITY',
        parentId: BigInt(districtId),
      },
      orderBy: { name: 'asc' },
    });
    return serializeBigInt(cities);
  }

  static async getFullHierarchy() {
    const provinces = await prisma.location.findMany({
      where: { type: 'PROVINCE' },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return serializeBigInt(provinces);
  }

  static async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id: BigInt(id) },
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
      },
    });
    return location ? serializeBigInt(location) : null;
  }
}
