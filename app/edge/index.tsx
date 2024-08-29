import { EdgeTypes } from '@xyflow/react';
import ConditionEdge from "./ConditionEdge";
import CustomEdge from "./CustomEdge";



export const edgeTypes: EdgeTypes = {
    'custom-edge': CustomEdge,
    'condition-edge': ConditionEdge,
  };