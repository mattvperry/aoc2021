import { isDefined, readInputLines, sumBy } from '../shared/utils';

type Complete = { state: 'complete' };
type Incomplete = { state: 'incomplete', remaining: string[] };
type Invalid = { state: 'invalid', expected: string, actual: string };

type Result = Complete | Incomplete | Invalid;

const isIncomplete = (r: Result): r is Incomplete => r.state === 'incomplete';
const isInvalid = (r: Result): r is Invalid => r.state === 'invalid';

const toClose: Record<string, string> = {
    '(': ')',
    '{': '}',
    '[': ']',
    '<': '>',
};

const parse = (input: string): Result => {
    const stack: string[] = [];
    for (const char of input) {
        if (char in toClose) {
            stack.push(char);
            continue;
        }

        const top = stack.pop();
        if (!isDefined(top) || toClose[top] !== char) {
            return {
                state: 'invalid',
                expected: top ? toClose[top] : 'Opening',
                actual: char
            };
        }
    }

    return stack.length === 0
        ? { state: 'complete' }
        : { state: 'incomplete', remaining: stack.map(c => toClose[c]).reverse() };
}

const score1: Record<string, number> = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137,
};

const score2: Record<string, number> = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4,
};

const day10 = (input: string[]): [number, number] => {
    const results = input.map(parse);
    const part1 = sumBy(results.filter(isInvalid), ({ actual }) => score1[actual]);;
    const part2 = results
        .filter(isIncomplete)
        .map(r => r.remaining.reduce((acc, curr) => (acc * 5) + score2[curr], 0))
        .sort((a, b) => a - b);

    return [
        part1,
        part2[Math.floor(part2.length / 2)],
    ]
}

(async () => {
    const input = await readInputLines('day10');

    const [part1, part2] = day10(input);
    console.log(part1);
    console.log(part2);
})();
