import { CoordS, fromStr, toStr } from '../shared/grid';
import { map, readInputLines, reduce, splitOn } from '../shared/utils';

type Grid = Set<CoordS>;
type Fold = ['x' | 'y', number];

const parse = (lines: string[]): [Grid, Fold[]] => {
    const [grid, folds] = splitOn(lines, '');
    return [
        new Set<CoordS>(grid as CoordS[]),
        folds.map(line => {
            const [d, l] = line.substring(11).split('=');
            return [d as Fold[0], parseInt(l, 10)];
        }),
    ];
};

const fold = (grid: Grid, [dir, line]: Fold): Grid => {
    // We should be able to safely ignore x or y === line
    // because the input claims there's never a point on a line
    return new Set<CoordS>(
        map(grid, coord => {
            const [x, y] = fromStr(coord);
            switch (dir) {
                case 'x':
                    return toStr([x > line ? line - (x - line) : x, y]);
                case 'y':
                    return toStr([x, y > line ? line - (y - line) : y]);
            }
        }),
    );
};

const printGrid = (grid: Grid): void => {
    const [width, height] = reduce(grid, [0, 0], ([w, h], curr) => {
        const [x, y] = fromStr(curr);
        return [Math.max(x, w), Math.max(y, h)];
    });

    for (let y = 0; y <= height; ++y) {
        const line: string[] = [];
        for (let x = 0; x <= width; ++x) {
            line.push(grid.has(toStr([x, y])) ? '#' : ' ');
        }
        console.log(line.join(''));
    }
};

const day13 = (grid: Grid, [first, ...rest]: Fold[]): [number, Grid] => {
    grid = fold(grid, first);
    const part1 = grid.size;

    for (const f of rest) {
        grid = fold(grid, f);
    }

    return [part1, grid];
};

(async () => {
    const input = await readInputLines('day13');

    const [part1, part2] = day13(...parse(input));
    console.log(part1);
    printGrid(part2);
})();
