# دليل الاختبارات المحلية

## Local Testing Guide

هذا الدليل يشرح كيفية إجراء اختبارات الأمان والسرعة والتحميل محلياً على API الخاص بك.

This guide explains how to run security, performance, and load tests locally on your API.

## 📋 المتطلبات / Requirements

### 1. تثبيت الأدوات / Install Tools

```bash
npm install
```

الأدوات المثبتة:

- **autocannon**: لاختبارات الأداء والتحميل
- **artillery**: لاختبارات التحميل المتقدمة
- **clinic**: لتحليل الأداء

### 2. إعداد المتغيرات البيئية / Environment Setup

تأكد من وجود ملف `.env` مع المتغيرات التالية:

Make sure you have a `.env` file with the following variables:

```env
BASE_URL=http://localhost:3000
TEST_TOKEN=your_jwt_token_here
NODE_ENV=development
```

لإنشاء `TEST_TOKEN`:

1. سجل دخول عبر API
2. استخدم الـ token المُعاد في المتغير `TEST_TOKEN`

أو استخدم السكريبت المساعد:

```bash
node tests/helpers/getTestToken.js ali8@email.com Aa11112222
```

To create `TEST_TOKEN`:

1. Login through the API
2. Use the returned token in the `TEST_TOKEN` variable

Or use the helper script:

```bash
node tests/helpers/getTestToken.js your-email@example.com your-password
```

## 🚀 تشغيل الاختبارات / Running Tests

### اختبارات الأمان / Security Tests

```bash
npm run test:security
```

يختبر:

- ✅ CORS headers
- ✅ Security headers (XSS, Frame Options, etc.)
- ✅ Rate limiting
- ✅ SQL Injection protection
- ✅ XSS protection
- ✅ Authentication requirements
- ✅ Content-Type validation
- ✅ Request size limiting
- ✅ Sensitive data exposure

### اختبارات الأداء / Performance Tests

```bash
npm run test:performance
```

يقيس:

- ⚡ Response time (latency)
- 📊 Throughput (requests/second)
- ❌ Error rate
- 📈 Overall performance rating

### اختبارات التحميل / Load Tests

#### اختبار خفيف (Light Load)

```bash
npm run test:load:light
```

- 10 connections
- 30 seconds duration

#### اختبار متوسط (Medium Load)

```bash
npm run test:load:medium
```

- 50 connections
- 60 seconds duration

#### اختبار ثقيل (Heavy Load)

```bash
npm run test:load:heavy
```

- 100 connections
- 120 seconds duration

#### اختبار مخصص

```bash
npm run test:load
```

### تشغيل جميع الاختبارات / Run All Tests

```bash
npm run test:all
```

## 📊 استخدام Artillery (اختبارات متقدمة)

Artillery يوفر اختبارات تحميل أكثر تقدماً:

Artillery provides more advanced load testing:

```bash
# تشغيل اختبار Artillery
npx artillery run tests/artillery-config.yml

# مع تقرير HTML
npx artillery run --output report.json tests/artillery-config.yml
npx artillery report report.json
```

## 🔧 تخصيص الاختبارات / Customizing Tests

### تعديل إعدادات التحميل

عدّل ملف `tests/load/loadTest.js`:

Edit `tests/load/loadTest.js`:

```javascript
const testConfigs = {
  light: {
    connections: 10, // عدد الاتصالات المتزامنة
    pipelining: 1, // عدد الطلبات في كل اتصال
    duration: 30, // المدة بالثواني
  },
};
```

### إضافة endpoints جديدة

عدّل ملفات الاختبار لإضافة endpoints جديدة:

Edit test files to add new endpoints:

```javascript
const scenarios = [
  {
    name: 'New Endpoint',
    url: `${API_BASE}/new-endpoint`,
    method: 'GET',
    headers: { ... }
  }
];
```

## 📈 فهم النتائج / Understanding Results

### اختبارات الأمان

- ✅ **PASSED**: الاختبار نجح
- ❌ **FAILED**: يوجد مشكلة أمنية يجب إصلاحها
- ⚠️ **WARNINGS**: تحذيرات (مثل اختبارات تُجرى فقط في production)

### اختبارات الأداء

- 🟢 **Excellent**: أداء ممتاز
- 🟡 **Good**: أداء جيد
- 🟠 **Acceptable**: أداء مقبول
- 🔴 **Poor**: أداء ضعيف يحتاج تحسين

### اختبارات التحميل

- **Requests**: إجمالي الطلبات
- **Throughput**: معدل نقل البيانات (MB/s)
- **Latency**: زمن الاستجابة (ms)
  - Average: المتوسط
  - p99: 99% من الطلبات أسرع من هذا
  - p95: 95% من الطلبات أسرع من هذا
- **Status Codes**: توزيع أكواد الاستجابة
- **Errors**: عدد الأخطاء

## ⚠️ ملاحظات مهمة / Important Notes

1. **قبل التشغيل**: تأكد من تشغيل السيرفر

   ```bash
   npm run dev
   ```

2. **قاعدة البيانات**: تأكد من اتصال قاعدة البيانات بشكل صحيح

3. **البيئة**: الاختبارات تعمل على `localhost:3000` افتراضياً

4. **Rate Limiting**: قد تواجه rate limiting في الاختبارات الثقيلة، هذا طبيعي

5. **الموارد**: الاختبارات الثقيلة قد تستهلك موارد كبيرة من النظام

## 🐛 استكشاف الأخطاء / Troubleshooting

### خطأ: Connection refused

- تأكد من تشغيل السيرفر على المنفذ الصحيح

### خطأ: Authentication failed

- تأكد من صحة `TEST_TOKEN` في ملف `.env`

### خطأ: Module not found

- قم بتشغيل `npm install` مرة أخرى

## 📚 موارد إضافية / Additional Resources

- [Autocannon Documentation](https://github.com/mcollina/autocannon)
- [Artillery Documentation](https://www.artillery.io/docs)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
