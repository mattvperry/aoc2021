import { CoordS, fromStr, toStr } from '../shared/grid';
import { readInputLines } from '../shared/utils';

type State = {
    size: [number, number];
    east: Set<CoordS>;
    south: Set<CoordS>;
};

const parse = (lines: string[]): State => {
    const width = lines[0].length;
    const height = lines.length;
    const east = new Set<CoordS>();
    const south = new Set<CoordS>();

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const char = lines[y][x];
            if (char === '>') {
                east.add(toStr([x, y]));
            } else if (char === 'v') {
                south.add(toStr([x, y]));
            }
        }
    }

    return { size: [width, height], east, south };
};

const move = (
    [width, height]: State['size'],
    coord: CoordS,
    dir: 'east' | 'south',
): CoordS => {
    const [x, y] = fromStr(coord);
    return dir === 'east'
        ? toStr([x === width - 1 ? 0 : x + 1, y])
        : toStr([x, y === height - 1 ? 0 : y + 1]);
};

const step = ({ size, east, south }: State): [State, boolean] => {
    const nextE = new Set<CoordS>(east);
    const nextS = new Set<CoordS>(south);

    for (const coord of east) {
        const next = move(size, coord, 'east');
        if (!east.has(next) && !south.has(next)) {
            nextE.delete(coord);
            nextE.add(next);
        }
    }

    for (const coord of south) {
        const next = move(size, coord, 'south');
        if (!nextE.has(next) && !south.has(next)) {
            nextS.delete(coord);
            nextS.add(next);
        }
    }

    return [
        {
            size,
            east: nextE,
            south: nextS,
        },
        [...east].some(e => !nextE.has(e)) ||
            [...south].some(s => !nextS.has(s)),
    ];
};

const part1 = (state: State): number => {
    let steps = 0;
    while (true) {
        const [next, moved] = step(state);
        steps = steps + 1;
        if (!moved) {
            return steps;
        }

        state = next;
    }
};

(async () => {
    const input = await readInputLines('day25');
    const state = parse(input);

    console.log(part1(state));
})();
