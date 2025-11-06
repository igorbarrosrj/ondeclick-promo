import { randomUUID } from 'node:crypto';
import { getBackendContainer } from '@adapters/next/container';
import { TOKENS } from '@core/tokens';
import { SupabaseRepository } from '@repositories/supabase-repository';

async function main() {
  const container = getBackendContainer();
  const repository = container.resolve(TOKENS.supabaseRepository) as SupabaseRepository;

  const ownerUserId = randomUUID();
  const tenant = await repository.createTenant({
    name: 'Demo Restaurante',
    slug: 'demo-restaurante',
    category: 'food',
    address: { city: 'São Paulo', country: 'BR' },
    phone: '+551100000000',
    ownerUserId
  });

  await repository.upsertTenantPage(tenant.id, {
    headline: 'Descubra sabores incríveis',
    description: 'Promoções especiais toda semana',
    sections: {
      highlights: [
        { title: 'Menu executivo', price: 39.9 },
        { title: 'Happy hour', description: 'Drinks pela metade do preço' }
      ]
    }
  });

  const campaign = await repository.insertCampaign({
    tenant_id: tenant.id,
    name: 'Semana do Hambúrguer',
    channels: ['meta', 'whatsapp'],
    offer: {
      title: 'Combo especial',
      price: 29.9,
      city: 'São Paulo'
    },
    schedule: {
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  });

  await repository.recordLead({
    tenant_id: tenant.id,
    name: 'Maria Silva',
    contact: '+5511999999999',
    channel: 'whatsapp',
    source_campaign_id: campaign.id,
    status: 'new',
    tags: ['demo']
  });

  console.log('Seed completed. Tenant slug: demo-restaurante');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
