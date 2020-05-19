declare module 'stats' {

    type indexSearch = <T>(input: Array<T>, comparator: (a: T, b: T) => number) => number;
    type elementSearch = <T>(input: Array<T>, comparator: (a: T, b: T) => number) => (T | null)

    export const getMaxIndex: indexSearch
    export const getMinIndex: indexSearch
    export const getMedianIndex: indexSearch
    export const getMaxElement: elementSearch
    export const getMinElement: elementSearch
    export const getMedianElement: elementSearch
    export const getAverageValue: <T, K extends keyof T>(input: Array<T>, getValue: (a: T) => T[K]) => (number | null)
}