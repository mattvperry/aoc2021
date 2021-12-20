export type CoordS = `${number},${number}`;
export type Coord = [number, number];
export type Grid<T = number> = Map<CoordS, T>;

export const toStr = ([x, y]: Coord): CoordS => `${x},${y}`;
export const fromStr = (coord: CoordS): Coord =>
    coord.split(',').map(x => parseInt(x, 10)) as Coord;

const asNum = (c: string): number => parseInt(c, 10);

export function parseGrid(lines: string[]): Grid;
export function parseGrid<T>(lines: string[], fn: (c: string) => T): Grid<T>;
export function parseGrid<T>(lines: string[], fn?: (c: string) => T): Grid<T> {
    const grid = new Map<CoordS, T>();

    for (let y = 0; y < lines.length; ++y) {
        for (let x = 0; x < lines[0].length; ++x) {
            grid.set(toStr([x, y]), (fn ?? asNum)(lines[y][x]) as T);
        }
    }

    return grid;
}

export const neighbors = <T = number>(
    grid: Grid<T>,
    coord: CoordS,
    diag: boolean = false,
): [CoordS, T][] => {
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
