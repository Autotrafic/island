import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { locale } from 'antd-phone-input';
import { Locale } from 'antd/es/locale';
import { ModalProvider } from './modal';
import { MultiStepProvider } from './multiStep';
import { DocumentsDataProvider } from './documentsData';
import { useParams } from 'react-router-dom';

export default function Providers({ children }: { children: ReactNode }) {
  const { orderId } = useParams();

  return (
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
          <DocumentsDataProvider orderId={orderId as string}>{children}</DocumentsDataProvider>
        </MultiStepProvider>
      </ModalProvider>
    </ConfigProvider>
  );
}
