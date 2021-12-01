import { readInputLines, zipWith, countBy } from '../shared/utils';

const day1 = (data: number[], space: number): number =>
    countBy(zipWith(data, data.slice(space), (a, b) => a < b), x => x);

(async () => {
    const input = await readInputLines('day1');
    const set = input.map(l => parseInt(l, 10));

    console.log(day1(set, 1));
    console.log(day1(set, 3));
})();