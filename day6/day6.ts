import { countBy, entries, frequency, groupBy, map, mod, readInputLines, reduce, repeatFn } from '../shared/utils';

type Fish = {
    age: number;
    count: number;
}

const parse = (line: string): number[] => line.split(',').map(a => parseInt(a, 10));

const advance = (fish: Fish[]): Fish[] => {
    const zeroes = fish.find(({ age }) => age === 0)?.count ?? 0;
    const decreased = fish.map(({ age, count }) => ({
        age: age === 0 ? 6 : age - 1,
        count,
    }));

    const grouped = Array.from(map(entries(groupBy(decreased, ({ age }) => age)), ([age, groups]) => ({
        age: +age,
        count: reduce(groups, 0, (acc, { count }) => acc + count),
    })));

    return zeroes === 0 ? grouped : [...grouped, { age: 8, count: zeroes }];
}

const part1 = (ages: number[]): number => {
    const fish = map(entries(frequency(ages)), ([age, count]) => ({ age: +age, count }));
    const result = repeatFn(Array.from(fish), 256, advance);
    return reduce(result, 0, (acc, { count }) => acc + count);
}

(async () => {
    const [input] = await readInputLines('day6');
    const ages = parse(input);

    console.log(part1(ages));
})();
