import { hashString } from "../evidence/Evidence";

export interface PersonaCadence {
  sentenceLength: 'short' | 'flowing' | 'structured' | 'rhythmic';
  temperament: string;
  forbiddenMetaphors: string[];
  coreMetaphors: string[];
}

export interface PersonaManifest {
  id: string;
  name: string;
  version: string;
  archetype: string;
  directive: string;
  cadence: PersonaCadence;
  sampleInvocation?: string;
  metadata?: Record<string, any>;
}

/**
 * Computes canonical hash of a PersonaManifest state
 */
export function computePersonaManifestHash(manifest: PersonaManifest): string {
  const canonicalString = JSON.stringify({
    id: manifest.id,
    version: manifest.version,
    archetype: manifest.archetype,
    directive: manifest.directive,
    cadence: {
      sentenceLength: manifest.cadence.sentenceLength,
      temperament: manifest.cadence.temperament,
      forbiddenMetaphors: [...manifest.cadence.forbiddenMetaphors].sort(),
      coreMetaphors: [...manifest.cadence.coreMetaphors].sort()
    }
  });
  return hashString(canonicalString);
}

/**
 * Compiles a PersonaManifest into the canonical system directive
 */
export function compilePersonaDirective(manifest: PersonaManifest): string {
  const forbidden = manifest.cadence.forbiddenMetaphors.length > 0 
    ? ` Never use ${manifest.cadence.forbiddenMetaphors.join(' or ')}.` 
    : '';
  const core = manifest.cadence.coreMetaphors.length > 0 
    ? ` Core metaphors: ${manifest.cadence.coreMetaphors.join(', ')}.` 
    : '';

  return `${manifest.directive} Speaking cadence: ${manifest.cadence.sentenceLength}, temperament: ${manifest.cadence.temperament}.${core}${forbidden}`;
}

/**
 * Co-narration blend mode compiler for two PersonaManifests
 */
export function compileBlendDirective(p1: PersonaManifest, p2: PersonaManifest): string {
  const d1 = compilePersonaDirective(p1);
  const d2 = compilePersonaDirective(p2);

  return `You are performing a co-narration as two distinct sovereign personas: [${p1.name}] and [${p2.name}].
Weave a single, coherent prose passage where [${p1.name}] and [${p2.name}] speak in alternating sentences, or in a beautifully blended voice that combines the unique cadences, imagery, and philosophies of both.

Directive for [${p1.name}]:
${d1}

Directive for [${p2.name}]:
${d2}

Ensure that both voices contribute their specific imagery and tone to the final output. Never break character.`;
}

/**
 * Verifies that a prose passage strictly respects the PersonaManifest rules:
 * - Does not contain forbidden metaphors
 * - Measures presence of core metaphors
 */
export function validateProseAgainstPersona(prose: string, manifest: PersonaManifest): {
  valid: boolean;
  violations: string[];
  matchedCoreMetaphors: string[];
} {
  const lower = prose.toLowerCase();
  const violations: string[] = [];

  for (const forbidden of manifest.cadence.forbiddenMetaphors) {
    if (lower.includes(forbidden.toLowerCase())) {
      violations.push(forbidden);
    }
  }

  const matchedCoreMetaphors = manifest.cadence.coreMetaphors.filter(core => 
    lower.includes(core.toLowerCase())
  );

  return {
    valid: violations.length === 0,
    violations,
    matchedCoreMetaphors
  };
}
