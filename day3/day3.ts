import { charFrequency, readInputLines } from '../shared/utils';

type Bit = '0' | '1';
type Freqs = { gamma: Bit; epsilon: Bit };

const width = 12;

const parse = (line: string): Bit[] => line.split('') as Bit[];

const freqs = (input: Bit[][], column: number): Freqs => {
    const stats = charFrequency(input.map(b => b[column]));
    return {
        gamma: stats['0'] > stats['1'] ? '0' : '1',
        epsilon: stats['0'] <= stats['1'] ? '0' : '1',
    };
};

const narrow = (input: Bit[][], fn: (freqs: Freqs) => Bit): Bit[] => {
    let result = input;
    for (let i = 0; i < width; ++i) {
        if (result.length == 1) {
            break;
        }

        const criteria = fn(freqs(result, i));
        result = result.filter(bs => bs[i] === criteria);
    }

    return result[0];
};

const toNum = (bits: Bit[]): number => parseInt(bits.join(''), 2);

const part1 = (input: Bit[][]): number => {
    const allFreqs = Array.from({ length: width }, (_, k) => freqs(input, k));
    const gamma = allFreqs.map(({ gamma }) => gamma);
    const epsilon = allFreqs.map(({ epsilon }) => epsilon);
    return toNum(gamma) * toNum(epsilon);
};

const part2 = (input: Bit[][]): number => {
    const generator = narrow(input, ({ gamma }) => gamma);
    const scrubber = narrow(input, ({ epsilon }) => epsilon);
    return toNum(generator) * toNum(scrubber);
};

(async () => {
    const lines = await readInputLines('day3');
    const input = lines.map(parse);

    console.log(part1(input));
    console.log(part2(input));
})();
