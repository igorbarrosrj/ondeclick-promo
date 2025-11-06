// Métodos stub temporários - implementar depois
export const stubMethods = {
  // Admin
  async getAdminTenantSummaries() { return []; },
  async listSupportMessages() { return []; },
  async upsertSupportMessage(data: any) { return null; },
  
  // Affiliate  
  async getAffiliateProfileByUser(userId: string) { return null; },
  async upsertAffiliateProfile(data: any) { return null; },
  async getAffiliateSubscription(affiliateId: string) { return null; },
  async upsertPlanSubscription(data: any) { return null; },
  async createAffiliateCampaign(data: any) { return null; },
  async listAffiliateCampaigns(affiliateId: string) { return []; },
  async updateAffiliateCampaign(id: string, affiliateId: string, data: any) { return null; },
  async listAffiliateAssets(campaignId: string) { return []; },
  async getAffiliateCampaign(affiliateId: string, campaignId: string) { return null; },
  async insertAffiliateAsset(data: any) { return null; },
  
  // Billing
  async incrementUsage(tenantId: string, metric: string, value: number) { return null; },
  
  // KPI
  async getTenantKpis(tenantId: string) { return null; },
  async getCampaignKpis(tenantId: string, campaignId: string) { return null; },
  
  // Lead
  async recordLead(tenantId: string, data: any) { return null; },
  
  // Mercado Pago
  async updateSubscriptionByTenantId(tenantId: string, data: any) { return null; },
  
  // Tenant
  async createTenant(data: any) { return null; },
  async getTenantPage(tenantId: string) { return null; },
  async upsertTenantPage(data: any) { return null; },
  async listMarketplaceTenants() { return []; },
};
