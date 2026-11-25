# موقع عرض الحالات الإنسانية والتبرعات

موقع عربي (RTL) يعرض الحالات الإنسانية مع لوحة تحكم للإدارة.
التقنية: React + Vite + React Router + Tailwind CSS + Firebase (Authentication, Firestore, Hosting).
**لا توجد بوابة دفع ولا رفع صور**: التبرع يتم خارج الموقع، والموقع يعرض البيانات فقط.

> ⚠️ هذا المشروع كُتب في بيئة بدون اتصال بالإنترنت، فلم يُبنَ (build) ولم يُجرَّب على Firebase فعليًا. راجع `REPORT.md` لمعرفة ما اختُبر وما لم يُختبر، وابدأ بخطوات "التشغيل المحلي" ثم "الاختبار اليدوي" أدناه.

## المتطلبات
- Node.js 18 أو أحدث
- حساب Firebase، و Firebase CLI: `npm i -g firebase-tools`

## 1) إعداد Firebase
1. أنشئ مشروعًا في [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → فعّل **Email/Password** (ولا تفعّل أي طريقة أخرى).
3. **Firestore Database** → أنشئ قاعدة بيانات (Production mode).
4. **Project settings → Your apps → Web app** → انسخ إعدادات التطبيق.
5. انسخ `.env.example` إلى `.env.local` واملأ القيم.
6. عدّل `.firebaserc` وضع معرّف مشروعك بدل `YOUR_FIREBASE_PROJECT_ID`.

## 2) التشغيل المحلي
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # يُنتج مجلد dist
```

## 3) نشر القواعد والموقع
```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes   # انشر القواعد أولًا
npm run build
firebase deploy --only hosting
```
**لا تستخدم الموقع قبل نشر القواعد.** الحماية الفعلية موجودة في `firestore.rules` وليست في كود الواجهة.

## 4) إنشاء أول حساب مسؤول وتأمينه
المسؤول = مستخدم Firebase Auth **ولديه مستند** في `admins/{uid}`. لا يمكن إنشاء هذا المستند من الموقع (القواعد تمنع ذلك)، فلا يستطيع أحد ترقية نفسه.

1. Console → Authentication → Users → **Add user** (بريد + كلمة مرور قوية وفريدة).
2. انسخ **User UID** للمستخدم.
3. Firestore → أنشئ collection اسمها `admins` → مستند **معرّفه = الـ UID** بحقل واحد، مثلًا `email` (string).
4. افتح `/admin/login` وسجّل الدخول.

التأمين:
- استخدم كلمة مرور طويلة (16 حرفًا فأكثر) وفعّل التحقق الثنائي على حساب Google المالك للمشروع.
- لا تفعّل التسجيل الذاتي. التسجيل من الواجهة غير موجود أصلًا، لكن تأكد أن Email/Password هو الوحيد المفعّل، ولا تنشئ مستخدمين إلا بنفسك.
- أضف مسؤولًا جديدًا = مستخدم + مستند `admins`. إزالة مسؤول = احذف مستند `admins` (ثم احذف المستخدم).
- في Authentication → Settings → Authorized domains: أبقِ نطاقك فقط.
- يُفضَّل تقييد مفتاح API من Google Cloud Console → Credentials على نطاق موقعك (HTTP referrers).

## 5) أول استخدام
1. **الإعدادات**: احفظ اسم الموقع والوصف وبيانات التواصل (ينشئ مستند `site_settings/main`).
2. **وسائل التبرع**: أضف الوسائل وفعّل "عامة" لما يظهر في الصفحة الرئيسية.
3. **الحالات**: أضف حالة. الكود (`HC-XXXXXX`) يُنشأ تلقائيًا وفريدًا.

## هيكل البيانات
| Collection | المحتوى |
|---|---|
| `cases/{code}` | الحالة. معرّف المستند هو كود الحالة (يضمن التفرّد). الحقول: title, type, summary, details, requiredAmount, collectedAmount, showCollected, visibility (`published`/`hidden`/`paused`), fundingStatus (`needs_support`/`completed`), featured, sortOrder, includeGeneralMethods, methodIds, createdAt, updatedAt |
| `case_contacts/{code}` | بيانات التواصل (name, phone, whatsapp, show). **منفصلة عن الحالة عمدًا** حتى لا تُقرأ عبر الـ API إلا إذا `show == true` والحالة منشورة |
| `donation_methods/{id}` | name, type, value, accountHolder, instructions, isGeneral, active |
| `site_settings/main` | إعدادات الموقع |
| `admins/{uid}` | المسؤولون (تُنشأ يدويًا) |

> أضفنا `case_contacts` على الهيكل المقترح لأنها الطريقة الوحيدة لجعل بيانات التواصل غير قابلة للقراءة فعليًا عند عدم السماح بعرضها.

## كيف تعمل الصلاحيات
- الزائر: يقرأ الحالات `published` فقط، ووسائل التبرع `active` فقط، وبيانات التواصل المسموح بها فقط، وإعدادات الموقع. لا يكتب شيئًا.
- المسؤول: قراءة وكتابة كاملة مع تحقق من شكل البيانات (حقول مسموحة فقط، أنواع، أطوال، قيم enum، روابط https فقط).
- لا توجد قاعدة `if true` للكتابة في أي مكان.

## اختبار القواعد (يتطلب Java + Firebase Emulator)
```bash
npm run test:rules
```

## ملاحظات أداء وحدود
- الموقع العام يجلب الحالات المنشورة مرة واحدة ويخزنها مؤقتًا (دقيقتان) ثم يبحث ويفلتر ويقسّم الصفحات في المتصفح. هذا مناسب لمئات الحالات؛ عند وصولك لآلاف الحالات يلزم ترقيم من جهة الخادم.
- وسائل التبرع المفعّلة قابلة للقراءة العامة (لأنها معلنة أصلًا)، حتى لو كانت مرتبطة بحالة غير منشورة.
- الخطوط (Cairo/Tajawal) تُحمَّل من Google Fonts.
