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
          src="/background2.png"
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
            <h2 className="w-[216px] h-[55px] font-['Microsoft_YaHei'] font-bold text-[42px] leading-[55px] text-[#655DE6]">
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
            <Link href="/attack" className="group relative">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 shadow-lg/20 hover:shadow-xl/20 transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-white/30">
                <div className="text-2xl font-semibold text-[#655DE6] mb-4">对抗攻击生成</div>
                <p className="text-[#28264D]">模拟攻击样本创建，测试系统防御能力</p>
              </div>
            </Link>

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
    </div>
  );
} 