import './globals.css';

export const metadata = {
  title: 'Personal Dashboard',
  description: '개인 일정 & TODO 관리 대시보드',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="min-h-screen grid-pattern">
          {children}
        </div>
      </body>
    </html>
  );
}
