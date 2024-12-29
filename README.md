This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

以下是改进后的 GitHub README，适配 Markdown 格式并添加命令行部分的适当格式：

````markdown
## 使用 Docker 构建和运行 Next.js 项目

### 第一步：构建镜像容器

运行以下命令以构建镜像：

```bash
docker build -t nextjs-docker .
```
````

### 第二步：启动容器

运行 `run_docker.sh` 脚本以启动容器：

```bash
sh run_docker.sh
```

### 第三步：访问网站

启动完成后，访问以下地址查看网站：

```
http://localhost:3000
```

```

你可以将此 README 文件添加到你的项目中，便于其他开发者快速了解如何运行项目。

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```
