/* eslint-disable @typescript-eslint/no-unused-vars */
// import { AppSidebar } from "@/components/app-sidebar";
"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LeafletMap from "@/app/dashboard/LeafletMap";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useMqtt from "@/lib/mqtt";

const points: Array<[number, number]> = [];

export default function Page() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>([]);

  const mqttConfig = {
    host: "192.168.1.90",
    port: 1883,
    clientId: `avp_manager_id`,
    protocol: "ws",
    username: "avp_manager",
    password: "123456",
  };

  const { connectionStatus, messages, subscribe, unsubscribe, publish } =
    useMqtt(mqttConfig);

  return (
    <SidebarProvider>
      {/* <AppSidebar /> */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">AVP</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>自主代客泊车</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto">
          <LeafletMap points={points} geoJsonPath="/zjw0515.geojson" />

          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <div className="flex flex-row justify-evenly items-center">
            <Button>自动泊入</Button> <Button>自动泊出</Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
