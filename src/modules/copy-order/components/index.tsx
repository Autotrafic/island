import { useParams } from 'react-router-dom';

export default function CopyOrder() {
  const { templateSlug } = useParams();

  return (
    <>
      {templateSlug ? (
        <>
          <div>Documento para firmar</div>
        </>
      ) : (
        <div>No hemos encontrado ningun documento para firmar</div>
      )}
    </>
  );
}
