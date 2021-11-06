import { Command } from "./Command";
import { Type } from "./Type";

export interface Action {
  section: string;
  cmd: Command;
  type: Type;
  path: string;
}