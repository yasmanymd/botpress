import chokidar from 'chokidar';
import { Section } from './entities/Section';
import events from 'events';
import { FileDirectory } from './entities/FileDirectory';
import {platform} from 'os';
import * as path from 'path';
import { readFileSync } from 'fs';
import { Type } from './entities/Type';
import { Action } from './entities/Action';
import { Command } from './entities/Command';

export class BotPressWatcher {
    public delimiter = ''; 
    private watchers: {[key: string]: Section} = {};
    public onChange: events.EventEmitter = new events.EventEmitter();
    private counter = 0;

    constructor(onReady: (bp: BotPressWatcher) => void) {
        this.delimiter = platform() == 'win32' ? '\\' : '/';

        let list: string[] = [];
        list = readFileSync('./watcher.txt', 'utf-8').split(/\r?\n/);
        if (list && list.length > 0 && list[0] != '') {
            this.counter = list.length;
            this.init(list, onReady);
        }
    }

    public getCurrentFileSystem(): Action[] {
        let result: Action[] = [];
        if (this.counter == 0) {
            for (var path in this.watchers) {
                this.watchers[path].list.forEach(item => {
                    result.push({
                        section: path, 
                        cmd: Command.Add, 
                        type: item.type, 
                        path: item.path
                    });
                });
            }
        }
        return result;
    }

    private insert(element: FileDirectory, list: FileDirectory[]) {
        const pos = list.findIndex(item => item.path == element.path);
        list.splice(pos + 1, 0, element);
    }

    private remove(element: FileDirectory, list: FileDirectory[]) {
        const pos = list.findIndex(item => item.path == element.path);
        list.splice(pos, 1);
    }

    private init(list: string[], onReady: (bp: BotPressWatcher) => void) {
        list.forEach(f => {
            let filename = path.resolve(f);
            if (platform() == 'win32') {
                filename = filename.replace(new RegExp('/', 'g'), '\\');
            }
            const watcher = chokidar.watch(filename, { persistent: true });
            if (watcher) {
                this.watchers[filename] = {
                    watcher: watcher,
                    list: []
                };
    
                watcher
                    .on('add', path => {
                        this.insert({ path: path, type: Type.File }, this.watchers[filename].list);
                    })
                    .on('addDir', path => {
                        this.insert({ path: path, type: Type.Directory }, this.watchers[filename].list);
                    })
                    .on('ready', () => {
                        this.counter -= 1;                    
                        if (this.counter === 0 && onReady) {
                            onReady(this);
                        }                    
                        watcher.removeAllListeners('add');
                        watcher.removeAllListeners('addDir');
                        watcher
                            .on('add', path => {
                                this.insert({ path: path, type: Type.File }, this.watchers[filename].list);
                                this.onChange?.emit('change', {section: filename, cmd: Command.Add, type: Type.File, path: path});
                            })
                            .on('unlink', path => {
                                this.remove({ path: path, type: Type.File }, this.watchers[filename].list)
                                this.onChange?.emit('change', {section: filename, cmd: Command.Remove, type: Type.File, path: path});
                            })
                            .on('addDir', path => {
                                this.insert({ path: path, type: Type.Directory }, this.watchers[filename].list);
                                this.onChange?.emit('change', {section: filename, cmd: Command.Add, type: Type.Directory, path: path});
                            })
                            .on('unlinkDir', path => {
                                this.remove({ path: path, type: Type.Directory }, this.watchers[filename].list)
                                this.onChange?.emit('change', {section: filename, cmd: Command.Remove, type: Type.Directory, path: path});
                            })
                            .on('error', error => console.log(`Watcher error: ${error}`));
                    });
            } else {
                this.counter -= 1;                    
                if (this.counter === 0 && onReady) {
                    onReady(this);
                }                
            }
        });
    }
}