import { Coord, CoordS, fromStr, Grid, parseGrid, toStr } from '../shared/grid';
import { map, readInputLines, reduce, repeatFn, sum } from '../shared/utils';

type Bit = 0 | 1;
type Image = {
    bits: Grid<Bit>;
    inf: Bit;
};

const parse = ([algo, _, ...grid]: string[]): [Bit[], Image] => [
    Array.from(map(algo, c => (c === '#' ? 1 : 0))),
    { bits: parseGrid<Bit>(grid, c => (c === '#' ? 1 : 0)), inf: 0 },
];

const getBin = (coord: CoordS, { bits, inf }: Image): number => {
    let bs: Bit[] = [];
    const [x, y] = fromStr(coord);
    for (const dy of [-1, 0, 1]) {
        for (const dx of [-1, 0, 1]) {
            const c = toStr([x + dx, y + dy]);
            bs.push(bits.get(c) ?? inf);
        }
    }

    return parseInt(bs.join(''), 2);
};

const bounds = ({ bits }: Image): [Coord, Coord] =>
    reduce(
        map(bits.keys(), fromStr),
        [
            [Infinity, -Infinity],
            [Infinity, -Infinity],
        ],
        ([[x1, x2], [y1, y2]], [x, y]) => [
            [Math.min(x1, x), Math.max(x2, x)],
            [Math.min(y1, y), Math.max(y2, y)],
        ],
    );

function* enhance(algo: Bit[], image: Image): IterableIterator<[CoordS, Bit]> {
    const [[x1, x2], [y1, y2]] = bounds(image);
    for (let y = y1 - 1; y <= y2 + 1; ++y) {
        for (let x = x1 - 1; x <= x2 + 1; ++x) {
            const coord = toStr([x, y]);
            const idx = getBin(coord, image);
            yield [coord, algo[idx]];
        }
    }
}

const step =
    (algo: Bit[]) =>
    (image: Image): Image => ({
        bits: new Map(enhance(algo, image)),
        inf: algo[image.inf === 0 ? 0 : 511],
    });

const count = ({ bits, inf }: Image): number =>
    inf === 1 ? Infinity : sum(bits.values());

const day20 = (algo: Bit[], image: Image): [number, number] => {
    const two = repeatFn(image, 2, step(algo));
    const fifty = repeatFn(two, 48, step(algo));

    return [count(two), count(fifty)];
};

(async () => {
    const input = await readInputLines('day20');
    const data = parse(input);

    const [part1, part2] = day20(...data);
    console.log(part1);
    console.log(part2);
})();
