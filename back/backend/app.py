from flask import Flask
from flask_cors import CORS
from config import Config
from routes import api


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 初始化CORS
    CORS(app)

    # 注册蓝图
    app.register_blueprint(api)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
