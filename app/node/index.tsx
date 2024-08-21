import { DefaultNode } from "./DefaultNode";
import { EndNode } from "./EndNode";
import { StartNode } from "./StartNode";

const nodeTypes = {
    start: StartNode,
    custom: DefaultNode,
    end: EndNode,
  };

export default nodeTypes;