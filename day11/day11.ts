import { CoordS, Grid, neighbors, parseGrid } from '../shared/grid';
import { iterateFn, map, readInputLines, sumBy, take } from '../shared/utils';

function* findFlashes(grid: Grid): IterableIterator<CoordS> {
    for (const [c, n] of grid) {
        if (n > 9) {
            yield c;
        }
    }
}

const step = ([_, grid]: [number, Grid]): [number, Grid] => {
    // increase
    grid = new Map<CoordS, number>(map(grid, ([c, n]) => [c, n + 1]));

    // flash
    let total = 0;
    while (true) {
        const flashes = Array.from(findFlashes(grid));
        if (flashes.length === 0) {
            return [total, grid];
        }

        total = total + flashes.length;
        for (const coord of flashes) {
            const newNeighbors = map(
                neighbors(grid, coord, true),
                ([cn, val]) => [cn, val > 0 ? val + 1 : 0] as const,
            );

            grid = new Map<CoordS, number>([
                ...grid,
                [coord, 0],
                ...newNeighbors,
            ]);
        }
    }
};

const part1 = (grid: Grid): number =>
    sumBy(take(101, iterateFn(step, [0, grid])), ([f]) => f);

const part2 = (grid: Grid): number => {
    let i = 0;
    for (const [num] of iterateFn(step, [0, grid])) {
        if (num === 100) {
            return i;
        }

        i = i + 1;
    }

    return -1;
};

(async () => {
    const input = await readInputLines('day11');
    const grid = parseGrid(input);

    console.log(part1(grid));
    console.log(part2(grid));
})();
