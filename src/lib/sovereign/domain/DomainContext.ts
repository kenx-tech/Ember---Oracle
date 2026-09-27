import { hashString } from "../evidence/Evidence";

/**
 * DomainContext represents authoritative reference material supplied to execution
 * (e.g. Goetic/Egyptian spirit records, lore databases, runic canons).
 * Distinct from PersonaManifest (who speaks) and TaskPolicy (what job).
 * Rule: The model may interpret the lore; it may not alter the authoritative source lore.
 */
export interface DomainContext {
  readonly domain: 'goetic' | 'egyptian' | 'norse' | 'tarot' | 'custom';
  readonly subjectId: string;
  readonly subjectName: string;
  readonly sourceData: unknown;
  readonly sourceFingerprint: string;
}

/**
 * Creates a DomainContext object with deterministic fingerprinting of source data
 */
export function createDomainContext(params: {
  domain: 'goetic' | 'egyptian' | 'norse' | 'tarot' | 'custom';
  subjectId: string;
  subjectName: string;
  sourceData: unknown;
}): DomainContext {
  const sourceFingerprint = hashString(JSON.stringify({
    domain: params.domain,
    subjectId: params.subjectId,
    subjectName: params.subjectName,
    sourceData: params.sourceData
  }));

  return {
    domain: params.domain,
    subjectId: params.subjectId,
    subjectName: params.subjectName,
    sourceData: params.sourceData,
    sourceFingerprint
  };
}
