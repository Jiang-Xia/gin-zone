import type { FC } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import Router from './routers';
import { BrowserRouter } from 'react-router-dom';

const App: FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </div>
  );
};

export default App;
