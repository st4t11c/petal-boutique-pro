import React, { createContext, useContext, useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "approval" | "denial" | "info";
  read: boolean;
  createdAt: Date;
}

interface NotifContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotifContextType>({
  notifications: [], addNotification: () => {}, markRead: () => {}, markAllRead: () => {}, unreadCount: 0,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "createdAt">) => {
    setNotifications((prev) => [
      { ...n, id: crypto.randomUUID(), read: false, createdAt: new Date() },
      ...prev,
    ]);
  }, []);

  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, markAllRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
