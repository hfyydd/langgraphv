// app/index.tsx

// import React from 'react';
// import { createRoot } from 'react-dom/client';

// const container = document.getElementById('root');
// if (container) {
//   const root = createRoot(container);
//   root.render(<div>调用 react</div>);
// } else {
//   console.error("Failed to find the root element");
// }
import React from 'react';
import ReactDOM from 'react-dom/client';
import Flow from './flow';  // 导入 Flow 组件

// 创建一个主应用组件
function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Flow />
    </div>
  );
}

// 获取根元素并渲染应用
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);