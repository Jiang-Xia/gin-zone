import type { FC } from 'react';
import 'antd/dist/reset.css';
import './App.css';
import Router from './routers';
import AuthRouter from './routers/AuthRouter';
import AutoScorllTop from './routers/AutoScorllTop';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { connect } from 'react-redux';
const App: FC = (props: any) => {
  const { colorPrimary } = props;
  return (
    <div className="App">
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary,
            },
          }}
        >
          <AuthRouter>
            <AutoScorllTop>
              <Router />
            </AutoScorllTop>
          </AuthRouter>
        </ConfigProvider>
      </BrowserRouter>
    </div>
  );
};

function mapStateToProps(state: any) {
  const { colorPrimary } = state.global.systemConfig;
  return { colorPrimary };
}
export default connect(mapStateToProps)(App);
