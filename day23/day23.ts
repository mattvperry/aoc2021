type Type = 'A' | 'B' | 'C' | 'D';
type Space = Type | '_';
type Hallway = Space[];
type Metadata = { owner: Type; idx: number; entrance: number; energy: number };
type Room = `${Space}${Space}${Space}${Space}`;
type Rooms = [Room, Room, Room, Room];
type State = [Hallway, Rooms];
type StateS = string;

const metadata: Metadata[] = [
    { owner: 'A', idx: 0, entrance: 2, energy: 1 },
    { owner: 'B', idx: 1, entrance: 4, energy: 10 },
    { owner: 'C', idx: 2, entrance: 6, energy: 100 },
    { owner: 'D', idx: 3, entrance: 8, energy: 1000 },
];

const metadataByOwner = Object.fromEntries(
    metadata.map(m => [m.owner, m]),
) as Record<Type, Metadata>;

const metadataByIdx = Object.fromEntries(
    metadata.map(m => [m.idx, m]),
) as Record<number, Metadata>;

const toStr = ([hallway, rooms]: State): StateS =>
    `${hallway.join('')}|${rooms.join(',')}`;
const fromStr = (state: StateS): State => {
    const [h, r] = state.split('|');
    return [h.split('') as Hallway, r.split(',') as Rooms];
};

const idxToEntrance = (i: number): number => i * 2 + 2;

const score = ([hall, rooms]: State): number =>
    hall.reduce((acc, curr, i) => {
        if (curr === '_') {
            return acc;
        }

        const { entrance, energy } = metadataByOwner[curr];
        return acc + Math.abs(entrance - i) * energy;
    }, 0) +
    rooms.reduce((acc, curr, i) => {
        const { owner, energy } = metadataByIdx[i];
        const incorrect = curr.split('').filter(s => s !== owner).length;
        return acc + incorrect * energy;
    }, 0);

const isFinal = ([, rooms]: State): boolean =>
    rooms.every((r, i) =>
        r
            .split('')
            .every(s => s !== '_' && i === metadataByOwner[s as Type].idx),
    );

function* next([hall, rooms]: State): IterableIterator<[number, State]> {
    // Can any hallway pieces move to rooms?
    for (let h = 0; h < hall.length; ++h) {
        const a = hall[h];
        if (a === '_') {
            continue;
        }

        const { idx, entrance, energy } = metadataByOwner[a];
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

        const entrance = idxToEntrance(r);
        const [d, a] = room.startsWith('___')
            ? [4, room[3] as Type]
            : room.startsWith('__')
            ? [3, room[2] as Type]
            : room.startsWith('_')
            ? [2, room[1] as Type]
            : [1, room[0] as Type];
        const { energy } = metadataByOwner[a];
        const newRooms = rooms.map((x, i) =>
            i === r ? '_'.repeat(d) + room.substring(d) : x,
        ) as Rooms;

        // Turn left
        for (let h = entrance - 1; h >= 0; --h) {
            if (h === 2 || h === 4 || h === 6 || h === 8) {
                continue;
            }

            const space = hall[h];
            if (space !== '_') {
                break;
            }

            yield [
                energy * (d + (entrance - h)),
                [hall.map((s, i) => (i === h ? a : s)), newRooms],
            ];
        }

        // Turn right
        for (let h = entrance + 1; h < hall.length; ++h) {
            if (h === 2 || h === 4 || h === 6 || h === 8) {
                continue;
            }

            const space = hall[h];
            if (space !== '_') {
                break;
            }

            yield [
                energy * (d + (h - entrance)),
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
