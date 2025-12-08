import { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import axios from 'axios';
import { BACKEND_API_URL } from '../../../shared/utils/urls';
import UploadExcelForm from './UploadExcelForm';

export default function LeadsUploader() {
  const [loadingService, setLoadingService] = useState<boolean>(false);

  console.log('here')

  useEffect(() => {
    (async () => {
      try {
        setLoadingService(true);
        await axios.get(BACKEND_API_URL);
        message.success('Servicio disponible.');
      } catch (error) {
        message.error('El servicio no está disponible en este momento. Recarga la página.');
      } finally {
        setLoadingService(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-14">
      {loadingService && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-start z-50 flex-col gap-10 pt-[350px]">
          <span className="text-white">Cargando el servicio. Puede tardar hasta 1 minuto</span>
          <Spin size="large" />
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center">
        <UploadExcelForm />
      </div>
    </div>
  );
}
