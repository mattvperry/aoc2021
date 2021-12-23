import { sum } from '../shared/utils';

type Type = 'A' | 'B' | 'C' | 'D';
type Space = Type | '_';
type Hallway = Space[];
type Metadata = { owner: Type; idx: number; entrance: number; energy: number };
type Room = `${Space}${Space}${Space}${Space}`;
type Rooms = [Room, Room, Room, Room];
type State = [Hallway, Rooms];
type StateS = string;

const metadata: Record<Type, Metadata> = {
    A: { owner: 'A', idx: 0, entrance: 2, energy: 1 },
    B: { owner: 'B', idx: 1, entrance: 4, energy: 10 },
    C: { owner: 'C', idx: 2, entrance: 6, energy: 100 },
    D: { owner: 'D', idx: 3, entrance: 8, energy: 1000 },
};

const toStr = ([hallway, rooms]: State): StateS =>
    `${hallway.join('')}|${rooms.join(',')}`;
const fromStr = (state: StateS): State => {
    const [h, r] = state.split('|');
    return [h.split('') as Hallway, r.split(',') as Rooms];
};

const idxToExit = (i: number): number => i * 2 + 2;

const score = ([hall, rooms]: State): number =>
    hall.reduce((acc, curr, i) => {
        if (curr === '_') {
            return acc;
        }

        const { entrance, energy } = metadata[curr];
        return acc + Math.abs(entrance - i) * energy;
    }, 0) +
    sum(
        rooms.map((r, i) => {
            const exit = idxToExit(i);
            return r.split('').reduce((acc, curr, ir) => {
                if (curr === '_') {
                    return acc;
                }

                const { entrance, energy } = metadata[curr as Type];
                return acc + energy * (Math.abs(entrance - exit) + ir);
            }, 0);
        }),
    );

const isFinal = ([, [a, b, c, d]]: State): boolean =>
    a === 'AAAA' && b === 'BBBB' && c === 'CCCC' && d === 'DDDD';

function* next([hall, rooms]: State): IterableIterator<[number, State]> {
    // Can any hallway pieces move to rooms?
    for (let h = 0; h < hall.length; ++h) {
        const a = hall[h];
        if (a === '_') {
            continue;
        }

        const { idx, entrance, energy } = metadata[a];
        const roomS = rooms[idx];
        const d =
            roomS === '____'
                ? 4
                : roomS === `___${a}`
                ? 3
                : roomS === `__${a}${a}`
                ? 2
                : roomS === `_${a}${a}${a}`
                ? 1
                : 0;
        if (d === 0) {
            continue;
        }

        const path = hall.slice(
            Math.min(h + 1, entrance),
            Math.max(h, entrance + 1),
        );
        if (path.some(s => s !== '_')) {
            continue;
        }

        yield [
            energy * (path.length + d),
            [
                hall.map((s, i) => (i === h ? '_' : s)),
                rooms.map((r, i) =>
                    i === idx ? '_'.repeat(d - 1) + a.repeat(4 - d + 1) : r,
                ) as Rooms,
            ],
        ];
    }

    // Can the outermost room occupants move to the hall?
    for (let r = 0; r < rooms.length; ++r) {
        const room = rooms[r];
        if (room === '____') {
            continue;
        }

        const exit = idxToExit(r);
        const [d, a] = room.startsWith('___')
            ? [4, room[3] as Type]
            : room.startsWith('__')
            ? [3, room[2] as Type]
            : room.startsWith('_')
            ? [2, room[1] as Type]
            : [1, room[0] as Type];
        const { energy } = metadata[a];
        const newRooms = rooms.map((x, i) =>
            i === r ? '_'.repeat(d) + room.substring(d) : x,
        ) as Rooms;

        // Turn left
        for (let h = exit - 1; h >= 0; --h) {
            if (h === 2 || h === 4 || h === 6 || h === 8) {
                continue;
            }

            const space = hall[h];
            if (space !== '_') {
                break;
            }

            yield [
                energy * (d + (exit - h)),
                [hall.map((s, i) => (i === h ? a : s)), newRooms],
            ];
        }

        // Turn right
        for (let h = exit + 1; h < hall.length; ++h) {
            if (h === 2 || h === 4 || h === 6 || h === 8) {
                continue;
            }

            const space = hall[h];
            if (space !== '_') {
                break;
            }

            yield [
                energy * (d + (h - exit)),
                [hall.map((s, i) => (i === h ? a : s)), newRooms],
            ];
        }
    }
}

const astar = (state: State): number => {
    const start = toStr(state);
    const states = [start];
    const dist = new Map<StateS, number>([[start, 0]]);
    const scores = new Map<StateS, number>([[start, score(state)]]);

    while (states.length !== 0) {
        const currentS = states.pop()!;
        const current = fromStr(currentS);
        if (isFinal(current)) {
            return dist.get(currentS)!;
        }

        const seen = new Set(states);
        for (const [d, n] of next(current)) {
            const neighbor = toStr(n);
            const temp = dist.get(currentS)! + d;
            if (temp < (dist.get(neighbor) ?? Infinity)) {
                dist.set(neighbor, temp);
                scores.set(neighbor, temp + score(n));
                if (!seen.has(neighbor)) {
                    states.push(neighbor);
                }
            }
        }

        states.sort((a, b) => scores.get(b)! - scores.get(a)!);
    }

    return -1;
};

(async () => {
    const state: State = [
        new Array(11).fill('_'),
        ['CDDC', 'ACBA', 'BBAD', 'DACB'],
    ];

    console.log(astar(state));
})();
