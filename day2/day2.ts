import {
    isLiteral,
    mapAsync,
    reduceAsync,
    streamInputLinesAsync,
} from '../shared/utils';

type Position = readonly [number, number, number];
type Move = typeof moves[number];
type Command = readonly [Move, number];
type MoveSet = Record<Move, (pos: Position, amt: number) => Position>;

const moves = ['forward', 'down', 'up'] as const;

const parse = (line: string): Command => {
    const [move, amt] = line.split(' ');
    if (!isLiteral(move, moves)) {
        throw new Error(`${move} is not a move`);
    }

    return [move, parseInt(amt, 10)];
};

const part1: MoveSet = {
    forward: ([x, d, a], amt) => [x + amt, d, a],
    down: ([x, d, a], amt) => [x, d + amt, a],
    up: ([x, d, a], amt) => [x, d - amt, a],
};

const part2: MoveSet = {
    forward: ([x, d, a], amt) => [x + amt, d + a * amt, a],
    down: ([x, d, a], amt) => [x, d, a + amt],
    up: ([x, d, a], amt) => [x, d, a - amt],
};

export const day1 = async (data: AsyncIterable<Command>) => {
    const seed: readonly [Position, Position] = [
        [0, 0, 0],
        [0, 0, 0],
    ];

    const [[x1, d1], [x2, d2]] = await reduceAsync(
        data,
        seed,
        ([p1, p2], [dir, amt]) =>
            [part1[dir](p1, amt), part2[dir](p2, amt)] as const,
    );

    return [x1 * d1, x2 * d2];
};

(async () => {
    const input = streamInputLinesAsync('day2');
    const cmds = mapAsync(input, l => parse(l));

    const [part1, part2] = await day1(cmds);
    console.log(part1);
    console.log(part2);
})();
