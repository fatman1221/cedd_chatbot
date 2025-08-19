FROM node:latest AS builder
WORKDIR /app
# 优先复制依赖文件，利用缓存加速构建
COPY code/package*.json ./
RUN npm install
COPY code .
# 执行 Vite 构建命令，生成 dist 目录
RUN npm install uuid  # 或 pnpm add uuid
RUN npm install @headlessui/react
RUN npm run build

FROM nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html 
# 使用自己定义的nginx镜像覆盖nginx的配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY localhost+3.pem /etc/nginx/localhost+3.pem
COPY localhost+3-key.pem /etc/nginx/localhost+3-key.pem
# 暴露nginx的镜像端口是80
EXPOSE 443 
# CMD ["nginx","-g","daemon off;"] # 在容器中启动nginx镜像的命令

# 无交互，ntp服务同步，保证服务器时间统一
RUN apt-get update 
RUN DEBIAN_FRONTEND=noninteractive TZ=Asia/Shanghai apt-get -y install tzdata
RUN apt-get install -y cpio vim locales ntp pkg-config
# RUN apt-get install -y google-perftools libomp-dev openssl libssl-dev
# RUN apt-get install -y net-tools iputils-ping htop cmake cmake-curses-gui

# 设置 locales and time
RUN echo "en_US.UTF-8 UTF-8" >>  /etc/locale.gen
RUN /usr/sbin/locale-gen
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

