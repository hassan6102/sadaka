import { MessageCircle, Phone } from 'lucide-react';
import { telHref, whatsappHref } from '../../lib/format';

export default function ContactButtons({ contact, caseItem }) {
  const message = `السلام عليكم، أود الاستفسار عن الحالة رقم ${caseItem.code}: ${caseItem.title}`;
  return (
    <div>
      {contact.name && <p className="mb-3 text-sm"><span className="text-muted">المسؤول عن الحالة: </span>{contact.name}</p>}
      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
        {contact.phone && (
          <a href={telHref(contact.phone)} className="btn btn-outline flex-1">
            <Phone className="h-4 w-4" aria-hidden="true" />
            اتصال هاتفي
            <span dir="ltr" className="text-xs text-muted">{contact.phone}</span>
          </a>
        )}
        {contact.whatsapp && (
          <a
            href={whatsappHref(contact.whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex-1"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            تواصل عبر واتساب
          </a>
        )}
      </div>
    </div>
  );
}
