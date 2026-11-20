import { type Access } from './permissions.js';
/** Where an app's checkpoints are kept, relative to the app. */
export declare const CHECKPOINT_STORE: string;
/** Where copies of the database are kept before a restore, relative to the app. */
export declare const BACKUP_FOLDER: string;
/** How many database copies are kept. */
export declare const BACKUP_LIMIT = 10;
/** How many checkpoints a listing returns, newest first. */
export declare const LIST_LIMIT = 60;
export type Checkpoint = {
    id: string;
    label: string;
    /** Seconds since the epoch. */
    time: number;
    filesChanged: number;
};
export interface Checkpoints {
    /** Record the app as it is now. Returns nothing when it has not changed since the last checkpoint. */
    save(directory: string, label?: string, access?: Access): Promise<Checkpoint | undefined>;
    /** Checkpoints of the app, newest first. */
    list(directory: string, access?: Access): Promise<Checkpoint[]>;
    /** Put the app's files back as they were at a checkpoint; the state before is recorded first. */
    restore(directory: string, id: string, access?: Access): Promise<Checkpoint>;
}
/** Checkpoints kept in a private git store inside each app, apart from any repository of the user's. */
export declare function createCheckpoints(): Checkpoints;
