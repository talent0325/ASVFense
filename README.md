ASV安全卫士：抗说话人伪造攻击的可插拔ASV安全防御系统

这是一个基于 Web 的声纹识别（ASV）安全防御系统，结合 Flask 后端和 Next.js 前端，提供即插即用的对抗样本防御能力，保护 ASV 系统免受音频对抗攻击。

项目结构


├── backend/            # Flask 后端服务
│   ├── app.py          # 主应用文件
│   ├── requirements.txt # Python 依赖
│   └── ...             # 其他后端文件
├── frontend/           # Next.js 前端应用
│   ├── pages/          # 页面组件
│   ├── public/         # 静态资源
│   └── ...             # 其他前端文件
└── README.md           # 项目文档


环境要求

• Node.js v16+

• Python 3.8+

• pip 24.0+

快速开始

1. 克隆仓库

git clone https://github.com/your-username/audio-adversarial-platform.git
cd audio-adversarial-platform


2. 安装后端依赖

cd backend
pip install -r requirements.txt


3. 安装前端依赖

cd ../frontend
npm install
# 或使用 yarn
yarn install


4. 启动开发环境

启动后端服务

cd backend
python -m flask run


后端服务将在 http://localhost:5000 运行

启动前端开发服务器

cd frontend
npm run dev
# 或使用 yarn
yarn dev


前端服务将在 http://localhost:3000 运行

