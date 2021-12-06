import { readInputLines } from '../shared/utils';

type Data = undefined;

const parse = (line: string): Data => undefined;

const part1 = (data: Data[]): number => {
    return 0;
}

(async () => {
    const input = await readInputLines('day6');
    const data = input.map(parse);

    console.log(part1(data));
})();
