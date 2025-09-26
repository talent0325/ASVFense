'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HomeIcon, IntroIcon, AttackIcon, DefenseIcon, SpeakerIcon } from './icons';

export default function Navigation() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'home', label: '首页', icon: HomeIcon, href: '/' },
    { id: 'intro', label: '技术简介', icon: IntroIcon, href: '/introduction' },
    { id: 'attack', label: '对抗攻击生成', icon: AttackIcon, href: '/attack' },
    { id: 'defense', label: '可插拔防御演示', icon: DefenseIcon, href: '/defense' },
    { id: 'speaker', label: '说话人管理', icon: SpeakerIcon, href: '/speaker' },
  ];

  return (
    <div className="fixed left-0 top-0 w-[288px] h-screen bg-[#EAEFFF]">
      <div className="flex items-center p-[28px] gap-4 h-[96px]">
        <Image 
          src="/images/logo.png" 
          alt="VoiceFort Logo" 
          width={32} 
          height={32}
          
        />
        <h1 className="text-[30px] font-bold tracking-wider bg-gradient-to-r from-[#B224EF] to-[#7579FF] bg-clip-text text-transparent">
          Voice Fort
        </h1>
      </div>

      <div className="flex flex-col gap-4 p-[24px]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-[21px] py-[11px] rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg ${
                isActive
                  ? 'bg-gradient-to-r from-[#B224EF] to-[#7579FF] text-white shadow-lg'
                  : 'bg-white text-[#28264D] hover:bg-[#F5F7FF]'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon />
              </div>
              <span className="text-[19px] tracking-wider leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 