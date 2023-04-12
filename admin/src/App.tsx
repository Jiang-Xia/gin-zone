import type { FC } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import Router from './routers';
import AuthRouter from './routers/AuthRouter';
import { BrowserRouter } from 'react-router-dom';
// import { ConfigProvider } from 'antd';
const App: FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <ConfigProvider> */}
        <AuthRouter>
          <Router />
        </AuthRouter>
        {/* </ConfigProvider> */}
      </BrowserRouter>
    </div>
  );
};

export default App;
