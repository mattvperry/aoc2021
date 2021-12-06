import {
    frequency,
    concatMap,
    countBy,
    map,
    readInputLines,
} from '../shared/utils';

type Point = [number, number];
type Line = [Point, Point];

const toStr = ([x, y]: Point): string => `${x},${y}`;
const fromStr = (pt: string): Point =>
    pt.split(',').map(c => parseInt(c, 10)) as Point;

const parse = (line: string): Line => line.split(' -> ').map(fromStr) as Line;

const straight = ([[x1, y1], [x2, y2]]: Line): boolean =>
    x1 === x2 || y1 === y2;

const compare = (x: number, y: number): number => (x > y ? -1 : x < y ? 1 : 0);

function* points([[x1, y1], [x2, y2]]: Line): IterableIterator<Point> {
    const dx = compare(y2, y1);
    const dy = compare(x2, x1);

    for (
        let [x, y] = [x2, y2];
        x !== x1 + dy || y !== y1 + dx;
        [x, y] = [x + dy, y + dx]
    ) {
        yield [x, y];
    }
}

const intersections = (lines: Line[]): number => {
    const allPoints = concatMap(lines, points);
    const freq = frequency(map(allPoints, toStr));
    return countBy(Object.values(freq), x => x > 1);
};

const day5 = (lines: Line[]): [number, number] => [
    intersections(lines.filter(straight)),
    intersections(lines),
];

(async () => {
    const input = await readInputLines('day5');
    const lines = input.map(parse);

    const [part1, part2] = day5(lines);
    console.log(part1);
    console.log(part2);
})();
