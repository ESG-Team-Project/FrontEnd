import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import NaviBar from '@/components/NaviBar';

const pretendard = localFont({
  src: [
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Green Dynamics',
  description: 'Green Dynamics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="overflow-x-hidden">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={`${pretendard.variable} antialiased font-pretendard overflow-x-hidden w-full min-h-screen`}
        style={{ overflowX: 'hidden', maxWidth: '100vw' }}
      >
        <div className="flex flex-col w-full min-h-full overflow-hidden">
          <NaviBar />
          <main className="w-full pt-16 overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
