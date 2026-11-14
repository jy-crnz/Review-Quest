/**
 * 🛡️ KIND ENUMERATION MATCHER
 * Makes text identification/enumeration questions forgiving, smart, and educational.
 * Features:
 * - Case-insensitive and whitespace-insensitive
 * - Strips diacritics/accents (ñ -> n, ó -> o, etc.)
 * - Strips punctuation (., ' " - () /)
 * - Strips honorary titles, clergy prefixes, and administrative labels
 *   (Maestro, Padre, Dr, Senador, Bapor, Imperyo, Don, Doña, Sr., Jr.)
 * - Expands acronyms (RA 1425 <-> Republic Act 1425)
 * - Strips conversational preambles ("ang sagot ay", "ito ay", "the answer is")
 * - Substring phrase inclusion (accepts full sentences containing the target)
 * - Semantic keyword overlap (bag-of-words filtering stop-words with typo tolerance)
 * - Direct & partial explanation matching (accepts when student answers with explanation)
 * - Typo tolerance: Levenshtein distance <= 1-2 for minor spelling slips
 */

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export function cleanText(input: string): string {
    if (!input) return '';
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, ' ') // punctuation to space
        .replace(/\s+/g, ' ')
        .trim();
}

const COMMON_TITLES = [
    'maestro', 'padre', 'fr', 'father', 'dr', 'doctor', 'don', 'dona', 'senador',
    'senator', 'gobernador heneral', 'gobernador', 'heneral', 'general', 'imperyo',
    'imperio', 'bapor', 'barko', 'sr', 'jr', 'ii', 'iii', 'g', 'gng', 'bb', 'batas'
];

const PREAMBLES = [
    'ang tamang sagot ay',
    'ang tamang sagot',
    'ang sagot ay',
    'ang sagot',
    'ito ay si',
    'ito ay ang',
    'ito ay mga',
    'ito ay',
    'ang akdang',
    'ang nobelang',
    'ang aklat na',
    'ang pamagat ay',
    'ang tawag ay',
    'siya ay si',
    'siya ay',
    'naranasan ni rizal ang',
    'naranasan niya ang',
    'naranasan ang',
    'the answer is',
    'it is',
    'the book is'
];

const STOP_WORDS = new Set([
    'ang', 'mga', 'ay', 'si', 'ni', 'kay', 'kina', 'sina', 'sa', 'ng', 'nang',
    'mula', 'para', 'dahil', 'ito', 'nito', 'kanya', 'kanyang', 'kanila',
    'kanilang', 'at', 'o', 'na', 'pa', 'ba', 'din', 'rin', 'naman', 'nga',
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'of', 'in', 'on', 'at',
    'to', 'for', 'with', 'by', 'about', 'it', 'its', 'they', 'their'
]);

const ABBREVIATIONS: Record<string, string> = {
    'brgy': 'barangay',
    'bgy': 'barangay',
    'dept': 'department',
    'govt': 'government',
    'corp': 'corporation',
    'inc': 'incorporated',
};

export function normalizeAbbreviations(text: string): string {
    return text.split(' ').map(w => ABBREVIATIONS[w] || w).join(' ');
}

export function generateAcronym(text: string): string {
    const cleaned = cleanText(text);
    const words = cleaned.split(' ').filter(w => !STOP_WORDS.has(w) && w.length > 0);
    if (words.length >= 2 && words.length <= 6) {
        return words.map(w => w[0]).join('');
    }
    return '';
}

