// import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom/client';
// import Flow from './flow';
// import { Node, Edge } from '@xyflow/react';

// function App() {
//   const [nodes, setNodes] = useState<Node[]>([]);
//   const [edges, setEdges] = useState<Edge[]>([]);

//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       const message = event.data;
//       if (message.type === 'updateGraph') {
//         setNodes(message.data.nodes);
//         setEdges(message.data.edges);
//       }
//     };

//     window.addEventListener('message', handleMessage);

//     return () => {
//       window.removeEventListener('message', handleMessage);
//     };
//   }, []);

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <Flow initialNodes={nodes} initialEdges={edges} />
//     </div>
//   );
// }

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Flow from './flow';
import { Node, Edge } from '@xyflow/react';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      
      const message = event.data;
      console.log('Posting message to webview:', message);
      if (message.type === 'updateGraph') {
        setNodes(message.data.nodes);
        setEdges(message.data.edges);
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

    console.log('Graph updated:', updatedNodes, updatedEdges);
    
    // Send the updated graph back to the VS Code extension
    // window.vscode?.postMessage({
    //   type: 'graphUpdated',
    //   data: { nodes: updatedNodes, edges: updatedEdges }
    // });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow initialNodes={nodes} initialEdges={edges} onGraphChange={handleGraphChange} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);