
import fs = require('fs')

export class Database<T> {
    protected filename: string;
    protected fullTextSearchFieldNames: unknown[];

    constructor(filename: string, fullTextSearchFieldNames: string[]) {
        this.filename = filename;
        this.fullTextSearchFieldNames = fullTextSearchFieldNames;
    }
    private search(lines: Array<string>, queryParam: string, field: string): Array<number | null> {
        const result: Array<null | number> = []
        const parsedLines: Array<object> = lines.map((line: string) => {
            if (line.charAt(0) === 'E') return JSON.parse(line.replace('E', ''));
        });
        console.log({ parsedLines })
        parsedLines.forEach((parsedLine: any, index: number) => {
            //console.log({ parsedLine })
            if (parsedLine && parsedLine[field] === queryParam) {
                result.push(index)
            }
        })
        return result
    }

    async find(query: any): Promise<T[]> {
        const data = fs.readFileSync(`${this.filename}`, 'UTF-8');
        const lines = data.split(/\r?\n/);
        let result: any = []
        const firstQuery = `${this.fullTextSearchFieldNames[0]}`
        let secondQuey;
        if (query[firstQuery]) {
            const searchKey = query[firstQuery]['$eq'];
            if (searchKey) console.log(this.search(lines, query[firstQuery], firstQuery))

        } else {
            secondQuey = `${this.fullTextSearchFieldNames[1]}`
            console.log(query[secondQuey]['$eq'], '********', secondQuey)
            if (query[secondQuey]['$eq']) console.log(result = this.search(lines, query[secondQuey]['$eq'], secondQuey))
        }
        return Promise.resolve(result)
    }
}
