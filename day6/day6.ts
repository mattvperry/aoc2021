import {
    groupBy,
    map,
    mapEntries,
    readInputLines,
    repeatFn,
    sumBy,
} from '../shared/utils';

type Fish = {
    age: number;
    count: number;
};

const parse = (line: string): number[] =>
    line.split(',').map(a => parseInt(a, 10));

const mergeFish = (fish: Iterable<Fish>): Fish[] => {
    const byAge = groupBy(fish, ({ age }) => age);
    const merged = mapEntries(byAge, ([age, groups]) => ({
        age: parseInt(age, 10),
        count: sumBy(groups, ({ count }) => count),
    }));

    return Array.from(merged);
};

const advance = (fish: Fish[]): Fish[] => {
    const aged = mergeFish(
        map(fish, ({ age, count }) => ({
            age: age === 0 ? 6 : age - 1,
            count,
        })),
    );

    const zeroes = fish.find(({ age }) => age === 0)?.count ?? 0;
    return zeroes === 0 ? aged : [...aged, { age: 8, count: zeroes }];
};

function* day1(ages: number[]): IterableIterator<number> {
    let fish = mergeFish(map(ages, age => ({ age, count: 1 })));

    fish = repeatFn(fish, 80, advance);
    yield sumBy(fish, ({ count }) => count);

    fish = repeatFn(fish, 176, advance);
    yield sumBy(fish, ({ count }) => count);
}

(async () => {
    const [input] = await readInputLines('day6');
    const ages = parse(input);

    const [part1, part2] = day1(ages);
    console.log(part1);
    console.log(part2);
})();
