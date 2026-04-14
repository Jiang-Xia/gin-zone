import { ConfigProvider } from 'tdesign-react';
import AppRouter from './router';
import './App.css';

function App() {
  return (
    <ConfigProvider globalConfig={{ classPrefix: 't' }}>
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
