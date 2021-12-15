import { CoordS, neighbors, parseGrid, toStr } from '../shared/grid';
import { divMod, map, readInputLines } from '../shared/utils';

type Node = [CoordS, number];
type Graph = Map<CoordS, Node[]>;

const size = 99;
const bigSize = size * 5 + 4;

const parse = (lines: string[]): Graph => {
    const grid = parseGrid(lines);
    for (let x = 0; x <= bigSize; ++x) {
        for (let y = 0; y <= bigSize; ++y) {
            const [divX, modX] = divMod(x, size + 1);
            const [divY, modY] = divMod(y, size + 1);
            const value = grid.get(toStr([modX, modY]))! + (divX + divY);
            grid.set(toStr([x, y]), value > 9 ? value - 9 : value);
        }
    }

    return new Map<CoordS, Node[]>(
        map(grid.entries(), ([coord]) => [
            coord,
            Array.from(neighbors(grid, coord)),
        ]),
    );
};

const spfa = (graph: Graph, start: CoordS): Map<CoordS, number> => {
    const queue = [start];
    const visited = new Set<CoordS>(queue);
    const distMap = new Map<CoordS, number>([[start, 0]]);

    while (queue.length !== 0) {
        const curr = queue.shift()!;
        visited.delete(curr);

        for (const [coord, weight] of graph.get(curr) ?? []) {
            const dist = (distMap.get(curr) ?? 0) + weight;
            if (dist < (distMap.get(coord) ?? Infinity)) {
                distMap.set(coord, dist);
                if (!visited.has(coord)) {
                    queue.push(coord);
                    visited.add(coord);
                }
            }
        }
    }

    return distMap;
};

const day15 = (graph: Graph): [number, number] => {
    const dist = spfa(graph, '0,0');
    return [dist.get(`${size},${size}`)!, dist.get(`${bigSize},${bigSize}`)!];
};

(async () => {
    const input = await readInputLines('day15');
    const graph = parse(input);

    const [part1, part2] = day15(graph);
    console.log(part1);
    console.log(part2);
})();
