import { notifications } from '@mantine/notifications';

export const notifySuccess = (message, title = 'Saved') =>
  notifications.show({ title, message, color: 'lime', autoClose: 4000 });

export const notifyError = (message, title = 'Something went wrong') =>
  notifications.show({ title, message, color: 'red', autoClose: 8000 });
