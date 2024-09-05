import { Button, Result } from 'antd';
import { WHATSAPP_HELP_LINK } from '../utils/urls';

export default function NotFoundContainer() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Parece que el pedido que estás buscando no existe o ya se ha subido la documentación. Por favor, contacta con nosotros por WhatsApp para que uno de nuestros agentes pueda ayudarle."
      extra={
        <Button type="primary" key="link" href={WHATSAPP_HELP_LINK} target="_blank">
          Abrir WhatsApp
        </Button>
      }
    />
  );
}
