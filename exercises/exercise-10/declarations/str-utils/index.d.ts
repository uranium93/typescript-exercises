declare module 'str-utils' {
    type StrUtils = (param: string) => string
    export const strReverse: StrUtils;
    export const strToUpper: StrUtils;
    export const strRandomize: StrUtils;
    export const strInvertCase: StrUtils;
    export const strToLower: StrUtils;
}
