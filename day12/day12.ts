import { entries, readInputLines, sumBy } from '../shared/utils';

type Graph = Record<string, string[]>;

const parse = (lines: string[]): Graph => {
    const graph: Graph = {};
    const paths = lines.map(l => l.split('-'));
    for (const [a, b] of paths) {
        if (b !== 'start') {
            graph[a] = [b, ...(graph[a] ?? [])];
        }

        if (a !== 'start') {
            graph[b] = [a, ...(graph[b] ?? [])];
        }
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

    // A problem is any small cave that we've visited more
    // than once
    const problems = entries(seen).filter(
        ([n, x]) => n === n.toLocaleLowerCase() && x > 1,
    );

    // If we encounter any problems, decide if we need to
    // prune this path based on the pruning predicate fn
    if (problems.length > 0 && prune(problems)) {
        return 0;
    }

    return sumBy(graph[node] ?? [], next =>
        search(graph, next, { ...seen, [next]: (seen[next] ?? 0) + 1 }, prune),
    );
};

// For part1, if we have any problems at all then we
// prune the branch.
const part1 = () => true;

// For part2, if we have more than one problem,
// or if we have visited the small cave more than
// twice then we prune the branch.
const part2 = ([[_, x], ...rest]: [string, number][]): boolean =>
    rest.length !== 0 || x > 2;

const day12 = (
    graph: Graph,
    prune: (problems: [string, number][]) => boolean,
): number => search(graph, 'start', {}, prune);

(async () => {
    const input = await readInputLines('day12');
    const graph = parse(input);

    console.log(day12(graph, part1));
    console.log(day12(graph, part2));
})();
