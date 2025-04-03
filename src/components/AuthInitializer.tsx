'use client';

import { useInitializeAuth } from '@/lib/atoms/auth';

/**
 * 앱 로드 시 인증 상태 초기화 로직을 실행하는 컴포넌트.
 * Jotai Provider 하위에 렌더링되어야 합니다.
 */
function AuthInitializer() {
  useInitializeAuth();
  // 이 컴포넌트는 UI를 렌더링하지 않습니다.
  return null;
}

export default AuthInitializer; 