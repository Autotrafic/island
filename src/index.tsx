import 'antd/dist/reset.css';
import '../public/globals.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MultiStepProvider } from './context/multiStep';
import { ConfigProvider } from 'antd';
import { locale } from 'antd-phone-input';
import { Locale } from 'antd/es/locale';
import { ModalProvider } from './context/modal';

const rootElement = document.getElementById('root');

const root = createRoot(rootElement!);

root.render(
  <ConfigProvider
    locale={locale('esES') as Locale}
    theme={{
      token: {
        // Seed Token
        colorPrimary: '#4154F1',
        borderRadius: 2,
        fontFamily: 'Poppins',

        // Alias Token
        colorBgContainer: '#f6ffed',
      },
    }}
  >
    <ModalProvider>
      <MultiStepProvider>
        <App />
      </MultiStepProvider>
    </ModalProvider>
  </ConfigProvider>
);
