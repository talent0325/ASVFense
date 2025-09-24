'use client';

import { useState, useEffect } from 'react';

interface AttackFormContentProps {
  showGenerateButton?: boolean;
  onGenerate?: () => void;
  buttonText?: string;
  isButtonDisabled?: boolean;
  onAttackInfoChange?: (info: {
    isAdaptive: boolean;
    attackType: string;
    targetSpeaker: string;
    asvModel: string;
  }) => void;
}

export default function AttackFormContent({ 
  showGenerateButton = true, 
  onGenerate,
  buttonText = '攻击音频生成',
  isButtonDisabled = false,
  onAttackInfoChange
}: AttackFormContentProps) {
  const [hasTarget, setHasTarget] = useState(false);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [attackType, setAttackType] = useState('fgsm');
  const [targetSpeaker, setTargetSpeaker] = useState('speaker1');
  const [asvModel, setAsvModel] = useState('1d_cnn');

  // 当攻击信息变化时通知父组件
  useEffect(() => {
    if (onAttackInfoChange) {
      onAttackInfoChange({
        isAdaptive,
        attackType,
        targetSpeaker,
        asvModel
      });
    }
  }, [isAdaptive, attackType, targetSpeaker, asvModel, onAttackInfoChange]);

  return (
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
            <option value="fgsm">FGSM−l∞</option>
            <option value="pgd">PGD−l∞</option>
            <option value="cw_l2">CW−l2</option>
            <option value="cw_linf">CW−l∞</option>
            <option value="deepfool">DeepFool−l2</option>
            <option value="fakebob">FAKEBOB</option>
            <option value="kenansville">Kenansville</option>
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
            <option value="speaker_a">Speaker_A</option>
            <option value="speaker_b">Speaker_B</option>
            <option value="speaker_c">Speaker_C</option>
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
            <option value="1d_cnn">1D-CNN</option>
            <option value="ecapa_tdnn">ECAPA-TDNN</option>
            <option value="xvector_plda">x-Vector+PLDA</option>
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
          className={`w-[470.2px] h-[50.6px] flex flex-row items-center justify-center px-[173.6px] py-[12.8px] gap-[8px] bg-gradient-to-r from-[#B224EF] to-[#7579FF] rounded-[8px] text-white text-[19.2px] font-bold tracking-[0.08em] leading-[25px] font-['Microsoft_YaHei'] whitespace-nowrap ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          onClick={onGenerate}
          disabled={isButtonDisabled}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
} 