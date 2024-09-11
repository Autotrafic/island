import { Result } from 'antd';

export default function ConclusionContainer() {
  return (
    <Result
      status="success"
      title="¡Los documentos se han subido correctamente!"
      extra={[
        <p>
          Ahora, uno de nuestros gestores está revisando la documentación para comprobar que el vehículo sea tramitable y que
          esté todo en regla.
        </p>,
        <p className='mt-5'>
          En caso afirmativo, os enviaremos los mandatos para firmar por SMS y nos pondremos en contacto contigo por WhatsApp
          para avisarte.
        </p>,
        <p className='mt-5'>
        Gracias por confiar en nosotros, ¡gracias! Puedes cerrar ésta ventana.
      </p>,
      ]}
    />
  );
}
