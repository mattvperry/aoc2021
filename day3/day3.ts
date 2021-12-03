import { charFrequency, readInputLines } from '../shared/utils';

type Bit = '0' | '1';

const width = 12;

const parse = (line: string): Bit[] => line.split('') as Bit[];

const freqs = (input: Bit[][], column: number): [Bit, Bit] => {
    const stats = charFrequency(input.map(b => b[column]));
    return [
        stats['0'] > stats['1'] ? '0' : '1',
        stats['0'] <= stats['1'] ? '0' : '1',
    ];
};

const narrow = (
    input: Bit[][],
    fn: (gamma: Bit, epsilon: Bit) => Bit,
): Bit[] => {
    let result = input;
    for (let i = 0; i < width; ++i) {
        if (result.length == 1) {
            break;
        }

        result = result.filter(bs => bs[i] === fn(...freqs(result, i)));
    }

    return result[0];
};

const toNum = (bits: Bit[]): number => parseInt(bits.join(''), 2);

const part1 = (input: Bit[][]): number => {
    const allFreqs = Array.from({ length: width }, (_, k) => freqs(input, k));
    const gamma = allFreqs.map(([a]) => a);
    const epsilon = allFreqs.map(([_, b]) => b);
    return toNum(gamma) * toNum(epsilon);
};

const part2 = (input: Bit[][]): number => {
    const generator = narrow(input, gamma => gamma);
    const scrubber = narrow(input, (_, epsilon) => epsilon);
    return toNum(generator) * toNum(scrubber);
};

(async () => {
    const lines = await readInputLines('day3');
    const input = lines.map(parse);

    console.log(part1(input));
    console.log(part2(input));
})();
