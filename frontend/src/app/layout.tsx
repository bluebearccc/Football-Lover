import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoalPredict Live — Football-Lover',
  description: 'Dự đoán bóng đá theo tiêu chí, gold theo trận và bảng xếp hạng theo tháng.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
