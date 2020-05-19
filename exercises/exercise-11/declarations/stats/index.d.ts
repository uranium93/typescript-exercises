declare module 'stats' {
    export function getMaxIndex<T>(input: Array<T>, comparator: (a: T, b: T) => number): number;
    export function getMinIndex<T>(input: Array<T>, comparator: (a: T, b: T) => number): number
}