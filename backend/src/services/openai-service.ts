import OpenAI from 'openai';
import { withRetry } from '@utils/retry';

export interface GenerateCopyInput {
  tenantName: string;
  offer: Record<string, unknown>;
  tone?: 'direct' | 'friendly' | 'promotional';
  city?: string;
}

export interface GenerateCopyResult {
  primaryText: string;
  headline: string;
  callToAction: string;
}

export interface GenerateImageInput {
  prompt: string;
  size?: '1024x1024' | '512x512';
}

export class OpenAIService {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCampaignCopy(input: GenerateCopyInput): Promise<GenerateCopyResult> {
    const prompt = this.buildCopyPrompt(input);

    const response = await withRetry(
      async () =>
        this.client.responses.create({
          model: 'gpt-4o-mini',
          input: prompt
        }),
      {
        retries: 3,
        shouldRetry: () => true
      }
    );

    const text = response.output_text ?? '';
    const [primaryText = text, headline = input.offer?.title?.toString() ?? '', callToAction = 'Saiba mais'] = text
      .split('\n')
      .map((line) => line.replace(/^\*\s*/, '').trim())
      .filter(Boolean);

    return {
      primaryText,
      headline,
      callToAction
    };
  }

  async generateImage(input: GenerateImageInput): Promise<string> {
    const response = await withRetry(
      async () =>
        this.client.images.generate({
          model: 'gpt-image-1',
          prompt: input.prompt,
          size: input.size ?? '1024x1024'
        }),
      { retries: 2 }
    );

    const image = response.data?.[0]?.url;
    if (!image) {
      throw new Error('Failed to generate image');
    }

    return image;
  }

  private buildCopyPrompt(input: GenerateCopyInput) {
    const offer = JSON.stringify(input.offer ?? {});
    return `Crie um texto curto e persuasivo para uma campanha de marketing para ${input.tenantName} com o tom ${
      input.tone ?? 'promocional'
    }. Cidade alvo: ${input.city ?? 'não especificada'}. Oferta: ${offer}.

Devolva três linhas: mensagem principal, headline curta e CTA.`;
  }
}
