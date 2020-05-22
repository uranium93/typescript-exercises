
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

    protected evaluate(simpleQuery: any, value: string | number): boolean {

        if (simpleQuery['$eq']) {
            if (value === simpleQuery['$eq']) return true
        } else if (simpleQuery['$gt']) {
            if (value > simpleQuery['$gt']) return true
        } else if (simpleQuery['$lt']) {
            if (value < simpleQuery['$lt']) return true
        } else if (simpleQuery['$in']) {
            return simpleQuery['$in'].includes(value)
        }
        return false

    }

    /*   
    $and: [
     { age: { $gt: 30 } },
     { age: { $lt: 40 } }
      ]
       */

    async find(query: { [key: string]: any }): Promise<T[]> {
        const queryKeys: string[] = Object.keys(query)
        const result: T[] = []
        queryKeys.forEach((queryKey: string) => {
            this.noSqlDB.forEach((record: any) => {
                if (query[queryKey]['$eq']) {
                    if (this.evaluate(query[queryKey], record[queryKey])) result.push(record)
                } else if (query[queryKey]['$gt']) {
                    if (this.evaluate(query[queryKey], record[queryKey])) result.push(record)
                } else if (query[queryKey]['$lt']) {
                    if (this.evaluate(query[queryKey], record[queryKey])) result.push(record)
                } else if (queryKey === '$and') {
                    const nestedQueryKey = Object.keys(query[queryKey][0])[0]
                    if (this.evaluate(query[queryKey][0][nestedQueryKey], record[nestedQueryKey]) &&
                        this.evaluate(query[queryKey][1][nestedQueryKey], record[nestedQueryKey])) {
                        result.push(record)
                    }
                } else if (queryKey === '$or') {
                    const nestedQueryKey = Object.keys(query[queryKey][0])[0]
                    if (this.evaluate(query[queryKey][0][nestedQueryKey], record[nestedQueryKey]) ||
                        this.evaluate(query[queryKey][1][nestedQueryKey], record[nestedQueryKey])) {
                        result.push(record)
                    }
                } else if (queryKey === '$text') {
                    const recordSearch = JSON.stringify(record).toLowerCase()
                    if (recordSearch.indexOf(`${query[queryKey].toLowerCase()} `) >= 0 ||
                        recordSearch.indexOf(`${query[queryKey].toLowerCase()}"`) >= 0
                    ) {
                        result.push(record)
                    }
                } else if (query[queryKey]['$in']) {
                    if (this.evaluate(query[queryKey], record[queryKey])) result.push(record)
                }
            })
        })
        return Promise.resolve(result)
    }
}
