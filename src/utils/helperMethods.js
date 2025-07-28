import { notification } from "antd";

/**
 * Send notification using Ant Design notification component
 * @param {string} type - 'success' | 'error' | 'warning' | 'info' | 'loading'
 * @param {string} content - Message content to display
 * @param {number} duration - Duration in seconds (default: 5)
 * @param {string} title - Optional title for the notification
 */
export const sendNotification = (type, content, duration = 5, title = null) => {
  console.log("Sending notification:", { type, content, duration, title });

  const config = {
    message: title || type.charAt(0).toUpperCase() + type.slice(1),
    description: content,
    duration: duration,
    placement: "topRight", // You can change this: topLeft, topRight, bottomLeft, bottomRight
  };

  switch (type) {
    case "success":
      notification.success(config);
      break;
    case "error":
      notification.error(config);
      break;
    case "warning":
      notification.warning(config);
      break;
    case "info":
      notification.info(config);
      break;
    default:
      notification.info(config);
      break;
  }
};

// Usage examples:
// sendNotification('success', 'User added successfully!');
// sendNotification('error', 'User already exists');
// sendNotification('warning', 'Please check your input', 3);
// sendNotification('info', 'Processing your request...');
// sendNotification('error', 'Duplicate user found', 5, 'Validation Error');

// Alternative version with custom titles:
export const sendNotificationWithTitle = (
  type,
  title,
  content,
  duration = 5
) => {
  const config = {
    message: title,
    description: content,
    duration: duration,
    placement: "topRight",
  };

  notification[type](config);
};
