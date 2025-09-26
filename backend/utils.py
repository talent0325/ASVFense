import os
import uuid
from werkzeug.utils import secure_filename
import librosa
import soundfile as sf
from config import Config
import json


def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def save_audio_file(file, is_uploaded=True):
    """保存音频文件并返回文件信息"""
    if not file or not allowed_file(file.filename):
        raise ValueError('不支持的文件类型')

    # 获取原始文件名
    original_filename = file.filename
    # 生成唯一标识符
    unique_id = uuid.uuid4().hex
    # 组合文件名：唯一标识符_原始文件名
    unique_filename = f"{unique_id}_{original_filename}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

    # 保存文件
    file.save(filepath)

    # 返回文件信息
    return {
        'id': unique_filename,
        'filename': original_filename,  # 返回原始文件名
        'filepath': filepath,
        'is_uploaded': is_uploaded
    }


def save_recorded_audio(audio_data, filename):
    """保存录制的音频文件"""
    if not audio_data:
        return None

    # 获取原始文件名
    original_filename = filename
    # 生成唯一标识符
    unique_id = uuid.uuid4().hex
    # 组合文件名：唯一标识符_原始文件名
    unique_filename = f"{unique_id}_{original_filename}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)

    # 保存文件
    with open(filepath, 'wb') as f:
        f.write(audio_data)

    # 返回文件信息
    return {
        'id': unique_filename,
        'filename': original_filename,  # 返回原始文件名
        'filepath': filepath,
        'is_uploaded': False
    }


def get_audio_duration(filepath):
    """获取音频文件时长（秒）"""
    try:
        y, sr = librosa.load(filepath)
        duration = librosa.get_duration(y=y, sr=sr)
        return duration
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return None


def save_list_to_json(list, filename):
    """保存列表到JSON文件"""
    with open(filename, 'w') as f:
        json.dump(list, f)


def load_list_from_json(filename):
    """从JSON文件加载列表"""
    with open(filename, 'r') as f:
        return json.load(f)
