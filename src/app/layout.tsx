import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'X-Key · 사내 공용 계정 저장소',description:'팀의 계정과 접근 코드를 한곳에서 안전하고 간편하게 관리합니다.',robots:{index:false,follow:false}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>;}
