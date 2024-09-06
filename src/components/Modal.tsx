import { Modal as AntModal, Button } from 'antd';
import { useModal } from '../context/modal';
import { WHATSAPP_HELP_LINK } from '../utils/urls';

export default function ErrorModal() {
  const { isModalOpen, handleOk, handleCancel } = useModal();

  return (
    <AntModal
      title="Se ha producido un error"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="link" href={WHATSAPP_HELP_LINK} target="_blank" type="primary" onClick={handleOk}>
          Abrir WhatsApp
        </Button>,
      ]}
    >
      <p>Algo no ha ido bien. Por favor, escríbenos por WhatsApp para que uno de nuestros agentes pueda ayudarte.</p>
    </AntModal>
  );
}
