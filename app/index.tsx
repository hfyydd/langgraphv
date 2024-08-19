import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Flow from './flow';
import { Node, Edge } from '@xyflow/react';

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
    };
  }
}

const vscode = window.acquireVsCodeApi?.();

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'updateGraph') {
        if (typeof (window as any).updateGraphFlow === 'function') {
          (window as any).updateGraphFlow(message.data.nodes, message.data.edges);
        } else {
          console.error('updateGraphFlow is not available');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleGraphChange = useCallback((updatedNodes: Node[], updatedEdges: Edge[]) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, []);

  const handleGraphOperation = useCallback((operation: any) => {
    vscode?.postMessage({
      type: 'graphOperation',
      operation: operation
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow
        initialNodes={nodes}
        initialEdges={edges}
        onGraphChange={handleGraphChange}
        onGraphOperation={handleGraphOperation}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);