export function expandTargets(targets: string[]): string[] {
    const result = new Set<string>();

    for (const raw of targets) {
        if (!raw) continue;
        result.add(raw);

        // Split on slash '/' e.g. "Mayor's Permit / Business Permit"
        if (raw.includes('/')) {
            raw.split('/').forEach(part => {
                const p = part.trim();
                if (p.length >= 2) result.add(p);
            });
        }

        // Extract parenthetical content e.g. "Department of Trade and Industry (DTI)" -> "DTI", "Co-operatives (Co-ops)" -> "Co-ops"
        const parenMatches = raw.match(/\(([^)]+)\)/g);
        if (parenMatches) {
            for (const pm of parenMatches) {
                const inner = pm.slice(1, -1).trim();
                if (inner.length >= 2) {
                    result.add(inner);
                    // Add hyphen-stripped variation e.g. "co-ops" -> "coops", "coop"
                    if (inner.includes('-')) {
                        result.add(inner.replace(/-/g, ''));
                        result.add(inner.replace(/-/g, ' '));
                        result.add(inner.replace(/-/g, '').replace(/s$/i, ''));
                    }
                }
            }
            // Also add version without parentheses
            const withoutParen = raw.replace(/\([^)]+\)/g, ' ').replace(/\s+/g, ' ').trim();
            if (withoutParen.length >= 2) {
                result.add(withoutParen);
                const acr = generateAcronym(withoutParen);
                if (acr.length >= 2) result.add(acr);
            }
        }

        // Acronym from multi-word target e.g. "Securities and Exchange Commission" -> "sec"
        const acronym = generateAcronym(raw);
        if (acronym.length >= 2) {
            result.add(acronym);
        }

        // Expand Republic Act / RA numbers (e.g. "Republic Act 10173" <-> "RA 10173")
        const raMatch = raw.match(/\b(?:republic\s+act|ra)\s*(\d+)\b/i);
        if (raMatch) {
            result.add(`RA ${raMatch[1]}`);
            result.add(`Republic Act ${raMatch[1]}`);
        }
    }

    return Array.from(result);
}

export function stripTitles(text: string): string {
    let cleaned = cleanText(text);

    // Strip preambles
    for (const preamble of PREAMBLES) {
        if (cleaned.startsWith(preamble + ' ')) {
            cleaned = cleaned.substring(preamble.length).trim();
            break;
        }
    }

    // Strip titles
    for (const title of COMMON_TITLES) {
        if (cleaned.startsWith(title + ' ')) {
            cleaned = cleaned.substring(title.length).trim();
        }
        if (cleaned.endsWith(' ' + title)) {
            cleaned = cleaned.substring(0, cleaned.length - title.length).trim();
        }
    }
    return cleaned;
}

