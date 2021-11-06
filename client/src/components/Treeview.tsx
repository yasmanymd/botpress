import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import socketIOClient from "socket.io-client";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Typography } from '@mui/material';
import { Action } from '../entities/Action';
import { Command } from '../entities/Command';
import { Type } from '../entities/Type';
import { RenderTree } from '../entities/RenderTree';

export interface TreeViewState {
  delimiter: string;
  actions: Action[];
}

function transform(delimiter: string, actions: Action[]) {
  let result: any = [];
  let level = {result};

  actions.forEach(action => {
    action.path.slice(action.section.length).split(delimiter).reduce((r: any, name: string, i, a) => {
      let s = name;
      if (s == '') {
        s = action.section;
      }
      if(!r[s]) {
        r[s] = {result: []};        
        r.result.push({id: action.path, name: s, type: action.type, children: r[s].result});
        r.result.sort((a: any, b: any) => {
          if (a.type > b.type) {
            return -1;
          }
          if (a.type < b.type) {
            return 1;
          }
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
      }      
      return r[s];
    }, level)
  });

  return result;
}

function insert(action: Action, list: Action[]) {
  let pos = list.findIndex(item => item.path == action.path);
  list.splice(pos + 1, 0, action);
}

function remove(delimiter: string, action: Action, list: Action[]) {
  let pos = list.findIndex(item => item.path == action.path);
  list.splice(pos, 1);
}

function applyAction(delimiter: string, actions: Action[], action: Action): Action[] {
  let result: Action[] = JSON.parse(JSON.stringify(actions));
  if (action.cmd == Command.Add) {
    insert(action, result);
  }
  if (action.cmd == Command.Remove) {
    remove(delimiter, action, result);
  }
  return result;
}

export default function BotpressTreeView() {
  const [state, setState] = React.useState<TreeViewState>({delimiter: '/', actions: []});

  React.useEffect((): any => {
    const socket = socketIOClient({ path: '/ws/socket.io', transports: ["polling"] });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err}`);
    });
    socket.on('init', (state: TreeViewState) => {
      state.actions.sort((a, b) => { 
        if (a.path > b.path) {
          return 1;
        } 
        if (a.path < b.path) {
          return -1;
        } 
        return 0; 
      });
      setState(state);

      socket.on('change', (action: Action) => {
        setState(state => {
          let result = applyAction(state.delimiter, state.actions, action);
          result.sort((a, b) => { 
            if (a.path > b.path) {
              return 1;
            } 
            if (a.path < b.path) {
              return -1;
            } 
            return 0; 
          });
          return { delimiter: state.delimiter, actions: result };
        });
      });
    });

    return () => socket.disconnect();
  }, []);

  const renderTree = (nodes: RenderTree) => (
    <TreeItem 
      key={nodes.id} 
      nodeId={nodes.id} 
      label={<Typography sx={{display: 'flex', margin: '3px' }}>
        {nodes.type == Type.File ? <><DescriptionOutlinedIcon /><div>{nodes.name}</div></> : <><FolderOutlinedIcon /><div>{nodes.name}</div></>}
      </Typography>} 
      >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <TreeView
      aria-label="rich object"
      defaultExpanded={['root']}
      defaultCollapseIcon={ <ExpandMoreIcon /> }
      defaultExpandIcon={ <ChevronRightIcon /> }
      sx={{ height: "auto", flexGrow: 1, overflowY: 'auto' }}
    >
      {renderTree({ id: 'root', name: 'Sections', type: Type.None, children: transform(state.delimiter, state.actions) })}
    </TreeView>
  );
}