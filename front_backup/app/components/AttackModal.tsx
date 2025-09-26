'use client';

import { useState } from 'react';
import AttackFormContent from './AttackFormContent';
import AudioInput from './AudioInput';

interface AttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttackAudioSelected?: (audioUrl: string, attackInfo: {
    isAdaptive: boolean;
    attackType: string;
    targetSpeaker: string;
    asvModel: string;
  }) => void;
}

export default function AttackModal({ isOpen, onClose, onAttackAudioSelected }: AttackModalProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [shouldReset, setShouldReset] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [buttonText, setButtonText] = useState('攻击音频生成');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [attackInfo, setAttackInfo] = useState({
    isAdaptive: false,
    attackType: 'fgsm',
    targetSpeaker: 'speaker1',
    asvModel: '1d_cnn'
  });

  const handleReset = () => {
    setShouldReset(true);
    setTimeout(() => setShouldReset(false), 0);
    setShowResult(false);
    setButtonText('攻击音频生成');
    setIsButtonDisabled(true);
  };

  const handleGenerate = () => {
    if (buttonText === '攻击音频生成') {
      setShowResult(true);
      setButtonText('使用该攻击音频');
    } else if (buttonText === '使用该攻击音频') {
      if (audioUrl && onAttackAudioSelected) {
        onAttackAudioSelected(audioUrl, attackInfo);
      }
      onClose();
    }
  };

  const handleAudioUrlChange = (url: string | null) => {
    setAudioUrl(url);
    setIsButtonDisabled(!url);
  };

  const handleAttackInfoChange = (info: {
    isAdaptive: boolean;
    attackType: string;
    targetSpeaker: string;
    asvModel: string;
  }) => {
    setAttackInfo(info);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative w-[1200px] h-[700px] bg-white rounded-[30px] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 主要内容区域 */}
        <div className="grid grid-cols-2 gap-0 max-w-[960px] mx-auto py-16 px-4">
          {/* 左侧：攻击者原音频 */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-[28.8px] font-bold text-[#655DE6] mb-4">攻击者原音频</h2>
            <p className="text-[18px] text-[#28264D] mb-2">音频最大长度：30s</p>
            <p className="text-[18px] text-[#28264D] mb-4">支持的语言：中文、英文</p>
            <div className="flex flex-col gap-3">
              <AudioInput 
                onAudioUrlChange={handleAudioUrlChange} 
                onReset={shouldReset ? () => {} : undefined}
              />

              {/* 音频播放器 */}
              {audioUrl && (
                <div className="w-full flex items-center gap-4">
                  <audio src={audioUrl} controls className="w-[80%]" />
                  <button 
                    onClick={handleReset}
                    className="flex items-center justify-center"
                  >
                    <svg width="108" height="40" viewBox="0 0 108 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="106" height="38" rx="19" stroke="url(#paint0_linear_78_66)" strokeWidth="2"/>
                      <path d="M34.2235 13.3819L32.8495 15.036L40 15.6842L37.8625 9.00001L36.163 11.0472C34.3107 9.71404 32.0701 8.99652 29.77 9.00001C23.8225 9.00001 19 13.7015 19 19.5C19 25.2999 23.8225 30 29.77 30C31.9495 30.0019 34.0783 29.3574 35.8753 28.1517C37.6723 26.946 39.053 25.2357 39.835 23.2469C39.9069 23.0629 39.9411 22.8668 39.9354 22.6699C39.9298 22.473 39.8845 22.2791 39.8022 22.0993C39.7199 21.9195 39.6021 21.7574 39.4556 21.6221C39.3091 21.4869 39.1368 21.3812 38.9485 21.3111C38.5675 21.1687 38.1444 21.1799 37.7718 21.3421C37.3992 21.5043 37.1077 21.8043 36.961 22.1763C36.4026 23.5972 35.4164 24.819 34.1328 25.6804C32.8491 26.5419 31.3284 27.0023 29.7715 27.001C25.522 27.001 22.0765 23.6428 22.0765 19.5C22.0765 15.3587 25.522 12.0004 29.7715 12.0004C31.3975 12.0004 32.941 12.4932 34.2235 13.3819Z" fill="url(#paint1_linear_78_66)"/>
                      <path d="M50.532 28.2441H58.9109V27.248H51.8016V25.6074H58.9109V24.6504H52.4852V17.7754H58.9109V16.8184H50.5906V15.0605H58.9109V14.084L52.2703 14.2012C52.1661 13.6283 52.0424 13.0423 51.8992 12.4434C57.4331 12.3783 62.8367 12.2285 68.1102 11.9941C68.1232 12.0332 68.2469 12.6452 68.4813 13.8301L61.4891 14.0156V15.0605H69.9266V16.8184H61.4891V17.7754H67.993V24.6504H61.4891V25.6074H68.7156V27.248H61.4891V28.2441H69.9266V30.002H50.532V28.2441ZM65.4734 19.3965H61.4891V20.5098H65.4734V19.3965ZM55.0047 20.5098H58.9109V19.3965H55.0047V20.5098ZM65.4734 23.0293V21.916H61.4891V23.0293H65.4734ZM55.0047 23.0293H58.9109V21.916H55.0047V23.0293ZM72.0539 28.3027H74.2219V19.8457H80.0813V19.0645H72.4641V17.3066H80.0813V16.4473H73.2844V12.0332H90.3352V16.4473H83.05V17.3066H91.0969V19.0645H83.05V19.8457H89.3586V28.3027H91.5461V30.0996H72.0539V28.3027ZM76.9367 28.3027H86.6438V27.541H76.9367V28.3027ZM86.6438 21.5645H76.9367V22.3066H86.6438V21.5645ZM76.9367 26.291H86.6438V25.5488H76.9367V26.291ZM76.9367 24.2988H86.6438V23.5566H76.9367V24.2988ZM80.5891 14.8457H83.0305V13.6348H80.5891V14.8457ZM87.7766 14.8457V13.6348H85.3352V14.8457H87.7766ZM75.843 14.8457H78.2844V13.6348H75.843V14.8457Z" fill="#655DE6"/>
                      <defs>
                        <linearGradient id="paint0_linear_78_66" x1="-3.96" y1="40" x2="117.965" y2="26.4005" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#B224EF"/>
                          <stop offset="1" stopColor="#7579FF"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_78_66" x1="18.23" y1="30" x2="42.1916" y2="29.0101" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#B224EF"/>
                          <stop offset="1" stopColor="#7579FF"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                </div>
              )}

              {/* 生成对抗样本后的结果 */}
              {showResult && audioUrl && (
                <div className="w-full">
                  <h2 className="text-[28.8px] font-bold text-[#655DE6] mb-4">攻击音频生成结果</h2>
                  <div className="w-full flex items-center gap-4">
                    <audio src={audioUrl} controls className="w-[80%]" />
                    <button 
                      onClick={() => {
                        // 创建下载链接
                        const link = document.createElement('a');
                        link.href = audioUrl;
                        link.download = '对抗样本音频.wav';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center justify-center"
                    >
                      <svg width="112" height="40" viewBox="0 0 112 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="110" height="38" rx="19" stroke="url(#paint0_linear_46_891)" strokeWidth="2"/>
                        <path d="M46.02 19.6C45.12 16.74 42.38 14.9 39.04 14.9H38.54C37.8539 13.0287 36.6629 11.3839 35.0989 10.1483C33.535 8.91266 31.6593 8.13446 29.68 7.90003C25.28 7.38003 20.98 9.68003 18.94 13.6C17.9466 15.5297 17.5566 17.7136 17.8205 19.8678C18.0845 22.0221 18.9902 24.0472 20.42 25.68C20.9 26.22 21.74 26.28 22.3 25.8C22.84 25.32 22.9 24.48 22.42 23.92C21.3456 22.6926 20.6646 21.171 20.4649 19.5521C20.2652 17.9332 20.5561 16.2917 21.3 14.84C22.84 11.9 26.08 10.16 29.38 10.56C31.0022 10.7529 32.5285 11.4306 33.7595 12.5046C34.9905 13.5786 35.8689 14.9989 36.28 16.58C36.44 17.16 36.96 17.58H39.04C41.18 17.58 42.92 18.7 43.48 20.44C44.08 22.34 43.4 24.38 41.76 25.54C41.4721 25.7452 41.2769 26.0558 41.217 26.4041C41.157 26.7525 41.2372 27.1105 41.44 27.4C41.5394 27.5423 41.6659 27.6636 41.8124 27.7568C41.9589 27.85 42.1223 27.9133 42.2934 27.943C42.4644 27.9727 42.6396 27.9684 42.8089 27.9301C42.9783 27.8918 43.1383 27.8204 43.28 27.72C45.88 25.86 46.98 22.62 46.02 19.6Z" fill="url(#paint1_linear_46_891)"/>
                        <path d="M35.1197 25.84L33.3397 27.62V19.34C33.3397 18.6 32.7397 18.02 31.9997 18.02C31.2597 18.02 30.6797 18.62 30.6797 19.36V27.64L28.8797 25.84C28.7563 25.7166 28.6097 25.6187 28.4484 25.5519C28.2872 25.485 28.1143 25.4507 27.9397 25.4507C27.7651 25.4507 27.5923 25.485 27.431 25.5519C27.2697 25.6187 27.1232 25.7166 26.9997 25.84C26.8763 25.9635 26.7783 26.11 26.7115 26.2713C26.6447 26.4326 26.6104 26.6054 26.6104 26.78C26.6104 26.9546 26.6447 27.1275 26.7115 27.2887C26.7783 27.45 26.8763 27.5966 26.9997 27.72L31.0597 31.78C31.1597 31.88 31.2597 31.92 31.3597 31.98C31.3997 32 31.4397 32.04 31.4797 32.06C31.6397 32.12 31.8197 32.16 31.9997 32.16C32.0597 32.16 32.0997 32.14 32.1597 32.12C32.2797 32.1 32.3997 32.1 32.4997 32.04C32.6797 31.98 32.8197 31.86 32.9597 31.74L36.9997 27.7C37.5197 27.18 37.5197 26.34 36.9997 25.82C36.4797 25.3 35.6397 25.32 35.1197 25.84Z" fill="url(#paint2_linear_46_891)"/>
                        <path d="M66.8172 17.4629C68.9266 18.9733 71.0424 20.5423 73.1648 22.1699L71.1531 24.6309C68.9396 22.7168 66.9214 21.0827 65.0984 19.7285V30.5684H61.9344V15.2949H54.7469V12.541H73.6141V15.2949H65.0984V19.1816L66.8172 17.4629ZM76.132 15.998H80.6047V14.709H76.7766V12.834H80.6047V11.3887H83.1438V12.834H86.7766V14.709H83.1438V15.998H87.3625C87.3104 14.5658 87.2844 13.0163 87.2844 11.3496H89.8625C89.856 13.0228 89.8788 14.5723 89.9309 15.998H95.4484V18.0684H90.0383C90.149 19.6895 90.3052 21.1283 90.507 22.3848C91.2948 21.2454 91.9849 20.0345 92.5773 18.752L94.7648 19.8066C93.7167 21.8835 92.535 23.778 91.2199 25.4902C91.6561 26.8184 92.0435 27.4824 92.382 27.4824C92.8443 27.4824 93.1112 26.3301 93.1828 24.0254C93.9771 24.5072 94.7714 24.9043 95.5656 25.2168C95.2792 28.7064 94.3352 30.4512 92.7336 30.4512C91.2492 30.4512 90.0936 29.5658 89.2668 27.7949C88.5962 28.5111 87.8964 29.1882 87.1672 29.8262C86.757 29.377 86.298 28.918 85.7902 28.4492L83.7102 28.5273V30.5879H81.2492V28.6348L76.6203 28.8496L76.3469 26.5059L81.2492 26.4082V25.0215H76.9133V22.834C77.2909 22.4434 77.701 21.8965 78.1438 21.1934H76.5617V19.2402H79.2473L79.7063 18.3418H82.5383L82.0109 19.2402H86.9133V21.1934H80.8C80.3703 21.8574 79.9406 22.4824 79.5109 23.0684H81.2492V21.9355H83.7102V23.0684H86.6594V25.0215H83.7102V26.3203C84.8234 26.2812 85.8326 26.2324 86.7375 26.1738C86.718 26.3431 86.7017 26.5059 86.6887 26.6621C87.2746 26.1413 87.8313 25.6009 88.3586 25.041C87.9419 23.2572 87.6457 20.9329 87.4699 18.0684H76.132V15.998ZM92.4797 11.3887C93.1958 12.1699 93.9836 13.1335 94.843 14.2793L92.5969 15.6074C91.9328 14.5137 91.2297 13.5046 90.4875 12.5801L92.4797 11.3887Z" fill="#655DE6"/>
                        <defs>
                          <linearGradient id="paint0_linear_46_891" x1="-4.10667" y1="40" x2="122.217" y2="25.388" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_46_891" x1="16.6907" y1="27.9625" x2="49.2934" y2="26.0479" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_46_891" x1="26.2151" y1="32.16" x2="38.5235" y2="31.7724" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </button>
                  </div>
                  
                  {/* 频谱图对比模块 */}
                  <div className="w-full mt-4">
                    <h2 className="text-[28.8px] font-bold text-[#655DE6] mb-4">频谱图对比</h2>
                    <div className="w-full h-[180px] bg-white rounded-lg flex items-center overflow-hidden">
                      <img 
                        src="/images/spectrum.png" 
                        alt="频谱图对比" 
                        className="w-full h-full object-contain object-left"
                        style={{maxHeight: '100%', maxWidth: '100%'}}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：对抗样本攻击信息 */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-[28.8px] font-bold text-[#655DE6] mb-4">对抗样本攻击信息</h2>
            <AttackFormContent 
              showGenerateButton={true} 
              onGenerate={handleGenerate}
              buttonText={buttonText}
              isButtonDisabled={isButtonDisabled}
              onAttackInfoChange={handleAttackInfoChange}
            />
          </div>
        </div>

        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
} 