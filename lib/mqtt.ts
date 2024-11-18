import { useEffect, useState } from "react";
import mqtt from "mqtt";

export interface ValuesTpye {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  protocol: string;
}

export default function useMqtt(values: ValuesTpye, topicMqtt: string) {
  // const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const client = mqtt.connect(url, options);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(topicMqtt);
    });

    client.on("message", (topicMqtt, message) => {
      setMessage(message.toString());
      console.log(message.toString());
    });

    // setClient(client);

    return () => {
      client.end();
    };
  }, []);
  return message;
}
