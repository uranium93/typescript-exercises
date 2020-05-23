
import fs = require('fs')
type Option = { projection?: { [key: string]: number } } & { sort?: { [key: string]: number } }
export class Database<T> {
    protected filename: string;
    protected noSqlDB: Array<T>;
    constructor(filename: string, fullTextSearchFieldNames: string[]) {
        this.filename = filename;
        this.noSqlDB = this.migrateDB()
    }
    private migrateDB(): Array<T> {
        const data = fs.readFileSync(`${this.filename}`, 'UTF-8');
        const lines = data.split(/\r?\n/);
        const parsedLines: Array<T> = []
        lines.forEach((line: string) => {
            if (line.charAt(0) === 'E') parsedLines.push(JSON.parse(line.replace('E', '')));
        });
        return parsedLines
    }

    protected evaluate(simpleQuery: { [key: string]: any }, value: string | number): boolean {

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

    async find(query: { [key: string]: any }, option: Option): Promise<{ [key: string]: string }[]> {
        const queryKeys: string[] = Object.keys(query)
        let projectionKeys: string[] = []
        let sortKeys: string[] = []
        let result: T[] = []
        if (queryKeys.length === 0) result = this.noSqlDB
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
                } else {
                    console.log("else")
                    result.push(record)
                }
            })
        })
        if (option) {
            if (option.projection) {
                projectionKeys = Object.keys(option.projection)
            }
            if (option.sort) {
                sortKeys = Object.keys(option.sort)
            }
        }
        if (sortKeys.length !== 0) {
            sortKeys.forEach(key => {
                result.sort((a: any, b: any): number => {
                    if (option.sort) {
                        return a[key] > b[key] ? option.sort[key] : -option.sort[key]
                    } else return 1
                })
            });
        }
        return Promise.resolve(result.map((record: any) => {
            if (projectionKeys.length !== 0) {
                const filteredRecord: { [key: string]: string } = {}
                projectionKeys.forEach((key: string) => {
                    filteredRecord[key] = record[key]
                })
                return filteredRecord
            } else {
                return record
            }
        }))
    }
}
