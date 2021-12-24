import {
    isDefined,
    memoize,
    mod,
    pairwise,
    readInputLines,
    zip,
} from '../shared/utils';

type Register = 'w' | 'x' | 'y' | 'z';
type Inp = { op: 'inp'; register: Register };
type Add = { op: 'add'; register: Register; value: Register | number };
type Mul = { op: 'mul'; register: Register; value: Register | number };
type Div = { op: 'div'; register: Register; value: Register | number };
type Mod = { op: 'mod'; register: Register; value: Register | number };
type Eql = { op: 'eql'; register: Register; value: Register | number };
type Instr = Inp | Add | Mul | Div | Mod | Eql;
type Program = Instr[];

const parse = (line: string): Instr => {
    const [op, a, b] = line.split(' ');
    if (op === 'inp') {
        return { op, register: a as Register };
    }

    return {
        op: op as Instr['op'],
        register: a as Register,
        value: isVar(b) ? b : parseInt(b, 10),
    };
};

const splitProgram = (program: Program): Program[] => {
    const inps = program
        .map((i, idx) => [i.op === 'inp', idx] as const)
        .filter(([b]) => b)
        .map(([, i]) => i);

    let parts: Program[] = [];
    for (const [from, to] of pairwise([...inps, program.length])) {
        parts.push(program.slice(from, to));
    }

    return parts;
};

const isVar = (value: any): value is Register =>
    value === 'w' || value === 'x' || value === 'y' || value === 'z';

const optimize = (program: Program) => {
    const a = (program[4] as Div).value as number;
    const b = (program[5] as Add).value as number;
    const c = (program[15] as Add).value as number;

    return (w: number, z: number): number => {
        const temp = mod(z, 26) + b !== w;
        return temp ? w + c + Math.floor((z * 26) / a) : Math.floor(z / a);
    };
};

const findModel = memoize(
    ([program, ...rest]: Program[], z: number): [number[], boolean] => {
        if (!isDefined(program)) {
            return [[], z === 0];
        }

        const run = optimize(program);
        for (let w = 9; w >= 1; --w) {
            const next = run(w, z);
            const [nums, found] = findModel(rest, next);
            if (found) {
                return [[w, ...nums], true];
            }
        }

        return [[], false];
    },
    (ps, z) => `${ps.length - 1}|${z}`,
);

const part1 = (program: Program): string =>
    findModel(splitProgram(program), 0)[0].join('');

(async () => {
    const input = await readInputLines('day24');
    const program = input.map(parse);

    for (const p of splitProgram(program)) {
        const line: string[] = [];
        for (const i of p) {
            // @ts-ignore
            line.push(`${i.op} ${i.register} ${i.value ?? ''}`.padEnd(10, ' '));
        }
        console.log(line.join('|'));
    }

    const n = [9, 9, 9, 1, 9, 6, 9, 2, 4, 9, 6, 9, 3, 9];
    const p = splitProgram(program).map(optimize);
    let z = 0;
    for (const [w, r] of zip(n, p)) {
        z = r(w, z);
        console.log(
            z
                .toString(26)
                .split('')
                .map(d => parseInt(d, 26))
                .join(','),
        );
    }

    console.log(part1(program));
})();
