import { Link } from 'react-router-dom';

export default function NotFoundPage({ title = 'الصفحة غير موجودة', text = 'الرابط الذي فتحته غير صحيح أو تم نقله.' }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-3 text-muted">{text}</p>
      <Link to="/cases" className="btn btn-primary mt-8">تصفح الحالات</Link>
    </div>
  );
}
