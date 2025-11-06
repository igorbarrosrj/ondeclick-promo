import { NotFoundError } from '@core/errors';
import { PostgresRepository } from '@repositories/postgres-repository';
import type { UUID, Tenant, TenantPage } from '../types/database';

export interface CreateTenantDto {
  name: string;
  slug: string;
  category?: string;
  address?: Record<string, unknown>;
  phone?: string;
}

export interface TenantPublicProfile {
  tenant: Tenant;
  page: TenantPage | null;
}

export class TenantService {
  constructor(private readonly repository: PostgresRepository) {}

  async createTenant(input: CreateTenantDto, ownerUserId: UUID) {
    return this.repository.createTenant({ ...input, ownerUserId });
  }

  async updateTenant(tenantId: UUID, payload: Partial<CreateTenantDto> & { brandColor?: string }) {
    return this.repository.updateTenant({
      tenantId,
      ...payload,
      brandColor: payload.brandColor
    });
  }

  async getPublicProfileBySlug(slug: string): Promise<TenantPublicProfile> {
    const tenant = await this.repository.getTenantBySlug(slug);
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    const page = await this.repository.getTenantPage(tenant.id);
    return { tenant, page };
  }

  async getTenantPage(tenantId: UUID) {
    const page = await this.repository.getTenantPage(tenantId);
    if (!page) {
      throw new NotFoundError('Tenant page not configured');
    }
    return page;
  }

  async upsertTenantPage(tenantId: UUID, payload: Partial<TenantPage>) {
    return this.repository.upsertTenantPage(tenantId, payload);
  }

  async listMarketplaceTenants(filters?: { category?: string; city?: string }) {
    return this.repository.listMarketplaceTenants(filters ?? {});
  }
}
