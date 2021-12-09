import { isDefined, readInputLines, reduce, size } from '../shared/utils';

type CoordS = `${number},${number}`;
type Coord = [number, number];
type Grid = Map<CoordS, number>;

const toStr = ([x, y]: Coord): CoordS => `${x},${y}`;
const fromStr = (coord: CoordS): Coord =>
    coord.split(',').map(x => parseInt(x, 10)) as Coord;

const parse = (lines: string[]): Grid => {
    const grid = new Map<CoordS, number>();

    for (let x = 0; x < lines.length; ++x) {
        for (let y = 0; y < lines[0].length; ++y) {
            grid.set(toStr([x, y]), parseInt(lines[x][y], 10));
        }
    }

    return grid;
};

const neighbors = (grid: Grid, coord: CoordS): [CoordS, number][] => {
    const [x, y] = fromStr(coord);
    const coords = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
    ];

    return coords
        .map(([x, y]) => toStr([x, y]))
        .filter(k => grid.has(k))
        .map(k => [k, grid.get(k)!]);
};

function* lowest(grid: Grid): ReturnType<Grid['entries']> {
    for (const [c, v] of grid.entries()) {
        const ns = neighbors(grid, c).map(([_, v]) => v);
        if (v < Math.min(...ns)) {
            yield [c, v];
        }
    }
}

function* expand(grid: Grid, coord: CoordS): IterableIterator<CoordS> {
    const seen = new Set<CoordS>();
    const queue = [coord];
    while (queue.length !== 0) {
        const c = queue.pop();
        if (!isDefined(c) || seen.has(c) || grid.get(c) === 9) {
            continue;
        }

        yield c;

        seen.add(c);
        queue.push(...neighbors(grid, c).map(([k]) => k));
    }
}

const day9 = (grid: Grid): [number, number] => {
    const [risks, basins] = reduce(
        lowest(grid),
        [0, [] as number[]],
        ([r, b], [c, v]) => [r + v + 1, [...b, size(expand(grid, c))]],
    );

    const [a, b, c] = basins.sort((a, b) => b - a);
    return [risks, a * b * c];
};

(async () => {
    const input = await readInputLines('day9');
    const grid = parse(input);

    const [part1, part2] = day9(grid);
    console.log(part1);
    console.log(part2);
})();
