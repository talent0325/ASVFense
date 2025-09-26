'use client';

import { useState, useEffect } from 'react';

interface AudioInputProps {
  onAudioUrlChange: (url: string | null) => void;
  onReset?: () => void;
}

export default function AudioInput({ onAudioUrlChange, onReset }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAudioUrlChange(url);
      setHasAudio(true);
    }
  };

  const handleRecordingComplete = () => {
    setIsRecording(false);
    onAudioUrlChange('录制完成的音频URL');
    setHasAudio(true);
  };

  const handleReset = () => {
    setHasAudio(false);
    setIsRecording(false);
    onAudioUrlChange(null);
    if (onReset) {
      onReset();
    }
  };

  // 监听onReset的变化
  useEffect(() => {
    if (onReset) {
      handleReset();
    }
  }, [onReset]);

  return (
    <div className="flex flex-col gap-8">
      {!hasAudio && (
        <>
          {/* 上传音频文件卡片 */}
          <div className="relative w-[380px] h-[180px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B224EF] to-[#7579FF] opacity-22 blur-[10px] rounded-lg"></div>
            <div className="relative bg-white rounded-xl w-full h-full">
              <button 
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="w-full h-full flex flex-col items-start justify-center gap-3 pl-14 py-2"
              >
                <div className="flex items-center gap-5">
                  <div className="w-[48.6px] h-[48.6px] flex items-center justify-center">
                    <svg width="48.6" height="48.6" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.9" y="0.9" width="52.2" height="52.2" rx="25.2" stroke="url(#paint0_linear_42_214)" strokeWidth="1.8"/>
                      <path d="M45 33.84C45 30.42 42.48 27.72 39.24 27.18C39.42 26.28 39.6 25.38 39.6 24.3C39.6 18.36 34.74 13.5 28.8 13.5C23.04 13.5 18.36 18 18 23.76H17.46C12.78 23.58 9 27.36 9 32.04C9 36.54 12.6 40.32 17.1 40.5H25.2V32.58H21.96L27 27L32.04 32.58H28.8V40.5H38.7C42.12 40.32 45 37.44 45 33.84Z" fill="url(#paint1_linear_42_214)"/>
                      <defs>
                        <linearGradient id="paint0_linear_42_214" x1="-1.98" y1="54" x2="59.6356" y2="51.4546" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#B224EF"/>
                          <stop offset="1" stopColor="#7579FF"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_42_214" x1="7.68" y1="40.5" x2="48.7027" y2="38.2404" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#B224EF"/>
                          <stop offset="1" stopColor="#7579FF"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="text-[21.6px] font-bold text-[#655DE6]">点击上传音频文件</span>
                </div>
                <p className="text-[18px] text-[#28264D]">音频文件大小：&lt;10MB</p>
                <p className="text-[18px] text-[#28264D]">支持的文件格式：WAV</p>
              </button>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* 在线录制音频卡片 */}
          <div className="relative w-[380px] h-[180px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B224EF] to-[#7579FF] opacity-22 blur-[10px] rounded-lg"></div>
            <div className={`relative rounded-xl w-full h-full ${isRecording ? 'bg-gradient-to-r from-[#B224EF] to-[#7579FF]' : 'bg-white'}`}>
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className="w-full h-full flex flex-col items-start justify-center gap-3 pl-14 pr-6 py-6"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-[48.6px] h-[48.6px] flex items-center justify-center">
                    {isRecording ? (
                      <svg width="48.6" height="48.6" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.9" y="0.9" width="52.2" height="52.2" rx="26.1" stroke="url(#paint0_linear_42_203)" strokeWidth="1.8"/>
                        <path d="M27.0002 32.69C30.9219 32.69 34.1126 29.4992 34.1126 25.5775V16.1125C34.1126 12.1908 30.9219 9 27.0002 9C23.0785 9 19.8877 12.1908 19.8877 16.1125V25.5775C19.8877 29.4992 23.0785 32.69 27.0002 32.69Z" fill="url(#paint1_linear_42_203)"/>
                        <path d="M35.8973 34.229C38.274 31.8523 39.5832 28.6922 39.5832 25.3313C39.5832 24.4247 38.8484 23.6899 37.9419 23.6899C37.0353 23.6899 36.3005 24.4247 36.3005 25.3313C36.3005 30.4599 32.1282 34.6322 26.9996 34.6322C21.871 34.6322 17.6987 30.4599 17.6987 25.3313C17.6987 24.4247 16.9639 23.6899 16.0574 23.6899C15.1508 23.6899 14.416 24.4247 14.416 25.3313C14.416 28.6927 15.7247 31.8523 18.1019 34.229C20.0874 36.2144 22.6194 37.4536 25.3583 37.8087V41.4711H20.1607C19.2541 41.4711 18.5194 42.2059 18.5194 43.1124C18.5194 44.019 19.2541 44.7538 20.1607 44.7538H33.8385C34.7451 44.7538 35.4798 44.019 35.4798 43.1124C35.4798 42.2059 34.7451 41.4711 33.8385 41.4711H28.6409V37.8087C31.3803 37.4542 33.9124 36.2144 35.8973 34.229Z" fill="url(#paint2_linear_42_203)"/>
                        <defs>
                          <linearGradient id="paint0_linear_42_203" x1="-1.98" y1="54" x2="59.6356" y2="51.4546" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white"/>
                            <stop offset="1" stopColor="white"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_42_203" x1="19.3661" y1="32.69" x2="35.6149" y2="32.2869" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white"/>
                            <stop offset="1" stopColor="white"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_42_203" x1="13.4932" y1="44.7538" x2="42.1888" y2="43.3374" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white"/>
                            <stop offset="1" stopColor="white"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    ) : (
                      <svg width="48.6" height="48.6" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.9" y="0.9" width="52.2" height="52.2" rx="26.1" stroke="url(#paint0_linear_42_203)" strokeWidth="1.8"/>
                        <path d="M27.0002 32.69C30.9219 32.69 34.1126 29.4992 34.1126 25.5775V16.1125C34.1126 12.1908 30.9219 9 27.0002 9C23.0785 9 19.8877 12.1908 19.8877 16.1125V25.5775C19.8877 29.4992 23.0785 32.69 27.0002 32.69Z" fill="url(#paint1_linear_42_203)"/>
                        <path d="M35.8973 34.229C38.274 31.8523 39.5832 28.6922 39.5832 25.3313C39.5832 24.4247 38.8484 23.6899 37.9419 23.6899C37.0353 23.6899 36.3005 24.4247 36.3005 25.3313C36.3005 30.4599 32.1282 34.6322 26.9996 34.6322C21.871 34.6322 17.6987 30.4599 17.6987 25.3313C17.6987 24.4247 16.9639 23.6899 16.0574 23.6899C15.1508 23.6899 14.416 24.4247 14.416 25.3313C14.416 28.6927 15.7247 31.8523 18.1019 34.229C20.0874 36.2144 22.6194 37.4536 25.3583 37.8087V41.4711H20.1607C19.2541 41.4711 18.5194 42.2059 18.5194 43.1124C18.5194 44.019 19.2541 44.7538 20.1607 44.7538H33.8385C34.7451 44.7538 35.4798 44.019 35.4798 43.1124C35.4798 42.2059 34.7451 41.4711 33.8385 41.4711H28.6409V37.8087C31.3803 37.4542 33.9124 36.2144 35.8973 34.229Z" fill="url(#paint2_linear_42_203)"/>
                        <defs>
                          <linearGradient id="paint0_linear_42_203" x1="-1.98" y1="54" x2="59.6356" y2="51.4546" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                          <linearGradient id="paint1_linear_42_203" x1="19.3661" y1="32.69" x2="35.6149" y2="32.2869" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                          <linearGradient id="paint2_linear_42_203" x1="13.4932" y1="44.7538" x2="42.1888" y2="43.3374" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#B224EF"/>
                            <stop offset="1" stopColor="#7579FF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                    {isRecording && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                    )}
                  </div>
                  <span className={`text-[21.6px] font-bold ${isRecording ? 'text-white' : 'text-[#655DE6]'}`}>
                    {isRecording ? '录音中...' : '在线录制音频'}
                  </span>
                </div>
                {!isRecording && (
                  <>
                    <p className="text-[18px] text-[#28264D]">请保持麦克风状态良好</p>
                    <p className="text-[18px] text-[#28264D]">尽量在无噪音的环境中录制</p>
                  </>
                )}
                {isRecording && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRecording(false);
                      handleRecordingComplete();
                    }}
                    className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    结束录音
                  </button>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 