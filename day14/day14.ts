import {
    concatMap,
    entries,
    frequency,
    map,
    pairwise,
    readInputLines,
    reduce,
    repeatFn,
    splitOn,
} from '../shared/utils';

type Pairs = Record<string, number>;
type Rules = Map<string, string>;

const parse = (lines: string[]): [Pairs, Rules] => {
    const [[t], rs] = splitOn(lines, '');
    return [
        frequency(map(pairwise(t), ([a, b]) => a + b)),
        new Map<string, string>(
            rs.map(r => r.split(' -> ') as [string, string]),
        ),
    ];
};

const step =
    (rules: Rules) =>
    (pairs: Pairs): Pairs => {
        const add = concatMap(entries(pairs), ([[a, b], c]) => {
            const mid = rules.get(a + b)!;
            return [[a + mid, c] as const, [mid + b, c] as const];
        });

        return reduce(add, {} as Pairs, (acc, [p, c]) => {
            acc[p] = (acc[p] ?? 0) + c;
            return acc;
        });
    };

const hiLo = (pairs: Pairs): number => {
    const counts = reduce(
        entries(pairs),
        {} as Record<string, number>,
        (acc, [[a], c]) => {
            acc[a] = (acc[a] ?? 0) + c;
            return acc;
        },
    );

    const sorted = Object.values(counts).sort((a, b) => b - a);
    return sorted[0] - sorted[sorted.length - 1] + 1;
};

const day14 = (pairs: Pairs, rules: Rules): [number, number] => {
    const part1 = repeatFn(pairs, 10, step(rules));
    const part2 = repeatFn(part1, 30, step(rules));
    return [hiLo(part1), hiLo(part2)];
};

(async () => {
    const input = await readInputLines('day14');
    const data = parse(input);

    const [part1, part2] = day14(...data);
    console.log(part1);
    console.log(part2);
})();
