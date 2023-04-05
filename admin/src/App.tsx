import React from 'react';
import logo from './logo.svg';
import './App.css';
import type { FC } from 'react';
import { Button } from 'antd';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
const App: FC = () => (
  <div className="App">
    <Button type="primary">Button</Button>
  </div>
);
const defaultLayout = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#00b96b',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
export default defaultLayout