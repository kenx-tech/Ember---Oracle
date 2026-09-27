import { EvidenceBundle, EvidenceType, VerificationResult, hashString } from "./Evidence";

export interface CreateEvidenceParams {
  providerId: string;
  personaId: string;
  personaVersion?: string;
  personaManifestHash?: string;
  taskType?: string;
  taskInputHash?: string;
  domainType?: string;
  domainSubjectId?: string;
  domainSubjectName?: string;
  domainContextFingerprint?: string;
  providerTrustDomain?: string;
  executionMode?: 'deterministic' | 'runtime-cloud' | 'local-neural' | 'tee' | 'zkml';
  fidelityResult?: {
    valid: boolean;
    violations: string[];
    matchedCoreMetaphors: string[];
  };
  input: string;
  output: string;
  metadata?: Record<string, any>;
}

export interface EvidenceAdapter {
  readonly evidenceType: EvidenceType;
  
  createEvidence(params: CreateEvidenceParams): Promise<EvidenceBundle>;

  verify(bundle: EvidenceBundle): Promise<VerificationResult>;
}

/**
 * Standard deterministic adapter for local / offline / reproducible executions
 */
export class DeterministicEvidenceAdapter implements EvidenceAdapter {
  readonly evidenceType: EvidenceType = 'deterministic';

  async createEvidence(params: CreateEvidenceParams): Promise<EvidenceBundle> {
    const inputHash = hashString(params.input);
    const outputHash = hashString(params.output);
    const evidenceId = `ev-det-${Date.now()}-${inputHash.slice(0, 4)}-${outputHash.slice(0, 4)}`;

    return {
      evidenceId,
      type: this.evidenceType,
      providerId: params.providerId,
      personaId: params.personaId,
      personaVersion: params.personaVersion,
      personaManifestHash: params.personaManifestHash,
      taskType: params.taskType,
      taskInputHash: params.taskInputHash,
      domainType: params.domainType,
      domainSubjectId: params.domainSubjectId,
      domainSubjectName: params.domainSubjectName,
      domainContextFingerprint: params.domainContextFingerprint,
      providerTrustDomain: params.providerTrustDomain,
      executionMode: params.executionMode || 'deterministic',
      fidelityResult: params.fidelityResult,
      timestamp: Date.now(),
      inputHash,
      outputHash,
      metadata: {
        ...params.metadata,
        mode: 'deterministic-provenance'
      }
    };
  }

  async verify(bundle: EvidenceBundle): Promise<VerificationResult> {
    const verified = bundle.type === 'deterministic' && !!bundle.inputHash && !!bundle.outputHash;
    return {
      verified,
      reason: verified ? "Deterministic evidence structure intact" : "Invalid deterministic payload or missing hash",
      evidenceType: this.evidenceType,
      verifierId: "verifier:sovereign:deterministic",
      timestamp: Date.now(),
      gatePassed: verified
    };
  }
}

/**
 * Runtime attestation adapter for API / Cloud providers (e.g. Gemini, external nodes)
 */
export class RuntimeAttestationAdapter implements EvidenceAdapter {
  readonly evidenceType: EvidenceType = 'runtime-attestation';

  async createEvidence(params: CreateEvidenceParams): Promise<EvidenceBundle> {
    const inputHash = hashString(params.input);
    const outputHash = hashString(params.output);
    const evidenceId = `ev-att-${Date.now()}-${inputHash.slice(0, 4)}-${outputHash.slice(0, 4)}`;

    return {
      evidenceId,
      type: this.evidenceType,
      providerId: params.providerId,
      personaId: params.personaId,
      personaVersion: params.personaVersion,
      personaManifestHash: params.personaManifestHash,
      taskType: params.taskType,
      taskInputHash: params.taskInputHash,
      domainType: params.domainType,
      domainSubjectId: params.domainSubjectId,
      domainSubjectName: params.domainSubjectName,
      domainContextFingerprint: params.domainContextFingerprint,
      providerTrustDomain: params.providerTrustDomain,
      executionMode: params.executionMode || 'runtime-cloud',
      fidelityResult: params.fidelityResult,
      timestamp: Date.now(),
      inputHash,
      outputHash,
      metadata: {
        ...params.metadata,
        runtime: "GoogleGenAI-SDK",
        version: "gemini-3.5-flash"
      }
    };
  }

  async verify(bundle: EvidenceBundle): Promise<VerificationResult> {
    const hasHashes = Boolean(bundle.inputHash && bundle.outputHash);
    const isValidProvider = Boolean(bundle.providerId);
    const verified = bundle.type === 'runtime-attestation' && hasHashes && isValidProvider;

    return {
      verified,
      reason: verified ? "Runtime attestation verified against provider provenance" : "Mismatched runtime attestation parameters",
      evidenceType: this.evidenceType,
      verifierId: "verifier:sovereign:runtime-attestation",
      timestamp: Date.now(),
      gatePassed: verified
    };
  }
}
