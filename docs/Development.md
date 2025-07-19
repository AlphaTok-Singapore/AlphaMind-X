### 🚀 核心应用模块

#### 🐍 后端API服务 (api/)
```
api/
├── 📋 配置管理
│   ├── configs/            # 配置文件
│   ├── constants/          # 常量定义
│   └── contexts/           # 上下文管理
├── 🎮 控制器层
│   ├── controllers/
│   │   ├── alphamind/      # 🤖 AlphaMind专用控制器
│   │   │   ├── __init__.py
│   │   │   ├── account_controller.py      # 账户管理
│   │   │   ├── agent_controller.py        # 智能体控制
│   │   │   ├── agents.py                  # 智能体功能
│   │   │   ├── api_compat_controller.py   # API兼容性
│   │   │   ├── auth_settings_controller.py # 认证设置
│   │   │   ├── chat.py                    # 聊天功能
│   │   │   ├── chat_controller.py         # 聊天控制
│   │   │   ├── data_controller.py         # 数据管理
│   │   │   ├── features_controller.py     # 功能特性
│   │   │   ├── settings_compat_controller.py # 设置兼容
│   │   │   ├── settings_controller.py     # 设置管理
│   │   │   └── workflow_controller.py     # 工作流控制
│   │   ├── common/         # 通用控制器
│   │   ├── console/        # 控制台控制器
│   │   ├── files/          # 文件管理控制器
│   │   ├── inner_api/      # 内部API控制器
│   │   ├── service_api/    # 服务API控制器
│   │   └── web/            # Web控制器
├── 🧠 核心业务逻辑
│   ├── core/
│   │   ├── alphamind/      # 🤖 AlphaMind核心模块
│   │   │   ├── __init__.py
│   │   │   ├── ai_engine.py           # AI引擎
│   │   │   ├── config.py              # 配置管理
│   │   │   └── exceptions.py          # 异常处理
│   │   ├── agent/          # 智能体核心
│   │   ├── app/            # 应用核心
│   │   ├── file/           # 文件处理核心
│   │   └── workflow/       # 工作流核心
├── 📊 数据模型层
│   ├── models/
│   │   ├── alphamind/      # 🤖 AlphaMind数据模型
│   │   │   ├── __init__.py
│   │   │   ├── conversation.py        # 对话模型
│   │   │   ├── message.py             # 消息模型
│   │   │   ├── agent.py               # 智能体模型
│   │   │   ├── skill.py               # 技能模型
│   │   │   ├── dataset.py             # 数据集模型
│   │   │   ├── knowledge_base.py      # 知识库模型
│   │   │   ├── workflow.py            # 工作流模型
│   │   │   └── settings.py            # 设置模型
│   │   ├── account/        # 账户模型
│   │   ├── dataset/        # 数据集模型
│   │   ├── model/          # 模型管理
│   │   └── workflow/       # 工作流模型
├── 🔧 业务服务层
│   ├── services/
│   │   ├── alphamind/      # 🤖 AlphaMind业务服务
│   │   │   ├── __init__.py
│   │   │   ├── chat_service.py        # 聊天服务
│   │   │   ├── agent_service.py       # 智能体服务
│   │   │   ├── data_service.py        # 数据服务
│   │   │   ├── workflow_service.py    # 工作流服务
│   │   │   ├── integration_service.py # 集成服务
│   │   │   └── analytics_service.py   # 分析服务
│   │   ├── auth/           # 认证服务
│   │   ├── dataset_service/ # 数据集服务
│   │   └── file_service/   # 文件服务
├── 🔌 扩展模块
│   ├── extensions/         # 扩展功能
│   │   ├── alphamind/      # 🤖 AlphaMind扩展
│   │   ├── ext_database.py # 数据库扩展
│   │   └── ext_redis.py    # Redis扩展
├── 🗄️ 数据迁移
│   ├── migrations/         # 数据库迁移
│   │   ├── alphamind/      # 🤖 AlphaMind迁移脚本
│   │   └── versions/       # 迁移版本
├── 🧪 测试模块
│   ├── tests/              # 测试文件
│   │   ├── alphamind/      # 🤖 AlphaMind测试
│   │   └── unit_tests/     # 单元测试
├── 📋 路由配置
│   ├── routes/             # API路由定义
├── ⏰ 定时任务
│   ├── schedule/           # 定时任务
├── 🔄 异步任务
│   ├── tasks/              # 异步任务
├── 📄 模板文件
│   ├── templates/          # 模板文件
├── 🏭 工厂模式
│   ├── factories/          # 工厂类
├── 📝 字段定义
│   ├── fields/             # 字段定义
├── 📚 工具库
│   ├── libs/               # 工具库
├── 🐳 Docker配置
│   ├── docker/             # Docker相关配置
├── 📅 事件处理
│   ├── events/             # 事件处理
├── 📄 配置文件
│   ├── .env.example        # 环境变量示例
│   ├── .dockerignore       # Docker忽略文件
│   ├── Dockerfile          # Docker构建文件
│   ├── pyproject.toml      # Python项目配置
│   └── requirements.txt    # Python依赖
```

