
import fs = require('fs')

export class Database<T> {
    protected filename: string;
    protected fullTextSearchFieldNames: unknown[];
    protected noSqlDB: Array<object>;
    constructor(filename: string, fullTextSearchFieldNames: string[]) {
        this.filename = filename;
        this.fullTextSearchFieldNames = fullTextSearchFieldNames;
        this.noSqlDB = this.migrateDB()
    }
    private migrateDB(): Array<object> {
        const data = fs.readFileSync(`${this.filename}`, 'UTF-8');
        const lines = data.split(/\r?\n/);
        const parsedLines: Array<object> = []
        lines.forEach((line: string) => {
            if (line.charAt(0) === 'E') parsedLines.push(JSON.parse(line.replace('E', '')));
        });
        return parsedLines
    }

    async find(query: object): Promise<T[]> {
        console.log(query)
        query.fo
        return []
    }
}
