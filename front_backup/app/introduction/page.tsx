'use client';

import React from 'react';
import Image from 'next/image';

export default function IntroductionPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background2.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 p-8">
        {/* 模块1：创新解决思路 */}
        <section className="max-w-7xl mx-auto mb-16">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-lg/20 border-2 border-white/30">
            <h2 className="text-3xl font-bold text-[#655DE6] mb-6">
              我们的创新解决思路
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DE6] flex items-center justify-center text-white font-bold">1</div>
                  <p className="text-lg text-[#28264D]">
                    创新提出"AFPM"对抗防御框架，有效提升应对各类对抗性攻击的防御鲁棒性
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DE6] flex items-center justify-center text-white font-bold">2</div>
                  <p className="text-lg text-[#28264D]">
                    创新结合"滤波+"生成机制、U-Net网络，实现音频的高质量还原与"即插即用"特性
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DE6] flex items-center justify-center text-white font-bold">3</div>
                  <p className="text-lg text-[#28264D]">
                    创新引入F-ratio 统计方法，实现不同频段的适应性屏蔽策略，增强系统通用性
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#655DE6] flex items-center justify-center text-white font-bold">4</div>
                  <p className="text-lg text-[#28264D]">
                    创新提出PAP-AFPM 方案，通过均匀噪声模拟l∞范数对抗扰动，实现负面增强效应消除
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/innovation-framework.png"
                  alt="创新框架示意图"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* 模块2：AFPM创新框架 */}
        <section className="max-w-7xl mx-auto mb-16">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-lg/20 border-2 border-white/30">
            <h2 className="text-3xl font-bold text-[#655DE6] mb-6">
              AFPM创新框架
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/10 p-6 rounded-xl border-2 border-white/30">
                  <h3 className="text-xl font-semibold text-[#655DE6] mb-4">F-ratio 统计方法</h3>
                  <p className="text-[#28264D]">
                    基于不同说话人间方差（类间方差）与同一说话人内部方差（类内方差），进一步量化各个频段对于说话人的分类
                  </p>
                </div>
                <div className="backdrop-blur-xl bg-white/10 p-6 rounded-xl border-2 border-white/30">
                  <h3 className="text-xl font-semibold text-[#655DE6] mb-4">自适应阈值计算</h3>
                  <p className="text-[#28264D]">
                    基于不同频段特性和对抗噪声动态调整，实现更为精准地掩蔽受噪声影响最大非鲁棒特征，同时进一步降低分类器分类性能损耗，增强防御灵活性
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/afpm-framework.png"
                  alt="AFPM框架示意图"
                  fill
                  className="object-contain mix-blend-multiply"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* 模块3：U-Net恢复创新技术 */}
        <section className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-lg/20 border-2 border-white/30">
            <h2 className="text-3xl font-bold text-[#655DE6] mb-6">
              U-Net恢复创新技术
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="backdrop-blur-xl bg-white/10 p-6 rounded-xl border-2 border-white/30">
                  <h3 className="text-xl font-semibold text-[#655DE6] mb-4">谱收敛损失优化</h3>
                  <p className="text-[#28264D]">
                    基于原始U-Net网络特征提取与恢复机制，修改其损失函数为谱收敛损失，计算预测谱图与真实谱图之间差的 Frobenius 范数，关注频谱图整体结构差异，最小化该损失可让模型更好地保留真实语音的频谱特征
                  </p>
                </div>
                <div className="backdrop-blur-xl bg-white/10 p-6 rounded-xl border-2 border-white/30">
                  <h3 className="text-xl font-semibold text-[#655DE6] mb-4">系统优化与性能提升</h3>
                  <p className="text-[#28264D]">
                    结合AFPM架构，避免对后端语音认证系统微调，降低系统接入门槛，提高系统通用性、易用性。针对AFPM遮蔽过多信息导致恢复后语谱图质量不佳的问题，U-Net网络结合F-ratio构建加权重构损失，确保即插即用语音认证性能水平，有效优化音频样本质量，保障说话人识别系统的准确性
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/unet-recovery.png"
                  alt="U-Net恢复技术示意图"
                  fill
                  className="object-contain mix-blend-multiply"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 