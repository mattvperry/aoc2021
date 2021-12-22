import { isDefined, mapAsync, streamInputLinesAsync } from '../shared/utils';

type Range = [number, number];
type Cuboid = [Range, Range, Range];
type Instr = [boolean, Cuboid];

const parse = (line: string): Instr => {
    const [op, rest] = line.split(' ');
    const cuboid = rest.split(',').map(r =>
        r
            .substring(2)
            .split('..')
            .map(b => parseInt(b, 10)),
    );

    return [op === 'on', cuboid as Cuboid];
};

const overlap1d = ([a1, a2]: Range, [b1, b2]: Range): Range | undefined => {
    const width = Math.max(a2, b2) - Math.min(a1, b1);
    if (width < a2 - a1 + b2 - b1) {
        return [Math.max(a1, b1), Math.min(a2, b2)];
    }
};

const overlap3d = (
    [x1, y1, z1]: Cuboid,
    [x2, y2, z2]: Cuboid,
): Cuboid | undefined => {
    const ovX = overlap1d(x1, x2);
    const ovY = overlap1d(y1, y2);
    const ovZ = overlap1d(z1, z2);

    if (isDefined(ovX) && isDefined(ovY) && isDefined(ovZ)) {
        return [ovX, ovY, ovZ];
    }
};

const collect = async (instructions: AsyncIterable<Instr>): Promise<number> => {
    const cubes: Instr[] = [];
    for await (const [newOp, newCube] of instructions) {
        const overlaps = cubes
            .map(([op, cube]) => {
                const overlap = overlap3d(cube, newCube);
                return isDefined(overlap)
                    ? ([!op, overlap] as Instr)
                    : undefined;
            })
            .filter(isDefined);

        cubes.push(...overlaps);
        if (newOp) {
            cubes.push([newOp, newCube]);
        }
    }

    return cubes.reduce(
        (acc, [op, [[x1, x2], [y1, y2], [z1, z2]]]) =>
            acc + (x2 - x1 + 1) * (y2 - y1 + 1) * (z2 - z1 + 1) * (op ? 1 : -1),
        0,
    );
};

(async () => {
    const input = streamInputLinesAsync('day22');
    const instr = mapAsync(input, parse);

    console.log(await collect(instr));
})();
