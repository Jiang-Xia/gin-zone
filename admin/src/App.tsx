import { ConfigProvider } from 'tdesign-react';
import AppRouter from './router';
import './App.css';

function App() {
  return (
    // ConfigProvider：统一组件库前缀与全局配置
    <ConfigProvider globalConfig={{ classPrefix: 't' }}>
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
