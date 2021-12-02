import { mapAsync, reduceAsync, streamInputLinesAsync } from '../shared/utils';

type Position = readonly [number, number, number];
type Move = 'forward' | 'down' | 'up';
type Command = readonly [Move, number];

const parse = (line: string): Command => {
    const [move, amt] = line.split(' ');
    return [move as Move, parseInt(amt, 10)];
};

const move1 = ([x, d, a]: Position, [dir, amt]: Command): Position => {
    switch (dir) {
        case 'forward':
            return [x + amt, d, a];
        case 'down':
            return [x, d + amt, a];
        case 'up':
            return [x, d - amt, a];
    }
};

const move2 = ([x, d, a]: Position, [dir, amt]: Command): Position => {
    switch (dir) {
        case 'forward':
            return [x + amt, d + (a * amt), a];
        case 'down':
            return [x, d, a + amt];
        case 'up':
            return [x, d, a - amt];
    }
};

export const day1 = async (data: AsyncIterable<Command>) => {
    const init: Position = [0, 0, 0];
    const [[a, b], [c, d]] = await reduceAsync(
        data,
        [init, init],
        ([a, b], cmd) => Promise.resolve([move1(a, cmd), move2(b, cmd)]));

    return [a * b, c * d];
};

(async () => {
    const input = streamInputLinesAsync('day2');
    const cmds = mapAsync(input, l => Promise.resolve(parse(l)));

    const [part1, part2] = await day1(cmds);
    console.log(part1);
    console.log(part2);
})();
