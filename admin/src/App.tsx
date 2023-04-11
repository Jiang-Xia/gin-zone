import type { FC } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import Router from './routers';
import AuthRouter from './routers/AuthRouter';
import { BrowserRouter } from 'react-router-dom';

const App: FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthRouter>
          <Router />
        </AuthRouter>
      </BrowserRouter>
    </div>
  );
};

export default App;
