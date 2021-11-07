import chokidar from 'chokidar';
import fs from 'fs';
import { BotPressWatcher } from '../src/BotPressWatcher';

jest.mock('chokidar');
jest.mock('fs');

describe('BotPressWatcher tests.', () => {
  it('watch method should be called', () => {
    const onMock = jest.fn().mockReturnThis();
    (fs.readFileSync as jest.Mock).mockReturnValue("./testfolder");
    (chokidar.watch as jest.Mock).mockReturnValue({
      on: onMock
    });

    new BotPressWatcher(() => {});
    expect(chokidar.watch).toHaveBeenCalled();
  });
});
