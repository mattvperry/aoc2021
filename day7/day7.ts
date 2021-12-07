import { readInputLines, sum, sumBy } from '../shared/utils';

const parse = (line: string): number[] =>
    line.split(',').map(a => parseInt(a, 10));

const median = (nums: number[]): number => {
    const half = Math.floor(nums.length / 2);
    const sorted = nums.slice().sort((a, b) => a - b);

    return nums.length % 2 === 1
        ? sorted[half]
        : (sorted[half - 1] + sorted[half]) / 2;
};

const avg = (nums: number[]): number => Math.floor(sum(nums) / nums.length);

const calculate =
    (find: (nums: number[]) => number, fn: (num: number) => number) =>
    (nums: number[]): number => {
        const target = find(nums);
        return sumBy(nums, n => fn(Math.abs(target - n)));
    };

const part1 = calculate(median, x => x);
const part2 = calculate(avg, x => (x * (x + 1)) / 2);

(async () => {
    const [input] = await readInputLines('day7');
    const nums = parse(input);

    console.log(part1(nums));
    console.log(part2(nums));
})();
