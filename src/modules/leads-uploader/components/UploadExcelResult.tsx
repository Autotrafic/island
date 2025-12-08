import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';

interface Props {
  onBack: () => void;
}

export default function UploadExcelResult({ onBack }: Props) {
  return (
    <section className="w-full max-w-lg p-6 mt-8 rounded-3xl border border-gray-200 bg-white shadow-xl shadow-green-200 transition-all duration-300 hover:shadow-green-300">
      <h2 className="text-2xl font-extrabold text-center mb-6 text-gray-800">Resultado</h2>

      <div className="flex items-center mb-4">
        <CheckCircleOutlined className="text-green-500 text-2xl mr-2" />
        <span className="text-xl font-medium text-green-600">Proceso completado con éxito</span>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onBack}
          className="px-4 py-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-300"
        >
          Volver
        </button>
      </div>
    </section>
  );
}
