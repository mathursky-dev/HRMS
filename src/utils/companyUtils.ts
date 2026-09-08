import { Candidate, Company } from '../types';

/**
 * Checks if a candidate belongs to a target company.
 * Supports matching by company ID, company code, and company name,
 * ensuring newly created companies and imported candidates are always visible.
 */
export function candidateMatchesCompany(
  candidate: Pick<Candidate, 'companyId' | 'companyName'> | Candidate | null | undefined,
  targetCompanyId: string,
  companies: Company[] = []
): boolean {
  if (!targetCompanyId || targetCompanyId === 'ALL') return true;
  if (!candidate) return false;

  // 1. Direct match on companyId
  if (candidate.companyId && candidate.companyId === targetCompanyId) {
    return true;
  }

  // 2. Find target company definition
  const targetComp = companies.find(
    (c) =>
      c.id === targetCompanyId ||
      (c.code && c.code.toLowerCase() === targetCompanyId.toLowerCase())
  );

  if (targetComp) {
    // Match candidate companyId against targetComp id, code, or name
    if (candidate.companyId) {
      const candCompIdLower = candidate.companyId.toLowerCase().trim();
      if (candCompIdLower === targetComp.id.toLowerCase()) return true;
      if (targetComp.code && candCompIdLower === targetComp.code.toLowerCase().trim()) return true;
      if (targetComp.name && candCompIdLower === targetComp.name.toLowerCase().trim()) return true;
    }

    // Match candidate companyName against targetComp name, legalName, or code
    if (candidate.companyName) {
      const candCompNameLower = candidate.companyName.toLowerCase().trim();
      const targetNameLower = targetComp.name?.toLowerCase().trim();
      const targetLegalLower = targetComp.legalName?.toLowerCase().trim();
      const targetCodeLower = targetComp.code?.toLowerCase().trim();

      if (targetNameLower && (candCompNameLower === targetNameLower || candCompNameLower.includes(targetNameLower))) {
        return true;
      }
      if (targetLegalLower && (candCompNameLower === targetLegalLower || candCompNameLower.includes(targetLegalLower))) {
        return true;
      }
      if (targetCodeLower && (candCompNameLower === targetCodeLower || candCompNameLower.includes(targetCodeLower))) {
        return true;
      }
    }
  }

  // 3. Fallback for legacy demo records without explicit companyId
  if (!candidate.companyId && candidate.companyName) {
    const legacyCompId = candidate.companyName.toLowerCase().includes('bkd')
      ? 'comp-2'
      : candidate.companyName.toLowerCase().includes('organic')
      ? 'comp-3'
      : 'comp-1';
    return legacyCompId === targetCompanyId || (targetComp?.id === legacyCompId);
  }

  return false;
}

/**
 * Resolves the genuine company ID for a candidate.
 */
export function getCandidateCompanyId(
  candidate: Pick<Candidate, 'companyId' | 'companyName'> | Candidate | null | undefined,
  companies: Company[] = []
): string {
  if (!candidate) return 'comp-1';

  if (candidate.companyId) {
    const directComp = companies.find(
      (c) =>
        c.id === candidate.companyId ||
        (c.code && c.code.toLowerCase() === candidate.companyId?.toLowerCase())
    );
    if (directComp) return directComp.id;
    return candidate.companyId;
  }

  if (candidate.companyName) {
    const nameMatch = companies.find(
      (c) =>
        (c.name && c.name.toLowerCase() === candidate.companyName?.toLowerCase().trim()) ||
        (c.legalName && c.legalName.toLowerCase() === candidate.companyName?.toLowerCase().trim())
    );
    if (nameMatch) return nameMatch.id;

    if (candidate.companyName.toLowerCase().includes('bkd')) return 'comp-2';
    if (candidate.companyName.toLowerCase().includes('organic')) return 'comp-3';
  }

  return companies[0]?.id || 'comp-1';
}
