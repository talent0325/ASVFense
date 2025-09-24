'use client';

import { useState, useRef } from 'react';
import AttackModal from '../components/AttackModal';

export default function DefensePage() {
  const [isDefenseEnabled, setIsDefenseEnabled] = useState(false);
  const [selectedAsv, setSelectedAsv] = useState<number | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [attackInfo, setAttackInfo] = useState<{
    isAdaptive: boolean;
    attackType: string;
    targetSpeaker: string;
    asvModel: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const asvOptions = ['1D-CNN', 'x-Vector', 'ECAPA-TDNN'];

  const handleAttackAudioSelected = (url: string, info: {
    isAdaptive: boolean;
    attackType: string;
    targetSpeaker: string;
    asvModel: string;
  }) => {
    setAudioUrl(url);
    setAttackInfo(info);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.includes('wav')) {
        alert('请上传WAV格式的音频文件');
        return;
      }

      // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        return;
      }

      // 处理符合要求的文件
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center">
      {/* 隐藏的文件输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".wav,.mp3,.flac"
        onChange={handleFileUpload}
      />

      {/* 主要内容区域 */}
      <div className="max-w-[1000px] mx-auto px-4 py-24">
        <div className="grid grid-cols-4 gap-4">
          {/* 攻击者音频 */}
          <div className="flex flex-col items-center p-6">
            <h2 className="text-[28.8px] text-[#655DE6] font-bold mb-6">攻击者音频</h2>
            <div className="flex flex-col gap-4 w-full">
              {!audioUrl ? (
                <>
                  <div 
                    className="relative w-[160px] h-[50px] mx-auto cursor-pointer"
                    onMouseEnter={() => setHoveredButton('online')}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#B224EF] to-[#7579FF] rounded-lg">
                      <div className="absolute inset-[3px] bg-white rounded-[6px] transition-all duration-200 hover:opacity-90">
                        <button className="w-full h-full font-['Microsoft_YaHei'] text-[20px] leading-[32px]">
                          <span className="bg-gradient-to-r from-[#B224EF] to-[#7579FF] bg-clip-text text-transparent">
                            在线生成
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="relative w-[160px] h-[50px] mx-auto cursor-pointer"
                    onMouseEnter={() => setHoveredButton('upload')}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#B224EF] to-[#7579FF] rounded-lg">
                      <div className="absolute inset-[3px] bg-white rounded-[6px] transition-all duration-200 hover:opacity-90">
                        <button className="w-full h-full font-['Microsoft_YaHei'] text-[20px] leading-[32px]">
                          <span className="bg-gradient-to-r from-[#B224EF] to-[#7579FF] bg-clip-text text-transparent">
                            本地上传
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-[12.8px] w-[210.6px]">
                  {/* 音频播放器 */}
                  <div className="w-full">
                    <audio src={audioUrl} controls className="w-full" />
                  </div>
                  
                  {/* 攻击信息 */}
                  {attackInfo && (
                    <div className="flex flex-col gap-[12.8px]">
                      {/* 适应性攻击 */}
                      <div className="flex items-center gap-[9.6px]">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.1284 0.199219C19.7673 0.199219 21.0998 1.58056 21.0998 3.28493V18.7135C21.0998 20.4155 19.7673 21.7992 18.1284 21.7992H3.27123C1.62998 21.7992 0.299805 20.4155 0.299805 18.7135V3.28493C0.299805 1.58056 1.62998 0.199219 3.27123 0.199219H18.1284ZM16.0762 8.86815C16.5823 8.34261 16.5823 7.4844 16.0762 6.95886C15.5702 6.43333 14.7437 6.43333 14.2377 6.95886L9.21409 12.1756L7.16195 10.0446C6.65588 9.51904 5.82945 9.51904 5.32338 10.0446C4.81591 10.5701 4.81591 11.4283 5.32338 11.9539L8.2948 15.0396C8.80088 15.5651 9.62731 15.5651 10.1334 15.0396L16.0762 8.86815Z" fill="#655DE6"/>
                        </svg>
                        <span className="text-[19.2px] text-[#655DE6] font-bold font-['Microsoft_YaHei']">
                          {attackInfo.isAdaptive ? '适应性攻击' : '非适应性攻击'}
                        </span>
                      </div>
                      
                      {/* 攻击类型 */}
                      <div className="flex items-start gap-[4px]">
                        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em]">攻击类型</span>
                        <span className="text-[19.2px] text-[#655DE6] font-bold font-['Microsoft_YaHei']">{attackInfo.attackType}</span>
                      </div>
                      
                      {/* 目标说话人 */}
                      <div className="flex items-start gap-[4px]">
                        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em]">目标说话人</span>
                        <span className="text-[19.2px] text-[#655DE6] font-bold font-['Microsoft_YaHei']">{attackInfo.targetSpeaker}</span>
                      </div>
                      
                      {/* ASV模型 */}
                      <div className="flex items-start gap-[4px]">
                        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em]">ASV模型</span>
                        <span className="text-[19.2px] text-[#655DE6] font-bold font-['Microsoft_YaHei']">{attackInfo.asvModel}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 防御模块 */}
          <div className="flex flex-col items-center p-6">
            <h2 className={`text-[28.8px] font-bold mb-6 ${isDefenseEnabled ? 'bg-gradient-to-r from-[#B224EF] to-[#7579FF] bg-clip-text text-transparent' : 'text-[#655DE6]'}`}>防御模块</h2>
            <div className="flex justify-center">
              <div className="relative w-[80px] h-[40px]">
                <div className={`absolute inset-0 rounded-full transition-colors ${isDefenseEnabled ? 'bg-gradient-to-r from-[#B224EF] to-[#7579FF]' : 'bg-[#D9D9D9]'}`}></div>
                <div 
                  className={`absolute top-[2px] left-[2px] w-[36.8px] h-[36.8px] bg-white rounded-full shadow-lg transition-transform cursor-pointer ${isDefenseEnabled ? 'translate-x-[40px]' : 'translate-x-0'}`}
                  onClick={() => setIsDefenseEnabled(!isDefenseEnabled)}
                ></div>
              </div>
            </div>
          </div>

          {/* ASV系统 */}
          <div className="flex flex-col items-center p-6">
            <h2 className="text-[28.8px] text-[#655DE6] font-bold mb-6">ASV系统</h2>
            <div className="flex flex-col gap-4 w-full">
              {asvOptions.map((asv, index) => (
                <div 
                  key={asv}
                  className="relative w-[160px] h-[50px] mx-auto cursor-pointer"
                  onClick={() => setSelectedAsv(index)}
                  onMouseEnter={() => setHoveredButton(asv)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B224EF] to-[#7579FF] rounded-lg">
                    <div className={`absolute inset-[3px] ${selectedAsv === index ? 'bg-gradient-to-r from-[#B224EF] to-[#7579FF]' : 'bg-white'} rounded-[6px] transition-all duration-200 hover:opacity-90`}>
                      <button className="w-full h-full font-['Microsoft_YaHei'] text-[20px] leading-[32px] font-bold">
                        <span className={`${selectedAsv === index ? 'text-white' : 'bg-gradient-to-r from-[#B224EF] to-[#7579FF] bg-clip-text text-transparent'}`}>
                          {asv}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 说话人识别结果 */}
          <div className="flex flex-col items-center p-6">
            <h2 className="text-[28.8px] text-[#655DE6] font-bold mb-6 whitespace-nowrap">说话人识别结果</h2>
          </div>
        </div>

        {/* 开始测试按钮 */}
        <div className="mt-50 text-center">
          <button className="w-[636px] h-[60px] bg-gradient-to-r from-[#B224EF] to-[#7579FF] text-white text-[24px] font-bold rounded-[10px] hover:opacity-90 transition-opacity">
            开始测试
          </button>
        </div>
      </div>

      {/* 攻击生成弹窗 */}
      <AttackModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAttackAudioSelected={handleAttackAudioSelected}
      />
    </div>
  );
} 