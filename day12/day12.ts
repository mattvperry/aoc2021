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
        ([n, x]) => /[a-z]+/.test(n) && x > 1,
    );

    if (problems.length > 0 && prune(problems)) {
        return 0;
    }

    const edges = graph[node] ?? [];
    return sumBy(edges, edge =>
        search(graph, edge, { ...seen, [edge]: (seen[edge] ?? 0) + 1 }, prune),
    );
};

const part1 = (graph: Graph): number =>
    search(graph, 'start', { start: 1 }, _ => true);

const part2 = (graph: Graph): number =>
    search(
        graph,
        'start',
        { start: 1 },
        ([[n, x], ...rest]) => rest.length !== 0 || n === 'start' || x > 2,
    );

(async () => {
    const input = await readInputLines('day12');
    const graph = parse(input);

    console.log(part1(graph));
    console.log(part2(graph));
})();
