import { DocusealForm } from '@docuseal/react';
import { useParams } from 'react-router-dom';

export default function DocusealSign() {
  const { templateSlug } = useParams();

  return (
    <>
      {templateSlug ? (
        <DocusealForm
          src={`https://docuseal.com/d/${templateSlug}`}
          email="mandatos@autotrafic.es"
          onComplete={(data) => console.log(data)}
        />
      ) : (
        <div>Document not found</div>
      )}
    </>
  );
}
