import { DefaultNode } from "./DefaultNode";
import { EndNode } from "./EndNode";
import { StartNode } from "./StartNode";
import { ConditionNode } from "./ConditionNode";
const nodeTypes = {
    start: StartNode,
    custom: DefaultNode,
    end: EndNode,
    condition: ConditionNode
  };

export default nodeTypes;