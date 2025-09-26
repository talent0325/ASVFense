'use client';

import { useState, useEffect } from 'react';

interface AttackFormContentProps {
  showGenerateButton?: boolean;
  onGenerate?: (result: any) => void;
  buttonText?: string;
  isButtonDisabled?: boolean;
  onAttackInfoChange?: (info: {
    attack_info: {
      is_adaptive: boolean;
      has_target: boolean;
    };
    attack_type: string;
    target_speaker: string;
    asv_model: string;
  }) => void;
  audioFileId?: string;
}

export default function AttackFormContent({ 
  showGenerateButton = true, 
  onGenerate,
  buttonText = '攻击音频生成',
  isButtonDisabled = false,
  onAttackInfoChange,
  audioFileId
}: AttackFormContentProps) { // 分别存储复选框和下拉选择的值
  const [hasTarget, setHasTarget] = useState(false);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [attackType, setAttackType] = useState('fgsm');
  const [targetSpeaker, setTargetSpeaker] = useState('speaker_a');
  const [asvModel, setAsvModel] = useState('1d_cnn');
  const [attackTypes, setAttackTypes] = useState<string[]>([]);
  const [targetSpeakers, setTargetSpeakers] = useState<string[]>([]);
  const [asvModels, setAsvModels] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 获取攻击类型、目标说话人和ASV模型列表
  useEffect(() => {
    const fetchData = async () => {
      try {  // 页面加载时并行请求后端获取可选值
        const [attackTypesRes, targetSpeakersRes, asvModelsRes] = await Promise.all([
          fetch('http://localhost:5000/api/attack-types'),
          fetch('http://localhost:5000/api/target-speakers'),
          fetch('http://localhost:5000/api/asv-models')
        ]);

        if (!attackTypesRes.ok || !targetSpeakersRes.ok || !asvModelsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [attackTypesData, targetSpeakersData, asvModelsData] = await Promise.all([
          attackTypesRes.json(),
          targetSpeakersRes.json(),
          asvModelsRes.json()
        ]);

        setAttackTypes(attackTypesData);
        setTargetSpeakers(targetSpeakersData);
        setAsvModels(asvModelsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // 当攻击信息变化时通知父组件
  useEffect(() => {
    if (onAttackInfoChange) {
      onAttackInfoChange({
        attack_info: {
          is_adaptive: isAdaptive,
          has_target: hasTarget
        },
        attack_type: attackType,
        target_speaker: targetSpeaker,
        asv_model: asvModel
      });
    }
  }, [isAdaptive, hasTarget, attackType, targetSpeaker, asvModel, onAttackInfoChange]);

  const handleGenerate = async () => {
    if (!audioFileId) {
      alert('请先上传或录制音频');
      return;
    }

    setIsGenerating(true);  // isGenerating 控制按钮 loading 状态和禁用状态
    try {
      const response = await fetch('http://localhost:5000/api/generate-attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_file_id: audioFileId,
          attack_type: attackType,
          target_speaker: targetSpeaker,
          asv_model: asvModel,
          attack_info: {
            is_adaptive: isAdaptive,
            has_target: hasTarget
          }
        }),
      });

      if (!response.ok) {
        throw new Error('生成对抗样本失败');
      }

      const data = await response.json();
      if (onGenerate) {
        onGenerate(data);
      }
    } catch (error) {
      console.error('生成对抗样本失败:', error);
      alert(error instanceof Error ? error.message : '生成对抗样本失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (  // 页面右边的复选框等UI
    <div className="flex flex-col gap-[30px] w-[470.4px] h-[349.4px]">
      {/* 复选框选项 */}
      <div className="flex gap-[19.2px] w-[470.4px] h-[48px]">
        <label className="relative w-[225.6px] h-[48px] cursor-pointer">
          <input 
            type="checkbox" 
            className="hidden peer" 
            checked={hasTarget}
            onChange={(e) => setHasTarget(e.target.checked)}
          />
          <div className="absolute inset-0 border-[1.6px] border-[#DADADA] rounded-[6.4px] peer-checked:bg-[#E2E6FF] peer-checked:border-none transition-all">
            <div className="absolute left-[23.2px] top-[11.2px] flex items-center gap-[9.6px]">
              <div className="w-[26px] h-[28px] flex items-center justify-center">
                {hasTarget ? (
                  <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.2857 0.200195C24.3344 0.200195 26 1.92687 26 4.05734V23.3431C26 25.4705 24.3344 27.2002 22.2857 27.2002H3.71429C1.66272 27.2002 0 25.4705 0 23.3431V4.05734C0 1.92687 1.66272 0.200195 3.71429 0.200195H22.2857ZM19.7205 11.0364C20.3531 10.3794 20.3531 9.30667 19.7205 8.64975C19.0879 7.99283 18.0549 7.99283 17.4223 8.64975L11.1429 15.1707L8.57768 12.5069C7.94509 11.85 6.91205 11.85 6.27946 12.5069C5.64513 13.1638 5.64513 14.2366 6.27946 14.8935L9.99375 18.7506C10.6263 19.4076 11.6594 19.4076 12.292 18.7506L19.7205 11.0364Z" fill="#655DE6"/>
                  </svg>
                ) : (
                  <div className="w-[20px] h-[21.22px] border-[2.4px] border-[#785DEF] rounded-[2.4px] flex items-center justify-center">
                    <svg className="hidden" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-[19.2px] text-[#785DEF] font-['Microsoft_YaHei'] leading-[25px]">有攻击目标</span>
            </div>
          </div>
        </label>

        <label className="relative w-[225.6px] h-[48px] cursor-pointer">
          <input 
            type="checkbox" 
            className="hidden peer" 
            checked={isAdaptive}
            onChange={(e) => setIsAdaptive(e.target.checked)}
          />
          <div className="absolute inset-0 border-[1.6px] border-[#DADADA] rounded-[6.4px] peer-checked:bg-[#E2E6FF] peer-checked:border-none transition-all">
            <div className="absolute left-[23.2px] top-[11.2px] flex items-center gap-[9.6px]">
              <div className="w-[26px] h-[28px] flex items-center justify-center">
                {isAdaptive ? (
                  <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.2857 0.200195C24.3344 0.200195 26 1.92687 26 4.05734V23.3431C26 25.4705 24.3344 27.2002 22.2857 27.2002H3.71429C1.66272 27.2002 0 25.4705 0 23.3431V4.05734C0 1.92687 1.66272 0.200195 3.71429 0.200195H22.2857ZM19.7205 11.0364C20.3531 10.3794 20.3531 9.30667 19.7205 8.64975C19.0879 7.99283 18.0549 7.99283 17.4223 8.64975L11.1429 15.1707L8.57768 12.5069C7.94509 11.85 6.91205 11.85 6.27946 12.5069C5.64513 13.1638 5.64513 14.2366 6.27946 14.8935L9.99375 18.7506C10.6263 19.4076 11.6594 19.4076 12.292 18.7506L19.7205 11.0364Z" fill="#655DE6"/>
                  </svg>
                ) : (
                  <div className="w-[20px] h-[20.8px] border-[2.4px] border-[#785DEF] rounded-[2.4px] flex items-center justify-center">
                    <svg className="hidden" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-[19.2px] text-[#785DEF] font-['Microsoft_YaHei'] leading-[25px]">适应性攻击</span>
            </div>
          </div>
        </label>
      </div>

      {/* 下拉选项 */}
      <div className="flex flex-col gap-[8px] w-[470.4px] h-[81px]">
        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em] leading-[25px]">攻击类型</span>
        <div className="relative w-[470.4px] h-[48px]">
          <select 
            value={attackType}
            onChange={(e) => setAttackType(e.target.value)}
            className="absolute inset-0 border-[1.6px] border-[#DADADA] rounded-[6.4px] px-[18.4px] text-[19.2px] text-[#785DEF] font-['Microsoft_YaHei'] leading-[25px] focus:outline-none focus:ring-2 focus:ring-[#785DEF] focus:ring-opacity-50 appearance-none"
          >
            {attackTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="absolute right-[18.4px] top-[15.2px] w-[13.6px] h-[17.6px] pointer-events-none">
            <svg width="13.6" height="17.6" viewBox="0 0 13.6 17.6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7L6.8 12L11.6 7" stroke="#785DEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[5.6px] w-[470.4px] h-[78.6px]">
        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em] leading-[25px]">目标说话人</span>
        <div className="relative w-[470.4px] h-[48px]">
          <select 
            value={targetSpeaker}
            onChange={(e) => setTargetSpeaker(e.target.value)}
            className="absolute inset-0 border-[1.6px] border-[#DADADA] rounded-[6.4px] px-[17.6px] text-[19.2px] text-[#785DEF] font-['Microsoft_YaHei'] leading-[25px] focus:outline-none focus:ring-2 focus:ring-[#785DEF] focus:ring-opacity-50 appearance-none"
          >
            {targetSpeakers.map(speaker => (
              <option key={speaker} value={speaker}>{speaker}</option>
            ))}
          </select>
          <div className="absolute right-[17.6px] top-[15.2px] w-[13.6px] h-[17.6px] pointer-events-none">
            <svg width="13.6" height="17.6" viewBox="0 0 13.6 17.6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7L6.8 12L11.6 7" stroke="#785DEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[4px] w-[470.4px] h-[77px]">
        <span className="text-[19.2px] text-[#28264D] font-['Microsoft_YaHei'] tracking-[0.1em] leading-[25px]">ASV模型</span>
        <div className="relative w-[470.4px] h-[48px]">
          <select 
            value={asvModel}
            onChange={(e) => setAsvModel(e.target.value)}
            className="absolute inset-0 border-[1.6px] border-[#DADADA] rounded-[6.4px] px-[18.4px] text-[19.2px] text-[#785DEF] font-['Microsoft_YaHei'] leading-[25px] focus:outline-none focus:ring-2 focus:ring-[#785DEF] focus:ring-opacity-50 appearance-none"
          >
            {asvModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <div className="absolute right-[18.4px] top-[15.2px] w-[13.6px] h-[17.6px] pointer-events-none">
            <svg width="13.6" height="17.6" viewBox="0 0 13.6 17.6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 7L6.8 12L11.6 7" stroke="#785DEF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      {showGenerateButton && (
        <button
          onClick={handleGenerate}
          disabled={!audioFileId || isGenerating}  // 没上传音频或生成中无法点击
          className="w-full h-[60px] flex flex-row items-center justify-center 
          px-[73.6px] py-[12.8px] gap-[8px] bg-gradient-to-r from-[#B224EF] to-[#7579FF] text-white text-[19px] font-bold rounded-[8px] hover:opacity-90 transition-opacity tracking-[0.08em] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            buttonText
          )}
        </button>
      )}
    </div>
  );
} 