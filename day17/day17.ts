import { map, readInputLines, size } from '../shared/utils';

type Range = [start: number, end: number];

const parse = (line: string): [Range, Range] => {
    const match = /x=(-?\d+)\.\.(-?\d+), y=(-?\d+)\.\.(-?\d+)/.exec(line);
    if (match === null) {
        throw new Error('Unable to parse input.');
    }

    const [, x1, x2, y1, y2] = map(match, n => parseInt(n, 10));
    return [
        [x1, x2],
        [y1, y2],
    ];
};

const dist = (t: number, v: number) => t * ((2 * v - t + 1) / 2);

const maxY = ([start]: Range): [number, number] => {
    const maxV = -1 - start;
    const maxD = dist(maxV, maxV);
    return [maxV, maxD];
};

function* velocity(
    [lx, ux]: Range,
    [ly, uy]: Range,
    maxVy: number,
): IterableIterator<[number, number]> {
    for (let vx = 1; vx <= ux; ++vx) {
        for (let vy = ly; vy <= maxVy; ++vy) {
            for (let t = 1; t <= 2 * maxVy + 2; ++t) {
                const x = dist(Math.min(t, vx), vx);
                const y = dist(t, vy);
                if (lx <= x && x <= ux && ly <= y && y <= uy) {
                    yield [vx, vy];
                    break;
                }
            }
        }
    }
}

const day17 = ([xr, yr]: [Range, Range]): [number, number] => {
    const [maxVy, maxDy] = maxY(yr);
    const allVs = velocity(xr, yr, maxVy);
    return [maxDy, size(allVs)];
};

(async () => {
    const [input] = await readInputLines('day17');
    const ranges = parse(input);

    const [part1, part2] = day17(ranges);
    console.log(part1);
    console.log(part2);
})();
