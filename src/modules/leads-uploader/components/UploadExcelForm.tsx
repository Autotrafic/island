import { Select, Upload, Button, List, Switch, Spin, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { requiredColumns } from '../utils/constants';
import { useState } from 'react';
import { uploadMetaLeads } from '../services';
import { parseExcelData } from '../../../shared/utils/parser';
import UploadExcelResult from './UploadExcelResult';

const { Dragger } = Upload;

export default function UploadExcelForm() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<boolean | null>(null);

  const handleFileUpload = (info: any) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);
  };

  const columnsToShow = Object.values(requiredColumns.meta_lead);

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.error('Por favor, sube un archivo.');
      return;
    }

    setLoading(true);

    const file = fileList[0].originFileObj;

    try {
      message.success('El archivo de Excel tiene las columnas correctas.');

      const reqColumns = Object.values(requiredColumns.meta_lead);
      const filteredData = await parseExcelData(file, reqColumns);

      const result = await uploadMetaLeads(filteredData);

      setUploadResult(true);
      setFileList([]);
    } catch (error) {
      const receivedError = error as Error;
      message.error(receivedError.message || 'Error al procesar el archivo de Excel.', 5);
      setUploadResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!uploadResult ? (
        <div className="flex flex-wrap gap-8 justify-center w-full max-w-[1350px]">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[1000px] mt-8 flex-[3] min-w-[600px]">
            <h1 className="text-2xl font-bold mb-6 text-center">Subir desde Excel</h1>

            <div className="w-full flex gap-10 justify-around">
              <div className="flex flex-col gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adjuntar archivo Excel</label>
                  <Dragger fileList={fileList} onChange={handleFileUpload} beforeUpload={() => false} accept=".xlsx, .xls">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined className="text-3xl" />
                    </p>
                    <p className="ant-upload-text">Haz click o arrastra el archivo de Excel</p>
                    <p className="ant-upload-hint">Soporta un único archivo .xlsx y .xls.</p>
                  </Dragger>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Columnas requeridas en el excel</label>
                  <List bordered dataSource={columnsToShow} renderItem={(item) => <List.Item>{item}</List.Item>} />
                </div>
              </div>
            </div>

            <Button
              type="primary"
              className="w-full mt-14"
              onClick={handleSubmit}
              disabled={fileList.length === 0 || loading}
            >
              {loading ? <Spin /> : '¡Subir!'}
            </Button>
          </div>
        </div>
      ) : (
        <UploadExcelResult onBack={() => setUploadResult(null)} />
      )}
    </>
  );
}
