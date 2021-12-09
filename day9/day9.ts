import { isDefined, map, readInputLines, reduce, sumBy } from '../shared/utils';

type Coord = [number, number];
type Grid = readonly number[][];

const toStr = ([x, y]: Coord): string => `${x},${y}`;
const parse = (line: string): number[] => line.split('').map(x => parseInt(x, 10));

const risk = (x: number): number => x + 1;

const neighboors = ([x, y]: Coord): Coord[] => [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
];

function* lowest(grid: Grid): IterableIterator<Coord> {
    for (let x = 0; x < grid.length; ++x) {
        for (let y = 0; y < grid[0].length; ++y) {
            const ns = neighboors([x, y])
                .map(([xn, yn]) => grid[xn]?.[yn])
                .filter(isDefined);

            if (grid[x][y] < Math.min(...ns)) {
                yield [x, y];
            }
        }
    }
}

function* expand(grid: Grid, coord: Coord): IterableIterator<Coord> {
    const seen = new Set<string>();
    const queue = [coord];
    while (queue.length !== 0) {
        const c = queue.pop();
        if (!isDefined(c) || seen.has(toStr(c))) {
            continue;
        }

        seen.add(toStr(c));
        const [x, y] = c;
        if (grid[x][y] === 9) {
            continue;
        }

        yield c;
        queue.push(...neighboors(c).filter(([xn, yn]) => isDefined(grid[xn]?.[yn])));
    }
}

const part1 = (grid: Grid): number =>
    sumBy(lowest(grid), ([x, y]) => risk(grid[x][y]));

const part2 = (grid: Grid): number => {
    const [a, b, c] = Array.from(map(lowest(grid), c => Array.from(expand(grid, c)).length)).sort((a, b) => b - a);
    return a * b * c;
}

(async () => {
    const input = await readInputLines('day9');
    const grid = input.map(parse);

    console.log(part1(grid));
    console.log(part2(grid));
})();
