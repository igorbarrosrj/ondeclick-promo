import { NextApiRequest, NextApiResponse } from 'next';
import { getBackendContainer } from './container';
import { TOKENS } from '@core/tokens';

export async function tenantPublicHandler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET']);
    response.status(405).end('Method not allowed');
    return;
  }

  const slug = request.query.slug;
  if (!slug || Array.isArray(slug)) {
    response.status(400).json({ message: 'Missing slug' });
    return;
  }

  const container = getBackendContainer();
  const tenantService = container.resolve(TOKENS.tenantService);

  try {
    const profile = await tenantService.getPublicProfileBySlug(slug);
    response.status(200).json(profile);
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    response.status(err.statusCode ?? 500).json({ message: err.message });
  }
}
