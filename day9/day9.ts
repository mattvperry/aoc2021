import { CoordS, Grid, neighbors, parseGrid } from '../shared/grid';
import { isDefined, readInputLines, reduce, size } from '../shared/utils';

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
    const grid = parseGrid(input);

    const [part1, part2] = day9(grid);
    console.log(part1);
    console.log(part2);
})();
