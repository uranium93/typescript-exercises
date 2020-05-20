// This enabled module augmentation mode.
import 'date-wizard';

declare module 'date-wizard' {
    export function pad(s: number): string
    export interface DateDetails {
        hours: number;
        minutes: number;
        seconds: number
    }
}
