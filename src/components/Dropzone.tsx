import { useDropzone, FileRejection } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

interface DropdownProps {
  fileId: keyof CustomersFiles | keyof VehicleFiles;
  onDrop: (acceptedFiles: File[], rejectedFiles: FileRejection[], fileId: (keyof CustomersFiles | keyof VehicleFiles)) => void;
}

export default function Dropzone({ fileId, onDrop }: DropdownProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxSize: 1024 * 1000, // 1MB max file size
    onDrop: (acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles, fileId),
  });

  return (
    <div
      {...getRootProps({
        className: 'p-16 mt-10 border border-neutral-200',
      })}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <ArrowUpTrayIcon className="w-5 h-5 fill-current" />
        {isDragActive ? (
          <p className='text-center'>Suelta los archivos aquí ...</p>
        ) : (
          <p className='text-center'>Arrastra y suelta o pulsa aquí para seleccionar</p>
        )}
      </div>
    </div>
  );
}
