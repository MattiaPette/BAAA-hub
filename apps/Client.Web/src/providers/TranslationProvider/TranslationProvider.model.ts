import { PluralCategory } from 'make-plural/plurals';

/**
 * Function type for pluralization logic.
 * Determines the plural category (zero, one, two, few, many, other) for a given number.
 *
 * @param {number | string} n - The number to determine the plural form for
 * @param {boolean} [ord] - Optional flag indicating whether to use ordinal rules (1st, 2nd, 3rd, etc.)
 *
 * @returns {PluralCategory} The appropriate plural category for the given number
 *
 * @see {@link https://github.com/eemeli/make-plural|make-plural library}
 */
export type PluralFunction = (
  n: number | string,
  ord?: boolean,
) => PluralCategory;
