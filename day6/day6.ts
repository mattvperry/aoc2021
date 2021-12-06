import { frequency, readInputLines, repeatFn, sum } from '../shared/utils';

const parse = (line: string): number[] =>
    line.split(',').map(a => parseInt(a, 10));

const advance = ([zero, ...rest]: number[]): number[] =>
    [...rest, zero].map((c, i) => c + (i === 6 ? zero : 0));

function* day6(ages: number[]): IterableIterator<number> {
    const freq = frequency(ages);
    let fish = Array.from({ length: 9 }, (_, i) => freq[i] || 0);

    for (const times of [80, 176]) {
        fish = repeatFn(fish, times, advance);
        yield sum(fish);
    }
}

(async () => {
    const [input] = await readInputLines('day6');
    const ages = parse(input);

    const [part1, part2] = day6(ages);
    console.log(part1);
    console.log(part2);
})();
