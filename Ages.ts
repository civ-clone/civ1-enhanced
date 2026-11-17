import Age from '@civ-clone/base-science-age/Age';

// Civilization's ages, one for each tier of `ResearchTiers` (civ-clone/web-renderer#1076). Named for what each tier
//  holds rather than for history: Civ1's tree puts Computers in the sixth and Flight in the seventh.
export class Ancient extends Age {}
export class Classical extends Age {}
export class Medieval extends Age {}
export class Renaissance extends Age {}
export class Industrial extends Age {}
export class Electric extends Age {}
export class Modern extends Age {}
export class Space extends Age {}

/** The ages in order: the n-th is the age of the n-th tier's advances. */
export const researchAges: (typeof Age)[] = [
  Ancient,
  Classical,
  Medieval,
  Renaissance,
  Industrial,
  Electric,
  Modern,
  Space,
];

export default researchAges;
