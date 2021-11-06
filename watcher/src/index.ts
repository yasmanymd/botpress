import { BotPressWatcher } from "./BotPressWatcher";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Action } from "./entities/Action";

const onReady = (bp: BotPressWatcher) => {
  const app = express();
  const port = 4000;
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });
  
  io.on('connection', socket => {
    socket.emit('init', { delimiter: bp.delimiter, actions: bp.getCurrentFileSystem()});
    
    bp.onChange.on('change', (action: Action) => {
      socket.emit('change', action);
    });
  });
  
  server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}

const main = () => {
  new BotPressWatcher(onReady);
}

main();