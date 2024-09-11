import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

interface DropdownProps {
  fileId: keyof CustomersFiles | keyof VehicleFiles;
  fileName: string;
  onDrop: (acceptedFiles: File[], rejectedFiles: FileRejection[], fileId: keyof CustomersFiles | keyof VehicleFiles, fileName: string) => void;
}

export default function Dropzone({ fileId, fileName, onDrop }: DropdownProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
    maxSize: 10240 * 1000, // 10MB max file size
    onDrop: (acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, fileId, fileName),
  });

  return (
    <div
      {...getRootProps({
        className: 'p-4 mb-5 border border-neutral-200',
      })}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <ArrowUpTrayIcon className="w-5 h-5 fill-current" />
        {isDragActive ? (
          <p className="text-center">Suelta los archivos aquí ...</p>
        ) : (
          <p className="text-center">Arrastra y suelta o pulsa aquí para seleccionar</p>
        )}
      </div>
    </div>
  );
}
