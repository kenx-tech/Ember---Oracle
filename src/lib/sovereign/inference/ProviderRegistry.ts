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
   * Evaluate registered providers in priority order.
   * If preferredProviderId is specified, try that first; otherwise iterate through all registered non-fallback providers.
   * If a provider fails (availability, network, quota, schema parse error, or throws), fail over to the next candidate.
   * When all external/primary providers are exhausted, migrate to the sovereign local engine.
   * The Persona and state survive seamlessly with full evidence bundle generation.
   */
  public async generateWithFallback(
    request: InferenceRequest, 
    preferredProviderId?: string
  ): Promise<CandidateResult> {
    const candidateIds: string[] = [];

    if (preferredProviderId) {
      candidateIds.push(preferredProviderId);
    } else {
      // Prioritize non-fallback providers (e.g. gemini-cloud, future ollama-local)
      for (const [id] of this.providers.entries()) {
        if (id !== this.defaultFallbackProvider.id) {
          candidateIds.push(id);
        }
      }
    }

    for (const id of candidateIds) {
      const provider = this.get(id);
      if (!provider) continue;

      try {
        const available = await provider.isAvailable();
        if (available) {
          const result = await provider.generate(request);
          if (request.schema && result.parsed === undefined) {
            throw new Error(`Provider '${id}' produced unparseable JSON for schema-enforced request.`);
          }
          return result;
        }
      } catch (err: any) {
        console.warn(`[SOVEREIGN PROVIDER MIGRATION] Provider '${id}' failed: ${err?.message || err}. Migrating execution.`);
      }
    }

    // Failover: Persona and state remain sovereign
    const fallback = this.defaultFallbackProvider;
    console.log(`[SOVEREIGN RESILIENCE] Routing invocation for persona '${request.persona.id}' through sovereign local engine '${fallback.id}'.`);
    return await fallback.generate(request);
  }
}

export const providerRegistry = ProviderRegistry.getInstance();
