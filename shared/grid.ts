export type CoordS = `${number},${number}`;
export type Coord = [number, number];
export type Grid = Map<CoordS, number>;

export const toStr = ([x, y]: Coord): CoordS => `${x},${y}`;
export const fromStr = (coord: CoordS): Coord =>
    coord.split(',').map(x => parseInt(x, 10)) as Coord;

export const parseGrid = (lines: string[]): Grid => {
    const grid = new Map<CoordS, number>();

    for (let x = 0; x < lines.length; ++x) {
        for (let y = 0; y < lines[0].length; ++y) {
            grid.set(toStr([x, y]), parseInt(lines[x][y], 10));
        }
    }

    return grid;
};

export const neighbors = (
    grid: Grid,
    coord: CoordS,
    diag: boolean = false,
): [CoordS, number][] => {
    const [x, y] = fromStr(coord);
    const coords = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
    ];

    const ds = [
        [x + 1, y + 1],
        [x + 1, y - 1],
        [x - 1, y + 1],
        [x - 1, y - 1],
    ];

    return coords
        .concat(diag ? ds : [])
        .map(([x, y]) => toStr([x, y]))
        .filter(k => grid.has(k))
        .map(k => [k, grid.get(k)!]);
};
