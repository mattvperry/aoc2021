import {
    concatMap,
    countBy,
    entries,
    readInputLines, reduce,
} from '../shared/utils';

type Point = [number, number];
type Line = [Point, Point];

const toStr = ([x, y]: Point): string => `${x},${y}`;
const fromStr = (pt: string): Point => pt.split(',').map(c => parseInt(c, 10)) as Point;

const parse = (line: string): Line => {
    return line
        .split(' -> ')
        .map(fromStr) as Line;
}

const straight = ([[x1, y1], [x2, y2]]: Line): boolean =>
    x1 === x2 || y1 === y2;

const compare = (x: number, y: number): number => {
    if (x === y) {
        return 0;
    }

    if (x > y) {
        return -1;
    }

    if (x < y) {
        return 1;
    }

    throw new Error('impossible');
}

function* points([[x1, y1], [x2, y2]]: Line): IterableIterator<Point> {
    const rise = compare(y2, y1);
    const run = compare(x2, x1);

    let [x, y] = [x2, y2];
    while (x !== x1 || y !== y1) {
        yield [x, y];
        [x, y] = [x + run, y + rise];
    }

    yield [x1, y1];
}

const part1 = (lines: Line[]): number => {
    const allPoints = concatMap(lines, points);
    const freq = reduce(
        allPoints,
        {} as Record<string, number>,
        (acc, curr) => {
            const key = toStr(curr);
            acc[key] = acc[key] ? acc[key] + 1 : 1;
            return acc;
        },
    );

    return countBy(entries(freq), ([_, v]) => v > 1);
}

(async () => {
    const input = await readInputLines('day5');
    const lines = input.map(parse);

    console.log(part1(lines));
})();
