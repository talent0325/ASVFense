from flask import Blueprint, request, jsonify, send_file
import os
from config import Config
from utils import save_audio_file, save_recorded_audio, get_audio_duration, save_list_to_json, load_list_from_json
from werkzeug.utils import secure_filename
import uuid


api = Blueprint('api', __name__)

# speaker router - 添加数据清理功能 这里有改动
speakers_db = load_list_from_json(Config.SPEAKER_FOLDER + '/speakers.json')
# 添加数据清理函数
def clean_invalid_speakers():
    """清理数据库中文件不存在的无效记录"""
    global speakers_db
    valid_speakers = []
    removed_count = 0
    
    print("=== 开始清理无效说话人记录 ===")
    
    for speaker in speakers_db[:]:  # 创建副本避免修改迭代中的列表
        audio_dir = os.path.join(Config.SPEAKER_FOLDER, 'speaker_audio')
        filepath = os.path.join(audio_dir, speaker['filename'])
        
        if not os.path.exists(filepath):
            print(f"❌ 清理无效记录: {speaker['id']} - 文件不存在: {filepath}")
            speakers_db.remove(speaker)
            removed_count += 1
        else:
            valid_speakers.append(speaker)
    
    if removed_count > 0:
        save_list_to_json(valid_speakers, Config.SPEAKER_FOLDER + '/speakers.json')
        print(f"✅ 清理完成，移除了 {removed_count} 条无效记录")
        speakers_db = valid_speakers
    else:
        print("✅ 没有发现无效记录")
    
    print(f"当前有效记录数: {len(speakers_db)}")
    print("=== 清理完成 ===")
    return speakers_db

# 启动时自动清理
speakers_db = clean_invalid_speakers()

