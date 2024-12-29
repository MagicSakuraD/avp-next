#!/bin/bash

# # 确保脚本在遇到错误时退出
# set -e

# # 检查 Docker 是否安装
# if ! command -v docker &> /dev/null; then
#     echo "Docker could not be found, please install Docker and try again."
#     exit 1
# fi

# # 检查 Docker 服务是否正在运行
# if ! docker info >/dev/null 2>&1; then
#     echo "Docker daemon is not running, please start Docker service and try again."
#     exit 1
# fi

# # 构建 Docker 镜像
# echo "Building Docker image..."
# docker build -t nextjs-docker .

# # 检查构建是否成功
# if [ $? -ne 0 ]; then
#     echo "Failed to build Docker image."
#     exit 1
# fi

# 运行 Docker 容器
echo "Running Docker container..."
CONTAINER_ID=$(sudo docker run -p 3000:3000 -d nextjs-docker)

# 检查容器是否成功启动
if [ -z "$CONTAINER_ID" ]; then
    echo "Failed to start Docker container."
    exit 1
else
    echo "Docker container started with ID: $CONTAINER_ID"
    echo "Visit http://localhost:3000 to view your Next.js app."
fi