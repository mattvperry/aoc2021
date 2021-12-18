import { isDefined, readInputLines, reduce } from '../shared/utils';

type Num = {
    type: 'num';
    value: number;
};

type Pair = {
    type: 'pair';
    left: Node;
    right: Node;
};

type SimplePair = Pair & {
    left: Num;
    right: Num;
};

type Node = Num | Pair;

const parse = (line: string): Node => {
    let ops: string[] = [];
    let exp: Node[] = [];
    let regex: RegExp = /^(\[|\]|,|\d+)(.*)$/;
    let [, token, rest] = regex.exec(line) ?? [];
    while (isDefined(token)) {
        if (token === '[') {
            ops.push(token);
        } else if (/\d+/.test(token)) {
            exp.push({
                type: 'num',
                value: parseInt(token, 10),
            });
        } else if (token === ',' || token === ']') {
            while (ops.length !== 0) {
                if (ops.at(-1) === '[') {
                    break;
                }

                const op = ops.pop();
                const right = exp.pop();
                const left = exp.pop();
                if (!isDefined(op) || !isDefined(right) || !isDefined(left)) {
                    throw new Error('Unable to parse.');
                }

                exp.push(add(left, right));
            }

            if (token === ',') {
                ops.push(token);
            } else {
                ops.pop();
            }
        }

        [, token, rest] = regex.exec(rest) ?? [];
    }

    return exp[0];
};

const add = (left: Node, right: Node): Pair => ({
    type: 'pair',
    left,
    right,
});

const num = (value: number): Num => ({
    type: 'num',
    value,
});

const isSimple = (node: Node): node is SimplePair =>
    node.type === 'pair' &&
    node.left.type === 'num' &&
    node.right.type === 'num';

function* inorder(
    node: Node,
    depth: number,
): IterableIterator<[number, Num | SimplePair]> {
    if ((depth === 4 && isSimple(node)) || node.type === 'num') {
        yield [depth, node];
    } else if (node.type === 'pair') {
        yield* inorder(node.left, depth + 1);
        yield* inorder(node.right, depth + 1);
    }
}

const explode = (node: Node): boolean => {
    const list = Array.from(inorder(node, 0));
    const idx = list.findIndex(([d, n]) => d === 4 && isSimple(n));
    if (idx === -1) {
        return false;
    }

    const [, expl] = list[idx];
    const [, left] = list[idx - 1] ?? [];
    const [, right] = list[idx + 1] ?? [];
    if (!isSimple(expl)) {
        throw new Error('Impossible');
    }

    if (isDefined(left) && left.type === 'num') {
        left.value += expl.left.value;
    }

    if (isDefined(right)) {
        if (right.type === 'num') {
            right.value += expl.right.value;
        } else if (isSimple(right)) {
            right.left.value += expl.right.value;
        }
    }

    const unsafe: any = expl;
    delete unsafe.left;
    delete unsafe.right;
    unsafe.type = 'num';
    unsafe.value = 0;

    return true;
};

const split = (node: Node): boolean => {
    if (node.type === 'num') {
        return false;
    }

    if (node.left.type === 'num' && node.left.value > 9) {
        const value = node.left.value;
        node.left = add(num(Math.floor(value / 2)), num(Math.ceil(value / 2)));
        return true;
    } else if (node.left.type === 'pair') {
        const recurse = split(node.left);
        if (recurse) {
            return true;
        }
    }

    if (node.right.type === 'num' && node.right.value > 9) {
        const value = node.right.value;
        node.right = add(num(Math.floor(value / 2)), num(Math.ceil(value / 2)));
        return true;
    } else if (node.right.type === 'pair') {
        const recurse = split(node.right);
        if (recurse) {
            return true;
        }
    }

    return false;
};

const result = (left: Node, right: Node): Node => {
    const pair = add(left, right);
    while (true) {
        if (explode(pair)) {
            continue;
        }

        if (!split(pair)) {
            break;
        }
    }

    return pair;
};

const magnitude = (node: Node): number => {
    switch (node.type) {
        case 'num':
            return node.value;
        case 'pair':
            return 3 * magnitude(node.left) + 2 * magnitude(node.right);
    }
};

function* combos(lines: string[]): IterableIterator<[Node, Node]> {
    for (const n1 of lines) {
        for (const n2 of lines) {
            yield [parse(n1), parse(n2)];
        }
    }
}

const part1 = (nodes: Node[]): number => magnitude(nodes.reduce(result));

const part2 = (lines: string[]): number => {
    const cs = combos(lines);
    return reduce(cs, 0, (max, [a, b]) =>
        Math.max(max, magnitude(result(a, b))),
    );
};

(async () => {
    const input = await readInputLines('day18');

    console.log(part1(input.map(parse)));
    console.log(part2(input));
})();
