import chokidar from 'chokidar';
import { FileDirectory } from './FileDirectory';

export interface Section {
    watcher: chokidar.FSWatcher;
    list: FileDirectory[];
}