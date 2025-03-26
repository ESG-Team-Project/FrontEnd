import CompanyForm from "./company-form";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">회사 정보</h1>
        <hr className="mb-4 border-black" />
        <CompanyForm />
      </div>
    </div>
  );
}
