/**
 * Deduce school type (public/private) from school level if not provided
 * This is a fallback in case school_type is missing
 * school_type should be either 'public' or 'private'
 */
export const deduceSchoolType = (
  schoolType: string | undefined,
  schoolLevel: string | undefined
): string => {
  // If schoolType is already provided and not empty, use it
  if (schoolType && schoolType.trim()) {
    return schoolType.toLowerCase();
  }

  // Default to public if no type provided
  return "public";
};
