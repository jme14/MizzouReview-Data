import { BasicInfo } from 'mizzoureview-reading/models/professor';
// below function from chatgpt with minor edits
export function generateProfessorId(
    basicInfo: BasicInfo,
    length: number = 20,
): string {
    const input = basicInfo.name.toString() + basicInfo.department;
    // Simple hash function to turn the string into a number seed
    let seed = 0;
    for (let i = 0; i < input.length; i++) {
        seed = (seed * 31 + input.charCodeAt(i)) >>> 0; // ensure unsigned int
    }

    // Pseudo-random number generator using Mulberry32 (fast and decent)
    function mulberry32(a: number) {
        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const rand = mulberry32(seed);
    const chars =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(rand() * chars.length);
        result += chars[index];
    }

    return result;
}
