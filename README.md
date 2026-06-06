# 民办幼儿园膳食管理系统

## 项目简介

面向民办幼儿园的全流程膳食管理系统，涵盖后勤、班级老师、家长代表和市场监管人员四类用户角色，将采购验收、菜谱发布、留样登记、班级用餐、家长陪餐、问题整改全链路打通，并针对过敏误配、留样过期、供应商批次异常、家长集中差评等关键风险点提供告警和整改闭环。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Ant Design 5 + React Router + Axios
- **后端**：NestJS 10 + TypeScript + TypeORM + sql.js (SQLite WASM) + JWT/Passport + @nestjs/schedule
- **数据库**：SQLite（better-sqlite3，零配置，数据持久化到 backend/data/meal.db）
- **部署**：Docker + Docker Compose + Nginx

## 角色与功能矩阵

| 角色 | 权限 |
|------|------|
| 后勤 (logistics) | 菜谱管理、留样登记、供应商/食材批次管理、班级用餐查看登记、陪餐评价查看、整改管理、告警中心 |
| 班级老师 (teacher) | 菜谱查看、留样查看、班级用餐登记（过敏/忌口/剩餐）、陪餐评价查看 |
| 家长代表 (parent) | 菜谱查看、留样查看、提交陪餐评价（评分/照片/建议） |
| 市场监管 (regulator) | 菜谱查看、留样查看、供应商/食材批次查看、班级用餐查看、陪餐评价查看统计、整改管理、告警中心 |

## 核心业务闭环

1. **采购验收** → 供应商管理 + 食材批次登记（批次号、供应商、生产日期、保质期、验收照片、票据照片）
2. **菜谱发布** → 每日三餐菜品，关联对应食材批次，自动带出来源
3. **留样登记** → 留样盒编号、时间、菜品、留样人，48 小时自动告警过期
4. **班级用餐** → 幼儿过敏、临时忌口、剩餐情况登记
5. **家长陪餐** → 家长评分、照片、建议，低分自动标记差评并触发告警
6. **问题整改** → 过敏误配、留样过期、批次异常、集中差评四类告警 → 生成整改单 → 责任人处理 → 闭环完成

## 原始需求

> 建设一个给民办幼儿园后勤、班级老师、家长代表和市场监管人员使用的膳食管理系统，React 页面呈现菜谱、留样、陪餐和整改情况，NestJS 保存食材批次、供应商、留样记录和反馈闭环。后勤登记每日菜谱、食材来源、验收照片、留样盒编号和留样时间；班级老师记录幼儿过敏、剩餐和临时忌口；家长代表提交陪餐评价、照片和建议；监管人员查看食材票据、留样记录和整改结果。系统要把采购验收、菜谱发布、留样登记、班级用餐、家长陪餐、问题整改连起来。过敏幼儿误配、留样过期、供应商批次异常、家长集中差评要落到各自处置。

> 请修复前端 TypeScript 构建失败问题，重点统一 src/api/index.ts 的导出类型、返回值结构和各业务页面调用方式，处理供应商、班级用餐、陪餐评价页面里的 getAll/delete/list/remove、id 类型、DTO 类型和未使用导入等错误。修复后重新执行 Docker 构建启动，并打开页面完成登录与核心业务链路验证。

## 启动方式

### 前置要求

- Node.js >= 18
- pnpm 或 npm（推荐 npm 8+）
- Docker Desktop（如使用 Docker 一键启动）

### 方式一：Docker 一键启动（推荐）

#### 1. 构建并启动

```bash
docker compose up --build
```

如需后台运行：

```bash
docker compose up --build -d
```

#### 2. 访问地址

- 前端页面：http://localhost:8080
- 后端 API：http://localhost:3000

#### 3. 停止和清理

```bash
docker compose down
```

### 方式二：本地开发启动

#### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端（新开终端）
cd ../frontend
npm install
```

#### 2. 初始化种子数据

```bash
cd backend
npm run seed
```

#### 3. 启动后端服务

```bash
cd backend
npm run start:dev
```

后端 API 地址：http://localhost:3000

#### 4. 启动前端服务

新开终端：

```bash
cd frontend
npm run dev
```

前端访问地址：http://localhost:5173

### 测试账号

四个角色均使用相同密码 `123456`：

| 用户名 | 角色 | 真实姓名 |
|--------|------|----------|
| logistics | 后勤 | 张后勤 |
| teacher | 班级老师 | 李老师 |
| parent | 家长代表 | 王家长 |
| regulator | 市场监管 | 赵监管 |

## 目录结构

```
wmy-23/
├── backend/                     # NestJS 后端
│   ├── src/
│   │   ├── common/              # 公共装饰器、守卫、枚举
│   │   ├── entities/            # TypeORM 实体（11 张表）
│   │   ├── modules/             # 11 个业务模块
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── seed.ts              # 种子数据脚本
│   ├── data/                    # SQLite 数据库文件（自动生成）
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                    # React 前端
│   ├── src/
│   │   ├── api/                 # Axios API 封装
│   │   ├── components/          # 公共组件（Layout）
│   │   ├── context/             # React Context（用户状态）
│   │   ├── pages/               # 10 个业务页面
│   │   ├── types/               # TypeScript 类型定义
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf               # Nginx 配置（含 API 反向代理）
│   └── .dockerignore
├── docker-compose.yml           # 根目录编排文件
├── Dockerfile                   # 根目录多阶段构建（可选）
├── .dockerignore
├── .done                        # 任务执行过程记录
└── README.md
```

## API 模块一览

| 模块 | 路径 | 主要功能 |
|------|------|----------|
| 认证 | /auth/* | 登录、用户信息、角色权限 |
| 供应商 | /suppliers/* | 供应商 CRUD |
| 食材批次 | /ingredient-batches/* | 批次管理、过期检查 |
| 菜谱 | /recipes/* | 按日期查询（支持班级过敏标记）、CRUD、过敏原管理 |
| 留样 | /samples/* | 留样登记、销毁、过期检查 |
| 班级用餐 | /classroom-meals/* | 用餐登记、过敏风险 |
| 过敏名单 | /allergy-children/* | 过敏幼儿 CRUD、按班级查询、过敏原汇总 |
| 分餐核对 | /meal-distributions/* | 核对清单生成、分餐记录（替代餐+照片+确认人）、误配风险告警、风险统计 |
| 陪餐评价 | /escort-reviews/* | 评价提交、差评标记、统计 |
| 整改 | /rectifications/* | 整改单 CRUD、状态流转 |
| 告警 | /alerts/* | 告警列表、处理、定时扫描（30 分钟/次，含过敏误配告警） |
