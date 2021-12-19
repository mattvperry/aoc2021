import {
    concatMap,
    entries,
    find,
    frequency,
    isDefined,
    map,
    readInputLines,
    splitOnEvery,
} from '../shared/utils';

type CoordS = `${number},${number},${number}`;
type Coord = [number, number, number];
type Translator = (coord: Coord) => Coord;

const toStr = ([x, y, z]: Coord): CoordS => `${x},${y},${z}`;
const fromStr = (coord: string): Coord =>
    coord.split(',').map(n => parseInt(n, 10)) as Coord;

const parse = (lines: string[]): Coord[][] =>
    Array.from(map(splitOnEvery(lines, ''), g => g.slice(1).map(fromStr)));

const orders = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
];

const combos = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
];

function* offsets(
    [ax, ay, az]: Coord,
    b: Coord,
): IterableIterator<[CoordS, Translator]> {
    for (const [o1, o2, o3] of orders) {
        for (const [c1, c2, c3] of combos) {
            const coord: Coord = [
                ax + c1 * b[o1],
                ay + c2 * b[o2],
                az + c3 * b[o3],
            ];
            const translate = (from: Coord): Coord => [
                coord[0] - c1 * from[o1],
                coord[1] - c2 * from[o2],
                coord[2] - c3 * from[o3],
            ];

            yield [toStr(coord), translate];
        }
    }
}

function* allOffsets(
    as: Coord[],
    bs: Coord[],
): IterableIterator<Iterable<[CoordS, Translator]>> {
    for (const a of as) {
        for (const b of bs) {
            yield offsets(a, b);
        }
    }
}

function overlap(as: Coord[], bs: Coord[]): [CoordS, Translator] | undefined {
    const os = Array.from(allOffsets(as, bs)).map(o => Array.from(o));
    const ts = new Map(concatMap(os, x => x));
    for (let i = 0; i < 48; ++i) {
        const freq = frequency(os.map(o => o[i][0]));
        const ov = entries(freq).find(([, n]) => n >= 12);
        if (isDefined(ov)) {
            return [ov[0], ts.get(ov[0])!];
        }
    }

    return undefined;
}

const normalize = ([first, ...rest]: Coord[][]): [CoordS, Coord[]][] => {
    let normal: [CoordS, Coord[]][] = [[toStr([0, 0, 0]), first]];
    while (rest.length !== 0) {
        const next = rest.shift()!;
        const ov = find(
            map(normal, ([, n]) => overlap(n, next)),
            isDefined,
        );
        if (isDefined(ov)) {
            const [coord, translate] = ov;
            normal.push([coord, next.map(translate)]);
        } else {
            rest.push(next);
        }
    }

    return normal;
};

const day19 = (scanners: Coord[][]): [number, number] => {
    const normal = normalize(scanners);
    const beacons = new Set(concatMap(normal, ([, cs]) => cs.map(toStr)));

    let max = 0;
    for (const [c1] of normal) {
        for (const [c2] of normal) {
            const [x1, y1, z1] = fromStr(c1);
            const [x2, y2, z2] = fromStr(c2);
            const dist =
                Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2);
            max = Math.max(max, dist);
        }
    }

    return [beacons.size, max];
};

(async () => {
    const input = await readInputLines('day19');
    const scanners = parse(input);

    const [part1, part2] = day19(scanners);
    console.log(part1);
    console.log(part2);
})();
