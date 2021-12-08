import {
    countBy,
    difference,
    isSubset,
    mapAsync,
    reduce,
    reduceAsync,
    streamInputLinesAsync,
} from '../shared/utils';

type Entry = [Set<string>[], string[]];

const parse = (line: string): Entry => {
    const [input, output] = line.split('|').map(x =>
        x
            .trim()
            .split(' ')
            .map(y => y.split('').sort()),
    );
    return [input.map(i => new Set(i)), output.map(toStr)];
};

const toStr = (x: Iterable<string>): string =>
    reduce(x, '', (acc, curr) => acc + curr);

const deduce = (input: Set<string>[]) => {
    const one = input.find(i => i.size === 2)!;
    const four = input.find(i => i.size === 4)!;
    const seven = input.find(i => i.size === 3)!;
    const eight = input.find(i => i.size === 7)!;

    const leftmid = difference(four, one);
    const leftbot = difference(difference(eight, seven), four);

    const zero = input.find(i => i.size === 6 && !isSubset(leftmid, i))!;
    const six = input.find(i => i.size === 6 && !isSubset(one, i))!;
    const nine = input.find(i => i.size === 6 && !isSubset(leftbot, i))!;

    const two = input.find(i => i.size === 5 && isSubset(leftbot, i))!;
    const three = input.find(i => i.size === 5 && isSubset(one, i))!;
    const five = input.find(i => i.size === 5 && isSubset(leftmid, i))!;

    return new Map(
        [zero, one, two, three, four, five, six, seven, eight, nine].map(
            (s, i) => [toStr(s), i],
        ),
    );
};

const part1 = ([_, output]: Entry): number =>
    countBy(output, x => [2, 3, 4, 7].includes(x.length));

const part2 = ([input, output]: Entry): number => {
    const lookup = deduce(input);
    const nums = output.map(d => lookup.get(d));
    return parseInt(nums.join(''), 10);
};

const day8 = (
    entries: AsyncIterable<Entry>,
): Promise<readonly [number, number]> => {
    const parts = mapAsync(entries, e => [part1(e), part2(e)]);
    return reduceAsync(
        parts,
        [0, 0] as readonly [number, number],
        ([a1, a2], [c1, c2]) => [a1 + c1, a2 + c2] as const,
    );
};

(async () => {
    const input = streamInputLinesAsync('day8');
    const entries = mapAsync(input, parse);

    const [part1, part2] = await day8(entries);
    console.log(part1);
    console.log(part2);
})();