export function extractKeywords(text: string): string[] {
    return cleanText(text)
        .split(' ')
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

export function isKindAnswerMatch(
    userInput: string,
    targetAnswer: string,
    acceptedVariations: string[] = [],
    explanation?: string
): boolean {
    const rawUser = cleanText(userInput);
    const rawTarget = cleanText(targetAnswer);

    if (!rawUser || !rawTarget) return false;

    // 1. Direct normalized match
    if (rawUser === rawTarget) return true;

    // 2. Explanation Direct / Substring Match
    if (explanation) {
        const cleanExp = cleanText(explanation);
        if (cleanExp.length >= 5) {
            if (rawUser === cleanExp) return true;
            if (rawUser.length >= 8 && cleanExp.includes(rawUser)) return true;
            if (cleanExp.length >= 8 && rawUser.includes(cleanExp)) return true;

            const strippedExp = stripTitles(cleanExp);
            const strippedUserExp = stripTitles(rawUser);
            if (strippedExp.length >= 6 && strippedUserExp === strippedExp) return true;
            if (strippedExp.length >= 8 && strippedUserExp.includes(strippedExp)) return true;
        }
    }

    // 3. Acronym equality (e.g. RA 10173 <-> Republic Act 10173)
    const userWithoutRa = rawUser.replace(/\bra\s*(\d+)\b/g, 'republic act $1');
    const targetWithoutRa = rawTarget.replace(/\bra\s*(\d+)\b/g, 'republic act $1');
    if (userWithoutRa === targetWithoutRa) return true;

    // Abbreviation normalization & acronym derivation
    const normUser = normalizeAbbreviations(rawUser);
    const strippedUser = stripTitles(normUser);
    const userAcronym = generateAcronym(strippedUser);

    const allTargets = expandTargets([targetAnswer, ...acceptedVariations].filter(Boolean));

    for (const target of allTargets) {
        const cleanT = cleanText(target);
        if (rawUser === cleanT || normUser === cleanT) return true;

        const cleanTWithoutRa = cleanT.replace(/\bra\s*(\d+)\b/g, 'republic act $1');
        if (userWithoutRa === cleanTWithoutRa) return true;

        const normTarget = normalizeAbbreviations(cleanT);
        if (normUser === normTarget) return true;

        // User typed acronym matching target (or vice-versa)
        if (userAcronym.length >= 2 && (userAcronym === cleanT || userAcronym === normTarget)) return true;

        // 4. Exact Substring Containment (student answered in a complete sentence)
        if (cleanT.length >= 4 && rawUser.includes(cleanT)) return true;
        if (rawUser.length >= 4 && cleanT.includes(rawUser)) return true;

        // Strip titles and preambles from both
        const strippedTarget = stripTitles(normTarget);

        if (strippedUser.length > 0 && strippedUser === strippedTarget) return true;
        if (strippedTarget.length >= 4 && strippedUser.includes(strippedTarget)) return true;
        if (strippedUser.length >= 4 && strippedTarget.includes(strippedUser)) return true;

        // Standalone token exact match (e.g. user typed "dti", target is "department of trade and industry dti")
        const targetTokens = strippedTarget.split(' ');
        if (targetTokens.includes(strippedUser) && strippedUser.length >= 2 && !STOP_WORDS.has(strippedUser)) {
            return true;
        }

        // Squashed comparison without spaces/hyphens (e.g. "coop" vs "co ops", "nonprofit" vs "non profit")
        const squashUser = strippedUser.replace(/\s+/g, '');
        const squashTarget = strippedTarget.replace(/\s+/g, '');
        if (squashUser.length >= 3 && squashTarget.length >= 3) {
            if (squashUser === squashTarget) return true;
            if (squashUser.replace(/s$/, '') === squashTarget.replace(/s$/, '')) return true;
        }

        // 5. Keyword Overlap (Bag-of-Words with Typo Tolerance)
        const targetKeywords = extractKeywords(strippedTarget);
        const userKeywords = extractKeywords(strippedUser);

        if (targetKeywords.length > 0 && userKeywords.length > 0) {
            // Count target keywords present in student response
            const targetMatchesInUser = targetKeywords.filter(tw =>
                userKeywords.some(uw => uw === tw || (uw.length >= 4 && levenshteinDistance(uw, tw) <= 1))
            );

            // If user included all (or strong majority >= 66%) of the target keywords
            const matchRatio = targetMatchesInUser.length / targetKeywords.length;
            if (targetKeywords.length === 1 && targetMatchesInUser.length === 1) {
                return true;
            }
            if (targetKeywords.length >= 2 && matchRatio >= 0.66) {
                return true;
            }

            // Also check if user keywords are a valid subset of target keywords
            const userMatchesInTarget = userKeywords.filter(uw =>
                targetKeywords.some(tw => tw === uw || (tw.length >= 4 && levenshteinDistance(uw, tw) <= 1))
            );
            if (userKeywords.length >= 2 && userMatchesInTarget.length === userKeywords.length) {
                return true;
            }
        }

        // 6. Typo tolerance: Levenshtein distance for minor spelling mistakes on the core phrase
        const len = Math.max(strippedUser.length, strippedTarget.length);
        if (len >= 4) {
            const maxAllowedDistance = len >= 8 ? 2 : 1;
            const dist = levenshteinDistance(strippedUser, strippedTarget);
            if (dist <= maxAllowedDistance) return true;
        }
    }

    return false;
}
