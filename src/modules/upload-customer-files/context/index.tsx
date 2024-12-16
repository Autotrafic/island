import { ReactNode, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { locale } from 'antd-phone-input';
import { Locale } from 'antd/es/locale';
import { ModalProvider } from './modal';
import { MultiStepProvider } from './multiStep';
import { DocumentsDataProvider } from './documentsData';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../services/order';
import NotFoundContainer from '../containers/NotFoundContainer';

export default function Providers({ children }: { children: ReactNode }) {
  const { orderId } = useParams();
  const [isValidOrder, setIsValidOrder] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const orderResponse = await getOrderById(orderId ?? '');
        if (!orderResponse) throw new Error('No order found');
      } catch (error) {
        setIsValidOrder(false);
        console.error(error);
      }
    })();
  }, []);

  return (
    <>
      {isValidOrder ? (
        <ConfigProvider
          locale={locale('esES') as Locale}
          theme={{
            token: {
              // Seed Token
              colorPrimary: '#4154F1',
              borderRadius: 2,
              fontFamily: 'Poppins',
            },
          }}
        >
          <ModalProvider>
            <MultiStepProvider>
              <DocumentsDataProvider orderId={orderId as string}>{children}</DocumentsDataProvider>
            </MultiStepProvider>
          </ModalProvider>
        </ConfigProvider>
      ) : (
        <NotFoundContainer />
      )}
    </>
  );
}
