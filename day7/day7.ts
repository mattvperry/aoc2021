import { map, memoize, readInputLines, sum } from '../shared/utils';

const parse = (line: string): number[] =>
    line.split(',').map(a => parseInt(a, 10));

const part1 = (nums: number[]): number => calculate(
    nums,
    x => x,
);

const part2 = (nums: number[]): number => calculate(
    nums,
    x => (x * (x + 1)) / 2,
);

const fuel = (nums: number[], transform: (amt: number) => number) => (end: number): number =>
    sum(map(nums, n => transform(Math.abs(end - n))));

const calculate = (nums: number[], transform: (amt: number) => number): number => {
    const fn = memoize(fuel(nums, transform), e => e);
    return Math.min(...map(nums, fn));
}

(async () => {
    const [input] = await readInputLines('day7');
    const nums = parse(input);

    console.log(part1(nums));
    console.log(part2(nums));
})();
