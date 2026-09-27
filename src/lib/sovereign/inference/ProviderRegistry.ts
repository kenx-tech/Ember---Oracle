import { ModelProvider, InferenceRequest, CandidateResult, LocalAethericProvider } from "./ModelProvider";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers = new Map<string, ModelProvider>();
  private defaultFallbackProvider: ModelProvider;

  private constructor() {
    this.defaultFallbackProvider = new LocalAethericProvider();
    this.register(this.defaultFallbackProvider);
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }

  public get(id: string): ModelProvider | undefined {
    return this.providers.get(id);
  }

  public list(): ModelProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Core routing doctrine:
   * Try preferred provider (e.g. Gemini).
   * If it fails (quota, network, offline, or thrown error), fail over to sovereign local provider.
   * The Persona survives seamlessly with full evidence bundle generation.
   */
  public async generateWithFallback(
    request: InferenceRequest, 
    preferredProviderId: string = "gemini-cloud"
  ): Promise<CandidateResult> {
    const primary = this.get(preferredProviderId);
    
    if (primary) {
      try {
        const available = await primary.isAvailable();
        if (available) {
          return await primary.generate(request);
        }
      } catch (err: any) {
        console.warn(`[SOVEREIGN PROVIDER MIGRATION] Primary provider '${preferredProviderId}' failed: ${err?.message || err}. Migrating execution to sovereign local engine.`);
      }
    }

    // Failover: Persona and state remain sovereign
    const fallback = this.defaultFallbackProvider;
    console.log(`[SOVEREIGN RESILIENCE] Routing invocation for persona '${request.persona.id}' through local provider '${fallback.id}'.`);
    return await fallback.generate(request);
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
