import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send, Twitter, Youtube } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { telHref, whatsappHref } from '../../lib/format';

export default function Footer() {
  const { settings: s } = useSettings();
  const socials = [
    { href: s.facebook, label: 'فيسبوك', Icon: Facebook },
    { href: s.instagram, label: 'إنستجرام', Icon: Instagram },
    { href: s.x, label: 'إكس', Icon: Twitter },
    { href: s.youtube, label: 'يوتيوب', Icon: Youtube },
    { href: s.telegram, label: 'تيليجرام', Icon: Send },
  ].filter((x) => x.href);

  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-lg">{s.siteName}</h2>
          {s.footerText && <p className="mt-2 text-sm text-muted">{s.footerText}</p>}
        </div>

        <div className="space-y-2 text-sm">
          <h3 className="mb-2 text-base">تواصل معنا</h3>
          {s.phone && (
            <a href={telHref(s.phone)} className="flex items-center gap-2 text-muted hover:text-brand">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">{s.phone}</span>
            </a>
          )}
          {s.whatsapp && (
            <a
              href={whatsappHref(s.whatsapp, 'السلام عليكم')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted hover:text-brand"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">{s.whatsapp}</span>
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-muted hover:text-brand">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">{s.email}</span>
            </a>
          )}
          {s.address && (
            <p className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {s.address}
            </p>
          )}
          {!s.phone && !s.whatsapp && !s.email && !s.address && <p className="text-muted">لم تُضف بيانات تواصل بعد.</p>}
        </div>

        <div>
          <h3 className="mb-2 text-base">روابط</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link to="/" className="hover:text-brand">الرئيسية</Link></li>
            <li><Link to="/cases" className="hover:text-brand">جميع الحالات</Link></li>
          </ul>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="icon-btn">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {s.siteName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
