import fs from 'fs';
import path from 'path';
import readline from 'readline';

export type Day = `day${number}`;

export type Entries<T> = {
    [K in keyof T]: [K extends number ? `${K}` : K, T[K]];
}[keyof T];

export function* take<T>(num: number, xs: Iterable<T>): IterableIterator<T> {
    for (const x of xs) {
        if (num === 0) {
            break;
        }

        yield x;
        num = num - 1;
    }
}

export function* map<T, U>(data: Iterable<T>, fn: (curr: T) => U): Iterable<U> {
    for (const x of data) {
        yield fn(x);
    }
}

export function reduce<T, U>(
    data: Iterable<T>,
    seed: U,
    fn: (acc: U, curr: T) => U,
): U {
    let acc = seed;
    for (const x of data) {
        acc = fn(acc, x);
    }

    return acc;
}

export function mapAsync<T, U>(
    data: AsyncIterable<T>,
    fn: (curr: T) => Promise<U>,
): AsyncIterableIterator<U>;
export function mapAsync<T, U>(
    data: AsyncIterable<T>,
    fn: (curr: T) => U,
): AsyncIterableIterator<U>;
export async function* mapAsync<T, U>(
    data: AsyncIterable<T>,
    fn: ((curr: T) => Promise<U>) | ((curr: T) => U),
): AsyncIterableIterator<U> {
    for await (const x of data) {
        yield await Promise.resolve(fn(x));
    }
}

export function reduceAsync<T, U>(
    data: AsyncIterable<T>,
    seed: U,
    fn: (acc: U, curr: T) => Promise<U>,
): Promise<U>;
export function reduceAsync<T, U>(
    data: AsyncIterable<T>,
    seed: U,
    fn: (acc: U, curr: T) => U,
): Promise<U>;
export async function reduceAsync<T, U>(
    data: AsyncIterable<T>,
    seed: U,
    fn: ((acc: U, curr: T) => Promise<U>) | ((acc: U, curr: T) => U),
): Promise<U> {
    let acc = seed;
    for await (const x of data) {
        acc = await Promise.resolve(fn(acc, x));
    }

    return acc;
}

export function* concatMap<T, U>(
    data: Iterable<T>,
    fn: (x: T) => Iterable<U>,
): Iterable<U> {
    for (const x of data) {
        yield* fn(x);
    }
}

export function* mapEntries<T, U>(
    data: T,
    fn: (x: Entries<T>) => U,
): Iterable<U> {
    for (const x of entries(data)) {
        yield fn(x);
    }
}

export const arrayFromAsyncGenerator = <T>(
    gen: AsyncIterable<T>,
): Promise<T[]> => reduceAsync<T, T[]>(gen, [], (acc, curr) => [...acc, curr]);

export async function* streamInputLinesAsync<T extends Day>(
    day: T,
): AsyncIterableIterator<string> {
    const fileStream = fs.createReadStream(path.join(day, 'input.txt'));
    yield* readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
}

export const readInputLines = <T extends Day>(day: T): Promise<string[]> =>
    arrayFromAsyncGenerator(streamInputLinesAsync(day));

export function* zipper<T>(data: Iterable<T>): IterableIterator<[T[], T, T[]]> {
    let init: T[] = [];
    let [head, ...tail] = data;
    while (tail.length >= 0) {
        yield [init, head, tail];
        if (tail.length === 0) {
            break;
        }

        init = [...init, head];
        [head, ...tail] = tail;
    }
}

export const groupBy = <T, K extends PropertyKey>(
    xs: Iterable<T>,
    fn: (x: T) => K,
): Record<K, T[]> =>
    reduce(xs, {} as Record<K, T[]>, (acc, curr) => {
        const key = fn(curr);
        acc[key] = [...(acc[key] || []), curr];
        return acc;
    });

export const frequency = <T extends PropertyKey>(
    input: Iterable<T>,
): Record<T, number> =>
    reduce(input, {} as ReturnType<typeof frequency>, (acc, curr) => {
        acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
        return acc;
    });

export const memoize = <P extends any[], R, K extends PropertyKey>(
    fn: (...args: P) => R,
    key: (...args: P) => K,
): ((...args: P) => R) => {
    const memo = {} as Record<K, R>;
    return (...args: P) => {
        const k = key(...args);
        if (isDefined(memo[k])) {
            return memo[k];
        }

        memo[k] = fn(...args);
        return memo[k];
    };
};

export const distinct = <T>(xs: T[]): T[] => Array.from(new Set<T>(xs));

export const splitOn = <T>(xs: T[], on: T): [T[], T[]] => {
    const idx = xs.indexOf(on);
    if (idx === -1) {
        return [xs, []];
    }

    return [xs.slice(0, idx), xs.slice(idx + 1, xs.length)];
};

export function* splitOnEvery<T>(xs: T[], on: T): IterableIterator<T[]> {
    let [first, rest] = splitOn(xs, on);
    while (true) {
        yield first;
        if (rest.length === 0) {
            break;
        }

        [first, rest] = splitOn(rest, on);
    }
}

type Sliceable = {
    slice: (start?: number, end?: number) => any;
    length: number;
};
export const splitAt = <T extends Sliceable>(
    xs: T,
    i: number,
): [ReturnType<T['slice']>, ReturnType<T['slice']>] => [
    xs.slice(0, i),
    xs.slice(i, xs.length),
];

export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;

export const sum = (data: Iterable<number>): number =>
    reduce(data, 0, (acc, curr) => acc + curr);

export const sumBy = <T>(data: Iterable<T>, fn: (x: T) => number): number =>
    sum(map(data, fn));

export const size = <T>(data: Iterable<T>) => sumBy(data, _ => 1);

export const countBy = <T>(data: Iterable<T>, fn: (x: T) => boolean): number =>
    sumBy(data, x => (fn(x) ? 1 : 0));

export const entries = <T>(obj: T): Entries<T>[] =>
    Object.entries(obj) as Entries<T>[];

export const partition = <T>(
    xs: Iterable<T>,
    fn: (x: T) => boolean,
): [T[], T[]] => {
    const on: T[] = [];
    const off: T[] = [];
    for (const x of xs) {
        const edit = fn(x) ? on : off;
        edit.push(x);
    }

    return [on, off];
};

export const zipWith = <T, U>(xs: T[], ys: T[], fn: (a: T, b: T) => U): U[] => {
    if (xs.length === 0 || ys.length === 0) {
        return [];
    }

    const [x, ...xr] = xs;
    const [y, ...yr] = ys;
    return [fn(x, y), ...zipWith(xr, yr, fn)];
};

export const zip = <T>(xs: T[], ys: T[]): [T, T][] =>
    zipWith(xs, ys, (x, y) => [x, y]);

export const repeatFn = <T>(x: T, times: number, fn: (x: T) => T): T => {
    for (let i = 0; i < times; ++i) {
        x = fn(x);
    }

    return x;
};

export function* iterateFn<T>(fn: (x: T) => T, x: T): IterableIterator<T> {
    while (true) {
        yield x;
        x = fn(x);
    }
}

export const isSubset = <T>(x: Set<T>, y: Set<T>): boolean =>
    reduce(x, true as boolean, (acc, curr) => acc && y.has(curr));

export const intersect = <T>(xs: Set<T>, ys: Set<T>): Set<T> =>
    new Set([...xs].filter(x => ys.has(x)));

export const difference = <T>(xs: Set<T>, ys: Set<T>): Set<T> =>
    new Set([...xs].filter(x => !ys.has(x)));

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export const isLiteral = <T extends readonly string[]>(
    x: string,
    xs: T,
): x is T[number] => xs.includes(x);
