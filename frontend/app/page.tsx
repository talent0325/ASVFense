'use client';
// 告诉 Next.js 这是一个 客户端组件，能用 useState、useEffect 这样的 React Hook
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() { //导出的默认页面组件，访问 / 时会渲染它
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });  // 记录鼠标的 x/y 坐标
  const [scrollPosition, setScrollPosition] = useState(0);  //记录页面滚动高度

  // 事件监听
  useEffect(() => {  // 页面可以根据鼠标或滚动位置做动画效果
    const handleMouseMove = (e: MouseEvent) => {  // 更新鼠标坐标
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {  // 更新滚动高度
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {  // return 里移除事件 → 避免内存泄漏
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div className="fixed inset-0 -z-10">  {/*背景固定覆盖全屏*/}
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover"  // 图片等比缩放铺满
          priority
        />
      </div>

      {/* Header Section */}
      <header className="relative z-10">
        <div
          className="w-[806px] h-[193px] flex flex-col gap-[13px] ml-[30px] mt-[211px] transition-all duration-500"
          style={{
            transform: `translateY(${Math.max(0, scrollPosition * 0.5)}px)`,
            opacity: Math.max(0, 1 - scrollPosition * 0.002)
          }}
        >
          {/* 标题行 */}
          <div className="flex flex-row items-end gap-[20px] w-[459px] h-[74px]">
            <h1 className="w-[224px] h-[74px] font-['Microsoft_YaHei'] font-bold text-[56px] leading-[74px] bg-gradient-to-r from-[#B224EF] to-[#7579FF] text-transparent bg-clip-text whitespace-nowrap">
              智御声纹
            </h1>
            {/* <h2 className="w-[250px] h-[55px] font-['Microsoft_YaHei'] font-bold text-[42px] leading-[55px] text-[#655DE6]">
              ASV安全卫士
            </h2> */}
            <h2 className="w-[300px] h-[55px] font-['Microsoft_YaHei'] font-bold text-[35px] leading-[55px] text-[#655DE6]">
              ASV安全卫士
            </h2>

          </div>

          {/* 中文标语 */}
          <p className="w-full h-[59px] font-['Microsoft_YaHei'] font-normal text-[45px] leading-[59px] text-black">
            即插即护，秒级加固说话人识别系统
          </p>

          {/* 英文标语 */}
          <p className="w-full h-[33px] font-['Microsoft_YaHei'] font-bold text-[25px] leading-[34px] text-[#7C75E9]">
            Plug & Protect: Secure Your Speaker Recognition in Seconds.
          </p>
        </div>
      </header>

      {/* Core Features Section */}
      <section className="relative z-10 py-16 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold mb-8 relative text-left text-[#655DE6]"
          >
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            {/* <Link href="/attack" className="group relative">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-white/30">
                <div className="text-2xl font-semibold text-[#655DE6] mb-4">对抗攻击生成</div>
                <p className="text-[#28264D]">模拟攻击样本创建，测试系统防御能力</p>
              </div>
            </Link> */}
            {/* 保留可点击效果但不跳转 */}
            <div 
              className="group relative cursor-pointer"
              onClick={() => {
                // 可以在这里添加点击事件处理
                console.log('点击了对抗攻击生成');
              }}
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-white/30">
                <div className="text-2xl font-semibold text-[#655DE6] mb-4">对抗攻击生成</div>
                <p className="text-[#28264D]">模拟攻击样本创建，测试系统防御能力</p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <Link href="/defense" className="group relative">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-white/30">
                <div className="text-2xl font-semibold text-[#655DE6] mb-4">可插拔防御演示</div>
                <p className="text-[#28264D]">实时体验防御效果，直观展示防护能力</p>
              </div>
            </Link>

            {/* Feature Card 3 */}
            <Link href="/speaker" className="group relative">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-white/30">
                <div className="text-2xl font-semibold text-[#655DE6] mb-4">说话人管理</div>
                <p className="text-[#28264D]">管理声纹数据库，维护用户信息</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold mb-8 relative text-left text-[#655DE6]"
          >
            应用场景
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/30">
              <h3 className="text-xl font-semibold text-[#655DE6] mb-4">电话诈骗防御</h3>
              <p className="text-[#28264D]">有效识别和拦截语音诈骗，保护用户财产安全</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/30">
              <h3 className="text-xl font-semibold text-[#655DE6] mb-4">声纹锁保护</h3>
              <p className="text-[#28264D]">增强声纹识别系统的安全性，防止未授权访问</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/30">
              <h3 className="text-xl font-semibold text-[#655DE6] mb-4">会议系统安全</h3>
              <p className="text-[#28264D]">确保会议参与者的身份真实性，防止会议入侵</p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-0 -z-10">
        <Image
          src="/background.png"
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