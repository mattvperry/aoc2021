import { mod, readInputLines } from '../shared/utils';

type Positions = [number, number];
type Die = number;
type Player = { position: number; score: number };
type GameState = [{ 0: Player; 1: Player }, Die, 0 | 1];

const parse = (lines: string[]): Positions =>
    lines.map(l => parseInt(l.substring(28), 10)) as Positions;

const mod1 = (n: number, m: number): number => mod(n - 1, m) + 1;

const roll = (die: Die): [number, Die] => {
    const next = die + mod1(die + 1, 100) + mod1(die + 2, 100);
    const value = mod1(die + 3, 100);
    return [next, value];
};

const step = ([players, die, turn]: GameState): GameState => {
    const [r, d] = roll(die);
    const player = players[turn];
    const position = mod1(player.position + r, 10);
    const score = player.score + position;
    return [{ ...players, [turn]: { position, score } }, d, turn === 0 ? 1 : 0];
};

const play = (game: GameState): number => {
    let turns = 0;
    while (true) {
        const [
            {
                0: { score: s1 },
                1: { score: s2 },
            },
        ] = game;

        if (s1 >= 1000 || s2 >= 1000) {
            return Math.min(s1, s2) * (turns * 3);
        }

        game = step(game);
        turns = turns + 1;
    }
};

const part1 = ([one, two]: Positions): number =>
    play([
        { 0: { position: one, score: 0 }, 1: { position: two, score: 0 } },
        1,
        0,
    ]);

(async () => {
    const input = await readInputLines('day21');
    const pos = parse(input);

    console.log(part1(pos));
})();