@api.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件上传'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400

    try:
        file_info = save_audio_file(file)
        duration = get_audio_duration(file_info['filepath'])

        if duration and duration > 30:
            os.remove(file_info['filepath'])
            return jsonify({'error': '音频长度不能超过30秒'}), 400

        return jsonify({
            'id': file_info['id'],
            'filename': file_info['filename'],
            'duration': duration
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@api.route('/api/record', methods=['POST'])
def record_audio():
    if 'audio' not in request.files:
        return jsonify({'error': '没有音频数据'}), 400

    audio_file = request.files['audio']
    try:
        file_info = save_recorded_audio(
            audio_file.read(), 'recorded_audio.wav')
        duration = get_audio_duration(file_info['filepath'])

        if duration and duration > 30:
            os.remove(file_info['filepath'])
            return jsonify({'error': '音频长度不能超过30秒'}), 400

        return jsonify({
            'id': file_info['id'],
            'filename': file_info['filename'],
            'duration': duration
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@api.route('/api/attack-types', methods=['GET'])
def get_attack_types():
    return jsonify(Config.ATTACK_TYPES)


@api.route('/api/target-speakers', methods=['GET'])
def get_target_speakers():
    return jsonify(Config.TARGET_SPEAKERS)


@api.route('/api/asv-models', methods=['GET'])
def get_asv_models():
    return jsonify(Config.ASV_MODELS)


@api.route('/api/generate-attack', methods=['POST'])
def generate_attack():
    data = request.json
    if not data:
        return jsonify({'error': '没有提供数据'}), 400

    required_fields = ['audio_file_id', 'attack_type',
                       'target_speaker', 'asv_model', 'attack_info']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'缺少必要字段: {field}'}), 400

    # 检查文件是否存在
    filepath = os.path.join(Config.UPLOAD_FOLDER, data['audio_file_id'])
    if not os.path.exists(filepath):
        return jsonify({'error': '音频文件不存在'}), 404

    # 这里应该调用实际的攻击生成算法
    # 现在只是模拟生成一个结果
    original_filename = data['audio_file_id'].split(
        '_', 1)[1] if '_' in data['audio_file_id'] else data['audio_file_id']  # 获取原始文件名
    result_file_id = f"attack_{data['audio_file_id']}"
    result_filepath = os.path.join(Config.UPLOAD_FOLDER, result_file_id)

    # 模拟生成对抗样本（实际应该调用攻击算法）
    import shutil
    shutil.copy2(filepath, result_filepath)

    return jsonify({
        'id': result_file_id,
        'filename': f"attack_{original_filename}",  # 使用原始文件名
        'attack_type': data['attack_type'],
        'target_speaker': data['target_speaker'],
        'asv_model': data['asv_model'],
        'attack_info': data['attack_info']  # 包含 is_adaptive 和 has_target
    })


@api.route('/api/audio/<audio_id>', methods=['GET'])
def get_audio(audio_id):
    filepath = os.path.join(Config.UPLOAD_FOLDER, audio_id)
    if not os.path.exists(filepath):
        return jsonify({'error': '文件不存在'}), 404

    # 获取原始文件名
    # original_filename = audio_id.split('_', 1)[1]
    return send_file(
        filepath,
        as_attachment=True,
        # download_name=original_filename
        download_name=audio_id
    )


@api.route('/api/asv-systems', methods=['GET'])
def get_asv_systems():
    """获取所有 ASV 系统"""
    try:
        # 模拟从数据库获取 ASV 系统列表
        asv_systems = [
            {"id": 1, "name": "1D-CNN"},
            {"id": 2, "name": "x-Vector"},
            {"id": 3, "name": "ECAPA-TDNN"}
        ]
        return jsonify({"asv_systems": asv_systems})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/api/defense-test', methods=['POST'])
def defense_test():
    """处理防御测试请求"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['audio_file', 'is_defense_enabled', 'asv_system']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        print(data)
        # 模拟处理防御测试
        # 这里应该调用实际的防御和 ASV 系统处理逻辑
        result = {
            "success": True,
            "message": "防御测试完成",
            "recognition_result": {
                "speaker_id": "speaker_001",
                "confidence": 0.95,
                "is_authenticated": True
            }
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# speaker router
# speakers_db = load_list_from_json(Config.SPEAKER_FOLDER + '/speakers.json')


@api.route('/api/speakers', methods=['GET'])
def get_speakers():
    return jsonify(speakers_db)


@api.route('/api/speakers', methods=['POST'])
def add_speaker():
    if 'audio' not in request.files:
        return jsonify({'error': '没有上传音频文件'}), 400

    audio_file = request.files['audio']
    model = request.form.get('model', 'ASV1')
    print(audio_file.filename)
    if audio_file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400

    # 生成唯一ID和文件名
    speaker_id = str(uuid.uuid4())
    original_filename = audio_file.filename
    filename = f"{speaker_id}_{original_filename}"

    # 保存文件
    # filepath = os.path.join(Config.SPEAKER_FOLDER+'/speaker_audio', filename) 这里有改动
    audio_dir = os.path.join(Config.SPEAKER_FOLDER, 'speaker_audio')
    filepath = os.path.join(audio_dir, filename)
    audio_file.save(filepath)

    # 创建说话人记录
    speaker = {
        'id': speaker_id,
        'audioUrl': f'/api/speakers/{speaker_id}/audio',
        'model': model,
        'filename': filename  # 添加文件名到返回数据中
    }

    speakers_db.append(speaker)
    save_list_to_json(speakers_db, Config.SPEAKER_FOLDER + '/speakers.json')
    return jsonify(speaker), 201

@api.route('/api/speakers/<speaker_id>/audio', methods=['GET'])
def get_speaker_audio(speaker_id):
    # 查找说话人记录
    speaker = next((s for s in speakers_db if s['id'] == speaker_id), None)
    if not speaker:
        return jsonify({'error': '说话人不存在'}), 404

    # filepath = os.path.join(Config.SPEAKER_FOLDER +
    #                         '/speaker_audio', speaker['filename']) 这里有改动
    # 这里也需要使用正确的路径拼接方式
    audio_dir = os.path.join(Config.SPEAKER_FOLDER, 'speaker_audio')
    filepath = os.path.join(audio_dir, speaker['filename'])
    if not os.path.exists(filepath):
        return jsonify({'error': '音频文件不存在'}), 404
    return send_file(filepath, mimetype='audio/wav')


@api.route('/api/speakers/<speaker_id>', methods=['DELETE'])
def delete_speaker(speaker_id):
    # 查找并删除说话人记录
    speaker = next((s for s in speakers_db if s['id'] == speaker_id), None)
    if not speaker:
        return jsonify({'error': '说话人不存在'}), 404

    # 删除音频文件
    # filepath = os.path.join(Config.SPEAKER_FOLDER +
    #                         '/speaker_audio', speaker['filename']) 这里有改动
    # 这里也需要使用正确的路径拼接方式
    audio_dir = os.path.join(Config.SPEAKER_FOLDER, 'speaker_audio')
    filepath = os.path.join(audio_dir, speaker['filename'])
    if os.path.exists(filepath):
        os.remove(filepath)

    # 从数据库中删除
    speakers_db.remove(speaker)
    return jsonify({'message': '删除成功'}), 200


@api.route('/api/speakers/<speaker_id>', methods=['PUT'])
def update_speaker(speaker_id):
    data = request.json
    if not data or 'id' not in data:
        return jsonify({'error': '缺少必要字段'}), 400

    new_id = data['id']
    # 检查新ID是否已存在
    if any(s['id'] == new_id for s in speakers_db if s['id'] != speaker_id):
        return jsonify({'error': '该ID已存在'}), 400

    # 查找并更新说话人记录
    speaker = next((s for s in speakers_db if s['id'] == speaker_id), None)
    if not speaker:
        return jsonify({'error': '说话人不存在'}), 404

    # 更新ID
    speaker['id'] = new_id
    return jsonify(speaker), 200
