import { map, readInputLines, reduce, zipWith } from '../shared/utils';

type Bit = '0' | '1';
type Stats = Record<Bit, number>;

const width = 12;

const parse = (line: string): Bit[] => line.split('') as Bit[];

const addStats = ({ 0: z1, 1: o1 }: Stats, { 0: z2, 1: o2 }: Stats): Stats => ({
    0: z1 + z2,
    1: o1 + o2
});

const gammaEpsilon = (input: Bit[][]): [Bit[], Bit[]] => {
    const stats = input.map(bits => bits.map(b => ({ 0: 0, 1: 0, [b]: 1 })));
    const result = stats.reduce((acc, curr) => zipWith(acc, curr, addStats));
    return [
        result.map(s => s['0'] > s['1'] ? '0' : '1'),
        result.map(s => s['0'] < s['1'] ? '0' : '1'),
    ];
};

const toNum = (bits: Bit[]): number => parseInt(bits.join(''), 2);

const part1 = (gamma: Bit[], epsilon: Bit[]): number => toNum(gamma) * toNum(epsilon);

const part2 = (input: string[], gamma: Bit[], epsilon: Bit[]): number => {
    
};

(async () => {
    const input = await readInputLines('day3');
    const [gamma, epsilon] = gammaEpsilon(input.map(parse));

    console.log(part1(gamma, epsilon));
    console.log(part2(input, gamma, epsilon));
})();
