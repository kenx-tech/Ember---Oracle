export type EvidenceType = 
  | 'deterministic' 
  | 'runtime-attestation' 
  | 'tee-attestation' 
  | 'zkml' 
  | 'consensus' 
  | 'semantic';

/**
 * Raw evidence bundle submitted alongside an inference result.
 * "Evidence is not truth. Evidence is material submitted to verification."
 */
export interface EvidenceBundle {
  evidenceId: string;
  type: EvidenceType;
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
  timestamp: number;
  inputHash: string;
  outputHash: string;
  metadata: Record<string, any>;
  signature?: string;
}

export interface VerificationResult {
  verified: boolean;
  reason?: string;
  evidenceType: EvidenceType;
  verifierId: string;
  timestamp: number;
  gatePassed?: boolean;
}

/**
 * Simple deterministic string hashing helper for evidence integrity (Fowler-Noll-Vo / Murmur inspired)
 */
export function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