#### 🌐 前端Web应用 (web/)
```
web/
├── 📱 应用页面
│   ├── app/
│   │   ├── (commonLayout)/     # 通用布局页面
│   │   │   ├── alphamind/      # 🤖 AlphaMind页面模块
│   │   │   │   ├── page.tsx                    # AlphaMind主页面
│   │   │   │   ├── layout.tsx                  # AlphaMind布局
│   │   │   │   ├── chat/                       # 💬 聊天功能
│   │   │   │   │   ├── page.tsx                # 聊天主页面
│   │   │   │   │   ├── [id]/                   # 具体对话页面
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── components/             # 聊天组件
│   │   │   │   │       ├── ChatInterface.tsx
│   │   │   │   │       ├── MessageList.tsx
│   │   │   │   │       ├── InputArea.tsx
│   │   │   │   │       └── ConversationSidebar.tsx
│   │   │   │   ├── agents/                     # 🤖 智能体管理
│   │   │   │   │   ├── page.tsx                # 智能体列表页面
│   │   │   │   │   ├── create/                 # 创建智能体
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── [id]/                   # 智能体详情
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── analytics/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── components/             # 智能体组件
│   │   │   │   │       ├── AgentCard.tsx
│   │   │   │   │       ├── AgentForm.tsx
│   │   │   │   │       ├── SkillSelector.tsx
│   │   │   │   │       └── PerformanceChart.tsx
│   │   │   │   ├── data/                       # 📊 数据管理
│   │   │   │   │   ├── page.tsx                # 数据管理主页面
│   │   │   │   │   ├── datasets/               # 数据集管理
│   │   │   │   │   │   ├── page.tsx            # 数据集列表页面
│   │   │   │   │   │   ├── create/            # 创建数据集
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── [id]/              # 数据集详情
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   └── edit/
│   │   │   │   │   │   │       └── page.tsx
│   │   │   │   │   │   └── import/            # 导入数据
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── knowledge/              # 知识库管理
│   │   │   │   │   │   ├── page.tsx            # 知识库列表页面
│   │   │   │   │   │   ├── create/            # 创建知识库
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── [id]/              # 知识库详情
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   ├── documents/     # 文档管理
│   │   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   │   └── settings/      # 知识库设置
│   │   │   │   │   │   │       └── page.tsx
│   │   │   │   │   │   └── upload/            # 上传文档
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── components/             # 数据组件
│   │   │   │   │       ├── DatasetCard.tsx     # 数据集卡片
│   │   │   │   │       ├── KnowledgeCard.tsx   # 知识库卡片
│   │   │   │   │       ├── FileUploader.tsx    # 文件上传器
│   │   │   │   │       ├── DataVisualizer.tsx  # 数据可视化
│   │   │   │   │       └── DocumentList.tsx    # 文档列表
│   │   │   │   ├── workflows/                  # 🔄 工作流管理
│   │   │   │   │   ├── page.tsx                # 工作流主页面
│   │   │   │   │   ├── create/                 # 创建工作流
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── [id]/                   # 工作流详情
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── monitor/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── components/             # 工作流组件
│   │   │   │   │       ├── WorkflowCard.tsx
│   │   │   │   │       ├── WorkflowEditor.tsx
│   │   │   │   │       ├── NodeSelector.tsx
│   │   │   │   │       └── ExecutionMonitor.tsx
│   │   │   │   ├── analytics/                  # 📊 数据分析
│   │   │   │   │   ├── page.tsx                # 分析主页面
│   │   │   │   │   ├── reports/                # 报告管理
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── dashboards/             # 仪表盘管理
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── components/             # 分析组件
│   │   │   │   │       ├── MetricsCard.tsx
│   │   │   │   │       ├── AnalyticsChart.tsx
│   │   │   │   │       ├── DataVisualizer.tsx
│   │   │   │   │       └── ReportGenerator.tsx
│   │   │   │   ├── settings/                   # ⚙️ 系统设置
│   │   │   │   │   ├── page.tsx                # 设置主页面
│   │   │   │   │   ├── components/             # 设置组件
│   │   │   │   │   │   ├── ProfileSection.tsx  # 个人资料设置区块
│   │   │   │   │   │   ├── PreferencesForm.tsx # 偏好设置表单
│   │   │   │   │   │   ├── ApiKeysManager.tsx  # API密钥管理
│   │   │   │   │   │   ├── SecuritySettings.tsx # 安全设置
│   │   │   │   │   │   └── NotificationPanel.tsx # 通知面板
│   │   │   │   │   ├── api/                    # 设置相关API
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── hooks/                  # 设置相关钩子
│   │   │   │   │       ├── useSettings.ts      # 设置状态钩子
│   │   │   │   │       └── useSettingsMutation.ts # 设置修改钩子
│   │   │   │   └── components/                 # AlphaMind共享组件
│   │   │   │       ├── AlphaMindLayout.tsx
│   │   │   │       ├── Navigation.tsx
│   │   │   │       ├── Header.tsx
│   │   │   │       ├── Sidebar.tsx
│   │   │   │       ├── StatusIndicator.tsx
│   │   │   │       └── QuickActions.tsx
│   │   │   ├── apps/               # 应用管理
│   │   │   ├── datasets/           # 数据集管理
│   │   │   ├── tools/              # 工具管理
│   │   │   └── explore/            # 探索页面
│   │   ├── (shareLayout)/          # 共享布局页面
│   │   ├── components/             # 页面级组件
│   │   └── signin/                 # 登录页面
├── 🧩 组件库
│   ├── components/
│   │   ├── alphamind/              # 🤖 AlphaMind专用组件
│   │   │   ├── ui/                 # UI组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Form.tsx
│   │   │   │   └── Chart.tsx
│   │   │   ├── features/           # 功能组件
│   │   │   │   ├── ChatBot.tsx
│   │   │   │   ├── AgentBuilder.tsx
│   │   │   │   ├── DataProcessor.tsx
│   │   │   │   └── WorkflowEditor.tsx
│   │   │   ├── hooks/              # 自定义Hooks
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useAgent.ts
│   │   │   │   ├── useData.ts
│   │   │   │   └── useSettings.ts
│   │   │   └── index.ts            # 组件导出
│   │   ├── base/                   # 基础组件
│   │   ├── ui/                     # 通用UI组件
│   │   └── app/                    # 应用组件
├── 🎯 状态管理
│   ├── context/
│   │   ├── alphamind/              # 🤖 AlphaMind Context
│   │   │   ├── AlphaMindContext.tsx
│   │   │   ├── ChatContext.tsx
│   │   │   ├── AgentContext.tsx
│   │   │   ├── DataContext.tsx
│   │   │   └── SettingsContext.tsx
│   │   ├── app-context.tsx         # 应用全局状态
│   │   └── modal-context.tsx       # 模态框状态
├── 🎨 静态资源
│   ├── assets/                     # 静态资源
│   │   ├── images/                 # 图片资源
│   │   ├── icons/                  # 图标资源
│   │   └── fonts/                  # 字体资源
├── 🌍 国际化
│   ├── i18n/                       # 国际化配置
│   │   ├── en-US/                  # 英文语言包
│   │   ├── zh-Hans/                # 简体中文语言包
│   │   └── ja-JP/                  # 日文语言包
├── 🔧 工具函数
│   ├── utils/                      # 工具函数
│   │   ├── alphamind/              # 🤖 AlphaMind工具函数
│   │   ├── auth.ts                 # 认证工具
│   │   ├── request.ts              # 请求工具
│   │   └── format.ts               # 格式化工具
├── 🎭 主题样式
│   ├── themes/                     # 主题配置
│   │   ├── default.ts              # 默认主题
│   │   └── dark.ts                 # 暗色主题
├── 📡 服务层
│   ├── service/                    # 前端服务层
│   │   ├── alphamind/              # 🤖 AlphaMind服务
│   │   ├── auth.ts                 # 认证服务
│   │   └── api.ts                  # API服务
├── 🔗 自定义Hooks
│   ├── hooks/                      # 全局自定义Hooks
│   │   ├── use-app-context.ts      # 应用状态Hook
│   │   └── use-breakpoints.ts      # 响应式Hook
├── 📊 数据模型
│   ├── models/                     # 前端数据模型
│   │   ├── alphamind/              # 🤖 AlphaMind模型
│   │   └── common.ts               # 通用模型
├── 🔧 类型定义
│   ├── types/                      # TypeScript类型定义
│   │   ├── alphamind/              # 🤖 AlphaMind类型
│   │   ├── app.ts                  # 应用类型
│   │   └── api.ts                  # API类型
├── 🛠️ 开发工具
│   ├── bin/                        # 构建脚本
│   ├── config/                     # 配置文件
│   ├── __mocks__/                  # Mock文件
│   ├── .husky/                     # Git Hooks
│   └── .storybook/                 # Storybook配置
├── 📄 配置文件
│   ├── .env.example                # 环境变量示例
│   ├── .gitignore                  # Git忽略文件
│   ├── Dockerfile                  # Docker构建文件
│   ├── next.config.js              # Next.js配置
│   ├── package.json                # 项目依赖
│   ├── tailwind.config.js          # Tailwind CSS配置
│   └── tsconfig.json               # TypeScript配置
```

### 🐳 容器化部署
```
docker/
├── docker-compose.yml              # Docker Compose配置
├── docker-compose.middleware.yaml  # 中间件服务配置
├── .env.example                    # Docker环境变量示例
├── nginx/                          # Nginx配置
│   └── nginx.conf                  # Nginx配置文件
├── postgres/                       # PostgreSQL配置
│   └── init.sql                    # 数据库初始化脚本
└── volumes/                        # 数据卷配置
```