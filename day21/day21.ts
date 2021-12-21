import { readInputLines } from '../shared/utils';

type Positions = [number, number];
type Player = { pos: number; score: number };
type GameState = [{ 0: Player; 1: Player }, 0 | 1];

const parse = (lines: string[]): Positions =>
    lines.map(l => parseInt(l.substring(28), 10)) as Positions;

const mod1 = (n: number, m: number): number => ((n - 1) % m) + 1;

const scores = ([
    {
        0: { score: s1 },
        1: { score: s2 },
    },
]: GameState): [number, number] => [s1, s2];

const step = ([players, turn]: GameState, roll: number): GameState => {
    const player = players[turn];
    const pos = mod1(player.pos + roll, 10);
    const score = player.score + pos;
    return [{ ...players, [turn]: { pos, score } }, turn === 0 ? 1 : 0];
};

const play = (game: GameState): number => {
    let die = 1;
    let roll = 0;
    let turns = 0;
    while (true) {
        const [s1, s2] = scores(game);
        if (s1 >= 1000 || s2 >= 1000) {
            return Math.min(s1, s2) * (turns * 3);
        }

        roll = die + mod1(die + 1, 100) + mod1(die + 2, 100);
        die = mod1(die + 3, 100);
        game = step(game, roll);
        turns = turns + 1;
    }
};

const branches: [number, number][] = [
    [1, 3],
    [3, 4],
    [6, 5],
    [7, 6],
    [6, 7],
    [3, 8],
    [1, 9],
];

const wins = (game: GameState): [number, number] => {
    const [s1, s2] = scores(game);
    if (s1 >= 21) {
        return [1, 0];
    }

    if (s2 >= 21) {
        return [0, 1];
    }

    return branches.reduce(
        ([a1, a2], [n, r]) => {
            const [w1, w2] = wins(step(game, r));
            return [a1 + n * w1, a2 + n * w2];
        },
        [0, 0],
    );
};

const part1 = ([one, two]: Positions): number =>
    play([{ 0: { pos: one, score: 0 }, 1: { pos: two, score: 0 } }, 0]);

const part2 = ([one, two]: Positions): number =>
    Math.max(
        ...wins([{ 0: { pos: one, score: 0 }, 1: { pos: two, score: 0 } }, 0]),
    );

(async () => {
    const input = await readInputLines('day21');
    const pos = parse(input);

    console.log(part1(pos));
    console.log(part2(pos));
})();
