import { Type } from "./Type";

export interface RenderTree {
  id: string;
  name: string;
  type: Type;
  children?: RenderTree[];
}