import {
    difference,
    isDefined,
    map,
    partition,
    readInputLines,
    reduce,
    splitOnEvery,
    zipper,
} from '../shared/utils';

type Coord = [number, number];
type Board = {
    numbers: Record<number, Coord>;
    x: number[];
    y: number[];
};

const size = 5;

const parseNums = (line: string, delim: RegExp | string): number[] =>
    line.split(delim).map(d => parseInt(d, 10));

const parseBoard = (board: string[]): Board => {
    const grid = board.map(l => parseNums(l.trim(), /\s+/));
    const numbers: Board['numbers'] = {};
    for (let y = 0; y < size; ++y) {
        for (let x = 0; x < size; ++x) {
            numbers[grid[y][x]] = [x, y];
        }
    }

    return {
        numbers,
        x: Array.from({ length: size }, () => 0),
        y: Array.from({ length: size }, () => 0),
    };
};

const mark = (board: Board, num: number): Board => {
    const coord = board.numbers[num];
    if (!isDefined(coord)) {
        return board;
    }

    const [x, y] = coord;
    return {
        numbers: board.numbers,
        x: board.x.map((v, i) => v + (i === x ? 1 : 0)),
        y: board.y.map((v, i) => v + (i === y ? 1 : 0)),
    };
};

const isWinner = ({ x, y }: Board): boolean =>
    x.some(a => a === size) || y.some(a => a === size);

function* winners(nums: number[], boards: Board[]): IterableIterator<number> {
    let winner: Board | undefined = undefined;
    let rest = boards;

    for (const [init, num] of zipper(nums)) {
        rest = rest.map(b => mark(b, num));
        [[winner], rest] = partition(rest, isWinner);
        if (!isDefined(winner)) {
            continue;
        }

        const unmarked = difference(
            new Set(Object.keys(winner.numbers).map(k => parseInt(k, 10))),
            new Set([...init, num]),
        );

        yield num * reduce(unmarked, 0, (acc, curr) => acc + curr);
    }
}

const day1 = (nums: number[], boards: Board[]): [number, number] => {
    const ws = Array.from(winners(nums, boards));
    return [ws[0], ws[ws.length - 1]];
};

(async () => {
    const [first, _, ...rest] = await readInputLines('day4');
    const nums = parseNums(first, ',');
    const boards = Array.from(map(splitOnEvery(rest, ''), parseBoard));

    const [part1, part2] = day1(nums, boards);
    console.log(part1);
    console.log(part2);
})();
