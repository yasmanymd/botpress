import chokidar from 'chokidar';
import fs from 'fs';
import { BotPressWatcher } from '../src/BotPressWatcher';

jest.mock('chokidar');
jest.mock('fs');

describe('BotPressWatcher mocking only readFile method.', () => {
  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockReturnValue("./testfolder");
  });

  it('watch method should not to be called', () => {
    (fs.readFileSync as jest.Mock).mockReturnValue("");
    
    new BotPressWatcher(() => {});
    expect(chokidar.watch).not.toHaveBeenCalled();
  });

  it('onReady should be called', () => {
    const onReady = jest.fn();

    new BotPressWatcher(onReady);
    expect(chokidar.watch).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
  });

  it('onReady should be called and empty actions should be ready', () => {
    expect.assertions(2);

    new BotPressWatcher((pb: BotPressWatcher) => {
      let actions = pb.getCurrentFileSystem();
      expect(actions).toHaveLength(0);
    });

    expect(chokidar.watch).toHaveBeenCalled();
  });
});
