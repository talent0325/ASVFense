'use client';

import { useState, useRef } from 'react';

interface Speaker {
  id: string;
  audioUrl: string;
}

export default function SpeakerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: '0001', audioUrl: '/reference_1.wav' },
    { id: '0001', audioUrl: '/reference_1.wav' },
    { id: '0001', audioUrl: '/reference_1.wav' },
    { id: '0001', audioUrl: '/reference_1.wav' },
    { id: '0001', audioUrl: '/reference_1.wav' },
    { id: '0001', audioUrl: '/reference_1.wav' },
  ]);

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (index: number | 'new', currentValue: string) => {
    setEditingId(index);
    setEditValue(currentValue);
  };

  const handleSave = (index: number | 'new') => {
    if (editingId === index) {
      if (index === 'new') {
        // 处理新建说话人的情况
        setEditingId(null);
        setEditValue('');
      } else {
        const newSpeakers = [...speakers];
        newSpeakers[index] = { ...newSpeakers[index], id: editValue };
        setSpeakers(newSpeakers);
        setEditingId(null);
        setEditValue('');
      }
    }
  };

  const handleNewSpeaker = () => {
    if (audioUrl) {
      const newId = `000${speakers.length + 1}`;
      setSpeakers([...speakers, { id: newId, audioUrl }]);
      setAudioUrl(null);
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // 模拟上传过程
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setIsUploading(false);
      }, 1000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index: number) => {
    const newSpeakers = [...speakers];
    newSpeakers.splice(index, 1);
    setSpeakers(newSpeakers);
  };

  return (
    <div className="max-w-[1000px] mx-auto py-24 px-6">
      {/* 标题和新建按钮 */}
      <div className="flex items-center mb-12">
        <h1 className="text-[30px] text-[#655DE6] font-bold ml-24">已有说话人</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-6 flex items-center justify-center gap-[5px] px-4 py-1 bg-gradient-to-r from-[#B224EF] to-[#7579FF] rounded-[32px] text-white hover:opacity-90 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          新建说话人
        </button>
      </div>

      {/* 列表 */}
      <div className="border-t border-b border-gray-200 overflow-hidden">
        {/* 列表头部 */}
        <div className="grid grid-cols-3 text-[#28264D] bg-gray-50 border-b border-gray-200">
          <div className="px-6 py-4 text-center font-medium">说话人id</div>
          <div className="px-6 py-4 text-center font-medium">音频</div>
          <div className="px-6 py-4 text-center font-medium">管理</div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-gray-200">
          {speakers.map((speaker, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-3 items-center transition-colors duration-200 hover:bg-[#F5F7FF] ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="px-6 py-4 flex items-center justify-center gap-2">
                {editingId === index ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave(index);
                      }
                    }}
                    className="bg-[#F5F7FF] text-[#655DE6] px-2 py-1 rounded border border-[#655DE6] w-32 text-center focus:outline-none focus:ring-2 focus:ring-[#655DE6] focus:ring-opacity-50"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-[#28264D]">{speaker.id}</span>
                    <button 
                      onClick={() => handleEdit(index, speaker.id)}
                      className="p-1 hover:bg-[#F5F7FF] rounded-full transition-colors"
                    >
                      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.66602 28C3.66602 27.7348 3.77137 27.4804 3.95891 27.2929C4.14645 27.1054 4.4008 27 4.66602 27H28.666C28.9312 27 29.1856 27.1054 29.3731 27.2929C29.5607 27.4804 29.666 27.7348 29.666 28C29.666 28.2652 29.5607 28.5196 29.3731 28.7071C29.1856 28.8946 28.9312 29 28.666 29H4.66602C4.4008 29 4.14645 28.8946 3.95891 28.7071C3.77137 28.5196 3.66602 28.2652 3.66602 28ZM21.13 3C21.2616 3.00003 21.3918 3.02601 21.5133 3.07646C21.6348 3.12691 21.7451 3.20084 21.838 3.294L26.708 8.166C26.8955 8.35353 27.0008 8.60784 27.0008 8.873C27.0008 9.13816 26.8955 9.39247 26.708 9.58L12.918 23.374C12.7306 23.5609 12.4767 23.6659 12.212 23.666H7.33202C7.0668 23.666 6.81245 23.5606 6.62491 23.3731C6.43737 23.1856 6.33202 22.9312 6.33202 22.666V17.814C6.33204 17.6824 6.35803 17.5522 6.40848 17.4307C6.45893 17.3092 6.53285 17.1989 6.62602 17.106L20.422 3.294C20.5149 3.20084 20.6252 3.12691 20.7467 3.07646C20.8682 3.02601 20.9985 3.00003 21.13 3ZM21.13 5.414L8.33402 18.228V21.668H11.798L24.586 8.872L21.13 5.414Z" fill="#9391B1"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="px-6 py-4 flex justify-center">
                <audio src={speaker.audioUrl} controls className="h-8 w-[250px]" />
              </div>
              <div className="px-6 py-4 flex justify-center">
                <button 
                  onClick={() => handleDelete(index)}
                  className="px-4 py-1 bg-[#655DE6] text-white rounded-lg hover:bg-[#7B74E8] transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 新建说话人弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-[30px] p-10 w-[900px]" onClick={e => e.stopPropagation()}>
            {/* 标题和说明 */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-[29px] font-bold text-[#655DE6]">新建说话人</h2>
                <div className="flex items-center gap-4">
                  {editingId === 'new' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        setEditingId(null);
                        setEditValue('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingId(null);
                          setEditValue('');
                        }
                      }}
                      className="bg-[#F5F7FF] text-[19px] text-[#655DE6] px-2 py-1 rounded border border-[#655DE6] w-32 focus:outline-none focus:ring-2 focus:ring-[#655DE6] focus:ring-opacity-50"
                      autoFocus
                    />
                  ) : (
                    <span className="text-[19px] text-black">说话人id：{`000${speakers.length + 1}`}</span>
                  )}
                  <button className="text-black" onClick={() => {
                    setEditingId('new');
                    setEditValue(`000${speakers.length + 1}`);
                  }}>
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.66602 28C3.66602 27.7348 3.77137 27.4804 3.95891 27.2929C4.14645 27.1054 4.4008 27 4.66602 27H28.666C28.9312 27 29.1856 27.1054 29.3731 27.2929C29.5607 27.4804 29.666 27.7348 29.666 28C29.666 28.2652 29.5607 28.5196 29.3731 28.7071C29.1856 28.8946 28.9312 29 28.666 29H4.66602C4.4008 29 4.14645 28.8946 3.95891 28.7071C3.77137 28.5196 3.66602 28.2652 3.66602 28ZM21.13 3C21.2616 3.00003 21.3918 3.02601 21.5133 3.07646C21.6348 3.12691 21.7451 3.20084 21.838 3.294L26.708 8.166C26.8955 8.35353 27.0008 8.60784 27.0008 8.873C27.0008 9.13816 26.8955 9.39247 26.708 9.58L12.918 23.374C12.7306 23.5609 12.4767 23.6659 12.212 23.666H7.33202C7.0668 23.666 6.81245 23.5606 6.62491 23.3731C6.43737 23.1856 6.33202 22.9312 6.33202 22.666V17.814C6.33204 17.6824 6.35803 17.5522 6.40848 17.4307C6.45893 17.3092 6.53285 17.1989 6.62602 17.106L20.422 3.294C20.5149 3.20084 20.6252 3.12691 20.7467 3.07646C20.8682 3.02601 20.9985 3.00003 21.13 3ZM21.13 5.414L8.33402 18.228V21.668H11.798L24.586 8.872L21.13 5.414Z" fill="#9391B1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-[19px] text-[#28264D]">音频最大长度：30s</p>
              <p className="text-[19px] text-[#28264D] mt-4">支持的语言：中文、英文</p>
            </div>

            {/* 上传区域 */}
            <div className="grid grid-cols-2 gap-12 mb-8">
              {!audioUrl ? (
                <>
                  {/* 文件上传 */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#B224EF] to-[#7579FF] opacity-20 blur-[20px] rounded-lg"></div>
                    <div className="relative bg-white rounded-xl p-8 min-h-[200px]">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="w-full h-full flex flex-col items-center justify-center gap-5 min-h-[200px]"
                      >
                        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0.9" y="0.9" width="52.2" height="52.2" rx="25.2" stroke="url(#paint0_linear_50_559)" strokeWidth="1.8"/>
                          <path d="M45 33.84C45 30.42 42.48 27.72 39.24 27.18C39.42 26.28 39.6 25.38 39.6 24.3C39.6 18.36 34.74 13.5 28.8 13.5C23.04 13.5 18.36 18 18 23.76H17.46C12.78 23.58 9 27.36 9 32.04C9 36.54 12.6 40.32 17.1 40.5H25.2V32.58H21.96L27 27L32.04 32.58H28.8V40.5H38.7C42.12 40.32 45 37.44 45 33.84Z" fill="url(#paint1_linear_50_559)"/>
                          <defs>
                            <linearGradient id="paint0_linear_50_559" x1="-1.98" y1="54" x2="59.6356" y2="51.4546" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#B224EF"/>
                              <stop offset="1" stopColor="#7579FF"/>
                            </linearGradient>
                            <linearGradient id="paint1_linear_50_559" x1="7.68" y1="40.5" x2="48.7027" y2="38.2404" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#B224EF"/>
                              <stop offset="1" stopColor="#7579FF"/>
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="text-[19px] font-bold text-[#655DE6]">
                          {isUploading ? '上传中...' : '点击上传音频文件'}
                        </span>
                        <p className="text-[16px] text-[#28264D]">音频文件大小：&lt;10MB</p>
                        <p className="text-[16px] text-[#28264D]">支持的文件格式：WAV、MP3、FLAC</p>
                      </button>
                    </div>
                  </div>

                  {/* 在线录制 */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-tr from-[#B224EF] to-[#7579FF] ${isRecording ? 'opacity-100' : 'opacity-20'} blur-[20px] rounded-lg`}></div>
                    <div className={`relative rounded-xl p-8 min-h-[200px] ${isRecording ? 'bg-gradient-to-tr from-[#B224EF] to-[#7579FF]' : 'bg-white'}`}>
                      <button
                        onClick={isRecording ? undefined : startRecording}
                        className="w-full h-full flex flex-col items-center justify-center gap-5 min-h-[200px]"
                      >
                        <div className="relative">
                          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.9" y="0.9" width="52.2" height="52.2" rx="26.1" stroke={isRecording ? "white" : "url(#paint0_linear_50_548)"} strokeWidth="1.8"/>
                            <path d="M27.0002 32.69C30.9219 32.69 34.1126 29.4992 34.1126 25.5775V16.1125C34.1126 12.1908 30.9219 9 27.0002 9C23.0785 9 19.8877 12.1908 19.8877 16.1125V25.5775C19.8877 29.4992 23.0785 32.69 27.0002 32.69Z" fill={isRecording ? "white" : "url(#paint1_linear_50_548)"}/>
                            <path d="M35.8973 34.2295C38.274 31.8528 39.5832 28.6927 39.5832 25.3318C39.5832 24.4252 38.8484 23.6904 37.9419 23.6904C37.0353 23.6904 36.3005 24.4252 36.3005 25.3318C36.3005 30.4604 32.1282 34.6327 26.9996 34.6327C21.871 34.6327 17.6987 30.4604 17.6987 25.3318C17.6987 24.4252 16.9639 23.6904 16.0574 23.6904C15.1508 23.6904 14.416 24.4252 14.416 25.3318C14.416 28.6932 15.7247 31.8528 18.1019 34.2295C20.0874 36.2149 22.6194 37.4541 25.3583 37.8092V41.4716H20.1607C19.2541 41.4716 18.5194 42.2064 18.5194 43.1129C18.5194 44.0195 19.2541 44.7543 20.1607 44.7543H33.8385C34.7451 44.7543 35.4798 44.0195 35.4798 43.1129C35.4798 42.2064 34.7451 41.4716 33.8385 41.4716H28.6409V37.8092C31.3803 37.4547 33.9124 36.2149 35.8973 34.2295Z" fill={isRecording ? "white" : "url(#paint2_linear_50_548)"}/>
                            <defs>
                              <linearGradient id="paint0_linear_50_548" x1="-1.98" y1="54" x2="59.6356" y2="51.4546" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#B224EF"/>
                                <stop offset="1" stopColor="#7579FF"/>
                              </linearGradient>
                              <linearGradient id="paint1_linear_50_548" x1="19.3661" y1="32.69" x2="35.6149" y2="32.2869" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#B224EF"/>
                                <stop offset="1" stopColor="#7579FF"/>
                              </linearGradient>
                              <linearGradient id="paint2_linear_50_548" x1="13.4932" y1="44.7543" x2="42.1888" y2="43.3379" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#B224EF"/>
                                <stop offset="1" stopColor="#7579FF"/>
                              </linearGradient>
                            </defs>
                          </svg>
                          {isRecording && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                            </div>
                          )}
                        </div>
                        <span className={`text-[19px] font-bold ${isRecording ? 'text-white' : 'text-[#655DE6]'}`}>
                          {isRecording ? '录音中...' : '在线录制音频'}
                        </span>
                        {!isRecording && (
                          <>
                            <p className="text-[16px] text-[#28264D]">请保持麦克风状态良好</p>
                            <p className="text-[16px] text-[#28264D]">尽量在无噪音的环境中录制</p>
                          </>
                        )}
                        {isRecording && (
                          <button
                            onClick={stopRecording}
                            className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                          >
                            结束录音
                          </button>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#B224EF] to-[#7579FF] opacity-20 blur-[20px] rounded-lg"></div>
                  <div className="relative bg-white rounded-xl p-8">
                    <div className="flex items-center justify-center">
                      <audio src={audioUrl} controls className="w-full max-w-[600px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮 */}
            <button
              onClick={handleNewSpeaker}
              disabled={!audioUrl}
              className="w-full h-[60px] bg-gradient-to-r from-[#B224EF] to-[#7579FF] text-white text-[19px] font-bold rounded-[10px] hover:opacity-90 transition-opacity tracking-[0.08em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              新建说话人
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 