import type { ParserCompany, ParserDashboardStats } from "@/lib/parser/types";

/** High-value lead: no site, strong rating, meaningful review volume */
export const HIGH_PRIORITY_RATING = 4.5;
export const HIGH_PRIORITY_MIN_REVIEWS = 50;

export function isHighPriorityLead(company: ParserCompany): boolean {
  return (
    !company.hasWebsite &&
    company.rating >= HIGH_PRIORITY_RATING &&
    company.reviewsCount >= HIGH_PRIORITY_MIN_REVIEWS
  );
}

export function enrichCompanyPriority(
  company: ParserCompany
): ParserCompany {
  if (isHighPriorityLead(company)) {
    return { ...company, priority: "high" };
  }
  if (!company.hasWebsite) {
    return { ...company, priority: "medium" };
  }
  return { ...company, priority: "low" };
}

export function computeParserStats(
  filtered: ParserCompany[],
  allMatched: ParserCompany[]
): ParserDashboardStats {
  const withoutWebsite = filtered.filter((c) => !c.hasWebsite).length;
  const averageRating =
    filtered.length > 0
      ? Number(
          (
            filtered.reduce((sum, c) => sum + c.rating, 0) / filtered.length
          ).toFixed(1)
        )
      : 0;

  return {
    totalFound: allMatched.length,
    withoutWebsite,
    averageRating,
    highPriorityLeads: filtered.filter(isHighPriorityLead).length,
  };
}
