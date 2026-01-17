export interface ParsedStat {
    number: number;
    suffix: string;
}

export function parseStatValue(value: string): ParsedStat {
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (match) {
        return {
            number: parseFloat(match[1]),
            suffix: match[2]
        };
    }
    return { number: 0, suffix: value };
}
