/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [isParkInDialogOpen, setIsParkInDialogOpen] = useState(false);
  const [isParkOutDialogOpen, setIsParkOutDialogOpen] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [carInfo, setCarInfo] = useState({
    x: 113,
    y: 22,
    yaw: 0,
  });

  const mqttConfig = {
    host: "192.168.1.90",
    port: 8083,
    clientId: `avp_manager_app_id`,
    protocol: "ws",
    username: "avp_manager",
    password: "123456",
  };

  const { connectionStatus, messages, subscribe, unsubscribe, publish } =
    useMqtt(mqttConfig);

  const handleParkIn = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证车牌号格式
    const licensePlateRegex = /^[A-Za-z0-9]+$/;
    if (!licensePlateRegex.test(licensePlate)) {
      toast({
        title: "错误",
        description: "请输入正确格式的车牌号",
        variant: "destructive",
      });
      return;
    }

    // 构造消息payload
    const payload = {
      name: "mini_app",
      payload: {
        pid: "966658472",
        vin: licensePlate,
      },
      sender: "UIS",
      seq: 0,
      time: new Date().getTime() / 1000,
    };

    // 发布消息
    if (connectionStatus.connected) {
      publish(
        `/cc/req/park_in/${licensePlate}/${mqttConfig.password}`,
        JSON.stringify(payload)
      );
      toast({
        title: "成功",
        description: "泊入请求已发送",
      });
      setIsDialogOpen(false);
      setLicensePlate(""); // 清空输入
    } else {
      toast({
        title: "错误",
        description: "MQTT连接失败，请检查网络",
        variant: "destructive",
      });
    }

    subscribe(`/ec/ind/vehicle_localization/${licensePlate}/111`);

    if (messages) {
      Object.entries(messages).forEach(([topic, message]) => {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.payload && parsedMessage.payload.x && parsedMessage.payload.y) {
            setCarInfo({
              x: parsedMessage.payload.x,
              y: parsedMessage.payload.y,
              yaw: parsedMessage.payload.yaw,
            });
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });
    }
  };
  // 泊车
  const handleParkOut = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证车牌号格式
    const licensePlateRegex = /^[A-Za-z0-9]+$/;
    if (!licensePlateRegex.test(licensePlate)) {
      toast({
        title: "错误",
        description: "请输入正确格式的车牌号",
        variant: "destructive",
      });
      return;
    }

    // 构造消息payload
    const payload = {
      name: "mini_app",
      payload: {
        POIid: "3001",
        pid: "966658472",
        vin: licensePlate,
      },
      sender: "UIS",
      seq: 2,
      time: new Date().getTime() / 1000,
    };

    // 发布消息
    if (connectionStatus.connected) {
      publish(
        `/cc/req/park_out/${licensePlate}/${mqttConfig.password}`,
        JSON.stringify(payload)
      );
      toast({
        title: "成功",
        description: "泊出请求已发送",
      });
      setIsDialogOpen(false);
      setLicensePlate(""); // 清空输入
    } else {
      toast({
        title: "错误",
        description: "MQTT连接失败，请检查网络",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
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

          <LeafletMap points={points} geoJsonPath="/zjw0515.geojson" carInfo = {carInfo}/>

          <div className="flex flex-row justify-evenly items-center">
            <Dialog
              open={isParkInDialogOpen}
              onOpenChange={setIsParkInDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsParkOutDialogOpen(false)}>
                  自动泊入
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleParkIn}>
                  <DialogHeader>
                    <DialogTitle>设置车牌号</DialogTitle>
                    <DialogDescription>
                      请输入需要泊入的车辆车牌号
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="licensePlate" className="text-right">
                        车牌号
                      </Label>
                      <Input
                        id="licensePlate"
                        value={licensePlate}
                        onChange={(e) =>
                          setLicensePlate(e.target.value.toUpperCase())
                        }
                        placeholder="例：LMWS81S56N1S00011"
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">提交</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* 泊车 */}
            <Dialog
              open={isParkOutDialogOpen}
              onOpenChange={setIsParkOutDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsParkInDialogOpen(false)}>
                  自动泊出
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleParkOut}>
                  <DialogHeader>
                    <DialogTitle>设置车牌号</DialogTitle>
                    <DialogDescription>
                      请输入需要泊出的车辆车牌号
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="licensePlate" className="text-right">
                        车牌号
                      </Label>
                      <Input
                        id="licensePlate"
                        value={licensePlate}
                        onChange={(e) =>
                          setLicensePlate(e.target.value.toUpperCase())
                        }
                        placeholder="例：LMWS81S56N1S00011"
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">提交</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
