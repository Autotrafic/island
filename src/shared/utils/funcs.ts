import { NotificationArgsProps } from 'antd';

export function getAlertOptions(title: string, message: string) {
  return { message: title, description: message, placement: 'top' as NotificationArgsProps['placement'], duration: 10 };
}
