import { useEffect, useState, useCallback } from "react";
import mqtt, { MqttClient } from "mqtt";

export interface ValuesTpye {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  protocol: string;
}

export interface MqttConnectionStatus {
  connected: boolean;
  error?: Error;
}

export default function useMqtt(values: ValuesTpye) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [messages, setMessages] = useState<{ [topic: string]: string }>({});
  const [connectionStatus, setConnectionStatus] =
    useState<MqttConnectionStatus>({
      connected: false,
    });

  const { host, port, clientId, username, password, protocol } = values;
  const url: string = `${protocol}://${host}:${port}/mqtt`;

  const options = {
    clientId,
    username,
    password,
    clean: true,
    reconnectPeriod: 10000, // ms
    connectTimeout: 30 * 1000, // ms
  };

  // 连接 MQTT
  useEffect(() => {
    const mqttClient = mqtt.connect(url, options);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setConnectionStatus({ connected: true });
      setClient(mqttClient);
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err);
      setConnectionStatus({ connected: false, error: err });
    });

    mqttClient.on("disconnect", () => {
      console.log("Disconnected from MQTT broker");
      setConnectionStatus({ connected: false });
    });

    mqttClient.on("message", (topic, message) => {
      const messageString = message.toString();
      setMessages((prev) => ({
        ...prev,
        [topic]: messageString,
      }));
      // console.log(`Received message on topic ${topic}:`, messageString);
    });

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, [url, JSON.stringify(options)]);

  // 订阅话题
  const subscribe = useCallback(
    (topic: string) => {
      if (client && client.connected) {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Error subscribing to ${topic}:`, err);
          } else {
            console.log(`Successfully subscribed to ${topic}`);
          }
        });
      } else {
        console.warn("MQTT client not connected. Cannot subscribe.");
      }
    },
    [client]
  );

  // 取消订阅话题
  const unsubscribe = useCallback(
    (topic: string) => {
      if (client && client.connected) {
        client.unsubscribe(topic, (err) => {
          if (err) {
            console.error(`Error unsubscribing from ${topic}:`, err);
          } else {
            console.log(`Successfully unsubscribed from ${topic}`);
            setMessages((prev) => {
              const newMessages = { ...prev };
              delete newMessages[topic];
              return newMessages;
            });
          }
        });
      }
    },
    [client]
  );

  // 发布消息
  const publish = useCallback(
    (topic: string, message: string) => {
      if (client && client.connected) {
        client.publish(topic, message, (err) => {
          if (err) {
            console.error(`Error publishing to ${topic}:`, err);
          } else {
            console.log(`Successfully published to ${topic}:`, message);
          }
        });
      } else {
        console.warn("MQTT client not connected. Cannot publish.");
      }
    },
    [client]
  );

  return {
    client,
    connectionStatus,
    messages,
    subscribe,
    unsubscribe,
    publish,
  };
}
