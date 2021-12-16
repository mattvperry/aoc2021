import {
    concatMap,
    map,
    readInputLines,
    splitAt,
    sum,
    sumBy,
} from '../shared/utils';

type Binary = (0 | 1)[];

interface Literal {
    version: number;
    type: 4;
    value: number;
}

interface Op {
    version: number;
    type: 0 | 1 | 2 | 3 | 5 | 6 | 7;
    size: { type: 0 | 1; length: number };
    terms: Packet[];
}

type Packet = Literal | Op;

const hexToBin = (hex: string): Binary =>
    Array.from(
        concatMap(hex, c => {
            const binS = parseInt(c, 16).toString(2).padStart(4, '0');
            return map(binS, d => parseInt(d, 10) as Binary[number]);
        }),
    );

const binToDec = (bin: Binary): number => parseInt(bin.join(''), 2);

const parseTerms = (
    { type, length }: Op['size'],
    bin: Binary,
): [Packet[], Binary] => {
    let packet: Packet;
    let rest = bin;
    let packets: Packet[] = [];

    if (type === 0) {
        let rest2: Binary = [];
        [rest2, rest] = splitAt(rest, length);

        while (rest2.length !== 0) {
            [packet, rest2] = parsePacket(rest2);
            packets = [...packets, packet];
        }
    } else {
        while (packets.length !== length) {
            [packet, rest] = parsePacket(rest);
            packets = [...packets, packet];
        }
    }

    return [packets, rest];
};

const parseLen = (bin: Binary): [Op['size'], Binary] => {
    const [[type], rest1] = splitAt(bin, 1);
    const [length, rest2] = splitAt(rest1, type === 0 ? 15 : 11);
    return [{ type, length: binToDec(length) }, rest2];
};

const parseOp = (
    version: number,
    type: Op['type'],
    bin: Binary,
): [Op, Binary] => {
    const [size, rest1] = parseLen(bin);
    const [terms, rest2] = parseTerms(size, rest1);

    const packet: Op = {
        version,
        type,
        size,
        terms,
    };

    return [packet, rest2];
};

const parseLiteral = (version: number, bin: Binary): [Literal, Binary] => {
    let delim: Binary[number];
    let byte: Binary = [];
    let bytes: Binary = [];
    let rest = bin;

    while (true) {
        [[delim, ...byte], rest] = splitAt(rest, 5);
        bytes = [...bytes, ...byte];

        if (delim === 0) {
            break;
        }
    }

    const value = binToDec(bytes);
    const packet: Literal = {
        version,
        type: 4,
        value,
    };

    return [packet, rest];
};

const parsePacket = (bin: Binary): [Packet, Binary] => {
    const [v, rest1] = splitAt(bin, 3);
    const [t, rest2] = splitAt(rest1, 3);

    const version = binToDec(v);
    const type = binToDec(t);

    return type === 4
        ? parseLiteral(version, rest2)
        : parseOp(version, type as Op['type'], rest2);
};

const part1 = (root: Packet): number =>
    root.version + (root.type !== 4 ? sumBy(root.terms, part1) : 0);

const part2 = (root: Packet): number => {
    if (root.type === 4) {
        return root.value;
    }

    const terms = root.terms.map(part2);
    switch (root.type) {
        case 0:
            return sum(terms);
        case 1:
            return terms.reduce((acc, curr) => acc * curr);
        case 2:
            return Math.min(...terms);
        case 3:
            return Math.max(...terms);
        case 5:
            return terms[0] > terms[1] ? 1 : 0;
        case 6:
            return terms[0] < terms[1] ? 1 : 0;
        case 7:
            return terms[0] === terms[1] ? 1 : 0;
    }
};

(async () => {
    const [input] = await readInputLines('day16');
    const [root] = parsePacket(hexToBin(input));

    console.log(part1(root));
    console.log(part2(root));
})();
