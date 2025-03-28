'use client';
import AccountForm from './account-form';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg p-6 mx-auto">
        <h1 className="mb-4 text-4xl font-bold">담당자 정보</h1>
        <hr className="mb-4 border-black" />
        <AccountForm />
      </div>
    </div>
  );
}
