import { EvidenceAdapter, DeterministicEvidenceAdapter, RuntimeAttestationAdapter } from "./EvidenceAdapter";
import { EvidenceType } from "./Evidence";

/**
 * EvidenceRegistry registers supported evidence handlers and adapters.
 * Note: Evidence itself is NOT stored here; it travels with CandidateResult and enters the CommitReceipt.
 */
export class EvidenceRegistry {
  private static instance: EvidenceRegistry;
  private adapters = new Map<string, EvidenceAdapter>();

  private constructor() {
    this.register(new DeterministicEvidenceAdapter());
    this.register(new RuntimeAttestationAdapter());
  }

  public static getInstance(): EvidenceRegistry {
    if (!EvidenceRegistry.instance) {
      EvidenceRegistry.instance = new EvidenceRegistry();
    }
    return EvidenceRegistry.instance;
  }

  public register(adapter: EvidenceAdapter): void {
    this.adapters.set(adapter.evidenceType, adapter);
  }

  public get(type: EvidenceType | string): EvidenceAdapter | undefined {
    return this.adapters.get(type);
  }

  public has(type: EvidenceType | string): boolean {
    return this.adapters.has(type);
  }

  public listTypes(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export const evidenceRegistry = EvidenceRegistry.getInstance();
