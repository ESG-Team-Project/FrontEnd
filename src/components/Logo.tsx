import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LogoProps {
  width?: number;
  height?: number;
}

export default function Logo({ width = 40, height = 40 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto"
      aria-labelledby="logoTitle"
      role="img"
    >
      <title id="logoTitle">ESG 로고</title>
      {/* 배경 원 */}
      <circle cx="20" cy="20" r="19" fill="#10B981" />

      {/* 나뭇잎 모양 */}
      <path
        d="M20 8C20 8 24 12 24 16C24 20 20 24 20 24C20 24 16 20 16 16C16 12 20 8 20 8Z"
        fill="white"
      />
      <path
        d="M20 8C20 8 24 12 24 16C24 20 20 24 20 24C20 24 16 20 16 16C16 12 20 8 20 8Z"
        fill="white"
        transform="rotate(120 20 20)"
      />
      <path
        d="M20 8C20 8 24 12 24 16C24 20 20 24 20 24C20 24 16 20 16 16C16 12 20 8 20 8Z"
        fill="white"
        transform="rotate(240 20 20)"
      />

      {/* 중앙 원 */}
      <circle cx="20" cy="20" r="4" fill="#10B981" />

      {/* ESG 텍스트 */}
      <text
        x="20"
        y="32"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        ESG
      </text>
    </svg>
  );
}
