import { useCallback, useEffect, useState } from 'react';
import { FileRejection } from 'react-dropzone';
import { XMarkIcon } from '@heroicons/react/24/solid';
import Dropzone from '../components/Dropzone';
import NavigationButtons from '../components/NavigationButtons';
import { Alert, Divider } from 'antd';
import { checkFilledFiles, GetDropzoneFunc } from '../utils/functions';
import pdfPreviewImage from '../assets/pdf-file-preview.jpg';
import { useDocumentsData } from '../context/documentsData';
import { uploadFilesToDrive } from '../services/file';
import { renameFile } from '../utils/formatter';

interface FilesFormContainerProps {
  documentsPropertyName: 'customers' | 'vehicle';
  getDropdowns: GetDropzoneFunc;
  submitAction?: (orderId: string) => Promise<void>;
}

export default function FilesFormContainer({ documentsPropertyName, getDropdowns, submitAction }: FilesFormContainerProps) {
  const { orderId, files: documentsFiles, updateDocumentsData } = useDocumentsData();

  const [files, setFiles] = useState<ExtendedFile[]>(documentsFiles[documentsPropertyName]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [filledForm, setFilledForm] = useState<boolean | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[], fileId: keyof Files, fileName: string) => {
      if (acceptedFiles?.length) {
        setFiles((previousFiles: ExtendedFile[]) => [
          ...previousFiles,
          ...acceptedFiles.map((file: File) => ({
            ...file,
            preview: URL.createObjectURL(file),
            id: fileId,
            path: file.name,
            file: renameFile(file, fileName),
          })),
        ]);
      }

      if (rejectedFiles?.length) {
        setRejected((previousFiles) => [...previousFiles, ...rejectedFiles]);
      }
    },
    []
  );

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (id: string) => {
    setFiles((files) => files.filter((file) => file.id !== id));
  };

  const removeRejected = (name: string) => {
    setRejected((files: FileRejection[]) => files.filter(({ file }: { file: File }) => file.name !== name));
  };

  const handleSubmit = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const isFormFilled = checkFilledFiles(documentsPropertyName, files);
        setFilledForm(isFormFilled);

        if (!isFormFilled) resolve(false);

        updateDocumentsData((prev: DocumentsData) => ({
          ...prev,
          files: { ...prev.files, [documentsPropertyName]: files },
        }));
        const preparedFiles = files.map((file) => file.file);

        await uploadFilesToDrive(preparedFiles, orderId);
        if (submitAction) await submitAction(orderId);

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <>
      <form className="flex flex-col gap-5">
        {getDropdowns(files).map((dropzone) => (
          <div>
            <Divider style={{ borderColor: 'blue' }} orientation="left" className="!mb-1">
              {dropzone.title}
            </Divider>
            {dropzone.files.length < 1 ? (
              <Dropzone fileId={dropzone.id} fileName={dropzone.title} onDrop={onDrop} />
            ) : (
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
                {dropzone.files.map((file) => (
                  <li key={file.name} className="relative h-32 rounded-md shadow-lg">
                    <img
                      src={file.path.endsWith('.pdf') ? pdfPreviewImage : file.preview}
                      alt={file.name}
                      width={100}
                      height={100}
                      onLoad={() => {
                        URL.revokeObjectURL(file.preview);
                      }}
                      className="h-full w-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      className="w-7 h-7 border border-secondary-400 bg-secondary-400 rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                      onClick={() => removeFile(file.id)}
                    >
                      <XMarkIcon className="w-5 h-5 fill-white hover:fill-secondary-400 transition-colors" />
                    </button>
                    <p className="mt-2 text-neutral-500 text-[12px] font-medium">{file.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </form>

      {/* Rejected Files */}
      {rejected.length > 0 && (
        <section className="mt-10">
          <h3 className="title text-lg font-semibold text-neutral-600 mt-24 border-b pb-3">Archivos rechazados</h3>
          <ul className="mt-6 flex flex-col">
            {rejected.map(({ file, errors }) => (
              <li key={file.name} className="flex items-start justify-between">
                <div>
                  <p className="mt-2 text-neutral-500 text-sm font-medium">{file.name}</p>
                  <ul className="text-[12px] text-red-400">
                    {errors.map((error) => (
                      <li key={error.code}>{error.message}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className="mt-1 py-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors"
                  onClick={() => removeRejected(file.name)}
                >
                  borrar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {filledForm === false && (
        <Alert message="Debes adjuntar los archivos necesarios para continuar" type="warning" showIcon closable />
      )}

      <NavigationButtons handleNext={handleSubmit} />
    </>
  );
}
