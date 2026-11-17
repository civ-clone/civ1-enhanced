import Age from '@civ-clone/base-science-age/Age';
export declare class Ancient extends Age {}
export declare class Classical extends Age {}
export declare class Medieval extends Age {}
export declare class Renaissance extends Age {}
export declare class Industrial extends Age {}
export declare class Electric extends Age {}
export declare class Modern extends Age {}
export declare class Space extends Age {}
/** The ages in order: the n-th is the age of the n-th tier's advances. */
export declare const researchAges: (typeof Age)[];
export default researchAges;
