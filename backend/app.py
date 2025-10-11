from flask import Flask
from flask_cors import CORS
from config import Config
from routes import api


# def create_app():  # 负责创建 Flask 应用实例
#     app = Flask(__name__)
#     app.config.from_object(Config)   #  从 config.py 里加载配置（比如 DEBUG、数据库 URL 等）

#     # 初始化CORS  允许跨域请求（前端运行在不同端口，比如 React 在 3000，Flask 在 5000）
#     CORS(app)   

#     # 注册蓝图
#     # fetch('http://localhost:5000/api/record') 调用的不是文件夹，而是 蓝图里的路由
#     # 确保 routes/api.py 里有 /record 的路由，否则 fetch 会 404
#     app.register_blueprint(api)

#     return app
def create_app(config_class=Config, **kwargs):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化 CORS
    from flask_cors import CORS
    CORS(app)

    # 注册蓝图
    from routes import api
    app.register_blueprint(api)

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
