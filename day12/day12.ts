import { entries, readInputLines, sumBy } from '../shared/utils';

type Graph = Record<string, string[]>;

const parse = (lines: string[]): Graph => {
    const graph: Graph = {};
    const paths = lines.map(l => l.split('-'));
    for (const [a, b] of paths) {
        graph[a] = [b, ...(graph[a] ?? [])];
        graph[b] = [a, ...(graph[b] ?? [])];
    }

    return graph;
};

const search = (
    graph: Graph,
    node: string,
    seen: Record<string, number>,
    prune: (problems: [string, number][]) => boolean,
): number => {
    if (node === 'end') {
        return 1;
    }

    const problems = entries(seen).filter(
        ([n, x]) => n === n.toLocaleLowerCase() && x > 1,
    );

    if (problems.length > 0 && prune(problems)) {
        return 0;
    }

    const edges = graph[node] ?? [];
    return sumBy(edges, edge =>
        search(graph, edge, { ...seen, [edge]: (seen[edge] ?? 0) + 1 }, prune),
    );
};

// For part1, if we have any problems at all then we
// prune the branch.
const part1 = () => true;

// For part2, if we have more than one problem, or
// we are visiting start again, or if we have visited
// this more than twice then we prune the branch.
const part2 = ([[n, x], ...rest]: [string, number][]): boolean =>
    rest.length !== 0 || n === 'start' || x > 2;

const day12 = (
    graph: Graph,
    prune: (problems: [string, number][]) => boolean,
): number => search(graph, 'start', { start: 1 }, prune);

(async () => {
    const input = await readInputLines('day12');
    const graph = parse(input);

    console.log(day12(graph, part1));
    console.log(day12(graph, part2));
})();
