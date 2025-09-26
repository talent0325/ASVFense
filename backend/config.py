import os
import json
from dotenv import load_dotenv

load_dotenv()


class Config:
    # 基础配置
    SECRET_KEY = 'dev'
    UPLOAD_FOLDER = 'uploads'
    SPEAKER_FOLDER = 'speaker'
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

    # 确保上传目录存在
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    if not os.path.exists(SPEAKER_FOLDER):
        os.makedirs(SPEAKER_FOLDER)

    if not os.path.exists(SPEAKER_FOLDER+'/speaker_audio'):
        os.makedirs(SPEAKER_FOLDER+'/speaker_audio')

    if not os.path.exists(SPEAKER_FOLDER+'/speakers.json'):
        with open(SPEAKER_FOLDER+'/speakers.json', 'w') as f:
            json.dump([], f)

    # 允许的文件扩展名
    ALLOWED_EXTENSIONS = {'wav'}

    # 攻击类型配置
    ATTACK_TYPES = ['FGSM−l∞', 'PGD', 'cw_l2',
                    'cw_linf', 'deepfool', 'fakebob', 'kenansville']

    # 目标说话人配置
    TARGET_SPEAKERS = ['speaker1', 'speaker2', 'speaker3']

    # ASV模型配置
    ASV_MODELS = ['1D-CNN', 'ECAPA-TDNN', 'x-Vector+PLDA']
