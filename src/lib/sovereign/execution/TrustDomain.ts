export type TrustTier = 'sovereign-local' | 'trusted-cloud' | 'stranger-compute';

export interface TrustDomain {
  id: string;
  name: string;
  tier: TrustTier;
  allowedOperations: string[];
  requiresEvidence: boolean;
  maxLeaseDurationMs?: number;
  description?: string;
}

export const SOVEREIGN_LOCAL_DOMAIN: TrustDomain = {
  id: 'sovereign-local',
  name: 'Sovereign Local Node',
  tier: 'sovereign-local',
  allowedOperations: ['generate', 'iterate', 'channel', 'tarot', 'norse', 'commit', 'merkle_sync'],
  requiresEvidence: true,
  description: 'Zero-signal, non-custodial local compute domain running inside the sovereign perimeter.'
};

export const TRUSTED_CLOUD_DOMAIN: TrustDomain = {
  id: 'gemini-cloud',
  name: 'Trusted Provider Cloud',
  tier: 'trusted-cloud',
  allowedOperations: ['generate', 'iterate', 'channel', 'tarot', 'norse'],
  requiresEvidence: true,
  description: 'External inference provider with schema-enforced JSON and prompt boundaries.'
};

export const STRANGER_COMPUTE_DOMAIN: TrustDomain = {
  id: 'stranger-untrusted',
  name: 'Stranger Compute Node',
  tier: 'stranger-compute',
  allowedOperations: ['unverified-candidate-eval'],
  requiresEvidence: true,
  maxLeaseDurationMs: 5000,
  description: 'Untrusted foreign execution plane requiring strict TEE or zkML verification before state ingress.'
};
