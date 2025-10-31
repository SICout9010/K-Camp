# PocketBase Schema for K-CAMP

> **Backend**: PocketBase (Auth, Database, Realtime)  
> **Version**: 1.0  
> **Last Updated**: October 24, 2025

## Overview

This document defines the PocketBase database schema for the K-CAMP platform. The schema is designed to support camp creation, registration management, and user authentication for KMITL university events.

---

## Collections

### 1. **users** (Auth Collection - Extended)

Extended PocketBase auth collection with custom fields for K-CAMP users.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | PocketBase auto-generated ID |
| `email` | email | ✅ | unique | User email address |
| `emailVisibility` | bool | ❌ | default: false | Email visibility setting |
| `username` | text | ✅ | unique, 3-150 chars | Username |
| `verified` | bool | ❌ | default: false | Email verification status |
| `name` | text | ✅ | | Full name (Thai/English) |
| `avatar` | file | ❌ | single, max 5MB | Profile picture |
| `role` | select | ✅ | default: "student" | User role |
| `faculty` | relation | ❌ | faculties | Faculty affiliation |
| `department` | text | ❌ | | Department name |
| `phone` | text | ❌ | pattern: Thai phone | Phone number (10 digits) |
| `student_id` | text | ❌ | | Student ID (for students) |
| `organization` | text | ❌ | | Organization/School name |
| `bio` | text | ❌ | max 500 chars | User biography |
| `created` | date | ✅ | auto | Account creation date |
| `updated` | date | ✅ | auto | Last update date |

**Role Options:**
- `student` - Students who register for camps
- `organizer` - Event organizers who create camps
- `admin` - Platform administrators

**Indexes:**
- `email` (unique)
- `username` (unique)
- `role`
- `faculty`

**API Rules:**
- **List**: `@request.auth.id != ""`
- **View**: `@request.auth.id != ""`
- **Create**: Public registration allowed
- **Update**: `@request.auth.id = id || @request.auth.role = "admin"`
- **Delete**: `@request.auth.id = id || @request.auth.role = "admin"`

---

### 2. **faculties** (Base Collection)

Reference data for KMITL faculties.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `name_th` | text | ✅ | | Faculty name in Thai |
| `name_en` | text | ✅ | | Faculty name in English |
| `code` | text | ✅ | unique | Faculty code (e.g., "ENG", "SCI") |
| `color` | text | ❌ | | Brand color (hex code) |
| `logo` | file | ❌ | single, max 2MB | Faculty logo |
| `description` | text | ❌ | | Brief description |
| `created` | date | ✅ | auto | Creation date |

**Example Data:**
```json
[
  { "code": "ENG", "name_th": "วิศวกรรมศาสตร์", "name_en": "Engineering", "color": "#FF6B35" },
  { "code": "SCI", "name_th": "วิทยาศาสตร์", "name_en": "Science", "color": "#4ECDC4" },
  { "code": "IT", "name_th": "เทคโนโลยีสารสนเทศ", "name_en": "Information Technology", "color": "#F38181" },
  { "code": "ARCH", "name_th": "สถาปัตยกรรมศาสตร์", "name_en": "Architecture", "color": "#95E1D3" },
  { "code": "AGRO", "name_th": "อุตสาหกรรมเกษตร", "name_en": "Agro-Industry", "color": "#38A3A5" }
]
```

**API Rules:**
- **List**: Public (no auth required)
- **View**: Public
- **Create**: `@request.auth.role = "admin"`
- **Update**: `@request.auth.role = "admin"`
- **Delete**: `@request.auth.role = "admin"`

---

### 3. **camps** (Base Collection)

Main collection for camp/event information.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `title` | text | ✅ | 5-200 chars | Camp title |
| `slug` | text | ✅ | unique | URL-friendly slug |
| `description` | editor | ✅ | | Full camp description (rich text) |
| `short_description` | text | ✅ | max 300 chars | Brief summary |
| `banner` | file | ❌ | single, max 5MB | Main banner image |
| `gallery` | file | ❌ | multiple, max 10 files | Additional images |
| `organizer` | relation | ✅ | users (single) | Camp organizer user |
| `faculty` | relation | ✅ | faculties (single) | Organizing faculty |
| `department` | text | ❌ | | Organizing department |
| `category` | select | ✅ | | Camp category |
| `target_audience` | select | ✅ | multiple | Target audience |
| `location` | text | ✅ | | Camp location |
| `location_detail` | text | ❌ | | Detailed location info |
| `start_date` | date | ✅ | | Camp start date |
| `end_date` | date | ✅ | | Camp end date |
| `registration_start` | date | ✅ | | Registration opening date |
| `registration_end` | date | ✅ | | Registration deadline |
| `min_participants` | number | ❌ | min: 1 | Minimum participants |
| `max_participants` | number | ✅ | min: 1 | Maximum participants |
| `current_participants` | number | ❌ | default: 0 | Current registration count |
| `status` | select | ✅ | default: "draft" | Camp status |
| `visibility` | select | ✅ | default: "public" | Visibility setting |
| `registration_fee` | number | ❌ | default: 0 | Registration fee (Baht) |
| `contact_email` | email | ✅ | | Contact email |
| `contact_phone` | text | ❌ | | Contact phone number |
| `contact_line` | text | ❌ | | LINE ID |
| `website` | url | ❌ | | External website |
| `facebook` | url | ❌ | | Facebook page |
| `instagram` | text | ❌ | | Instagram handle |
| `tags` | text | ❌ | multiple | Search tags |
| `requirements` | editor | ❌ | | Participant requirements |
| `benefits` | editor | ❌ | | Benefits for participants |
| `schedule` | json | ❌ | | Camp schedule (JSON) |
| `views` | number | ❌ | default: 0 | Page view count |
| `featured` | bool | ❌ | default: false | Featured on homepage |
| `created` | date | ✅ | auto | Creation date |
| `updated` | date | ✅ | auto | Last update date |

**Category Options:**
- `academic` - ค่ายวิชาการ
- `skills` - ค่ายพัฒนาทักษะ
- `competition` - ค่ายแข่งขัน
- `volunteer` - ค่ายจิตอาสา
- `cultural` - ค่ายวัฒนธรรม
- `sports` - ค่ายกีฬา
- `technology` - ค่ายเทคโนโลยี
- `leadership` - ค่ายผู้นำ
- `other` - อื่นๆ

**Target Audience Options:**
- `high_school` - นักเรียนมัธยมปลาย
- `undergraduate` - นิสิตปริญญาตรี
- `all_students` - นักเรียน/นิสิตทั่วไป

**Status Options:**
- `draft` - Draft (not visible)
- `published` - Published (accepting registrations)
- `full` - Registration full
- `closed` - Registration closed
- `cancelled` - Cancelled
- `completed` - Event completed

**Visibility Options:**
- `public` - Public (visible to all)
- `unlisted` - Unlisted (only via direct link)
- `private` - Private (invite only)

**Indexes:**
- `slug` (unique)
- `organizer`
- `faculty`
- `status`
- `category`
- `start_date`
- `registration_end`

**API Rules:**
- **List**: `status = "published" || (@request.auth.id != "" && organizer = @request.auth.id)`
- **View**: `status = "published" || organizer = @request.auth.id`
- **Create**: `@request.auth.id != "" && @request.auth.role != "student"`
- **Update**: `organizer = @request.auth.id || @request.auth.role = "admin"`
- **Delete**: `organizer = @request.auth.id || @request.auth.role = "admin"`

---

### 4. **registration_forms** (Base Collection)

Form templates for camp registrations.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `camp` | relation | ✅ | camps (single) | Related camp |
| `title` | text | ✅ | | Form title |
| `description` | text | ❌ | | Form description |
| `fields` | json | ✅ | | Form fields configuration |
| `settings` | json | ❌ | | Form settings |
| `created` | date | ✅ | auto | Creation date |
| `updated` | date | ✅ | auto | Last update date |

**Fields JSON Structure:**
```json
{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "label": "ชื่อ-นามสกุล",
      "placeholder": "กรอกชื่อ-นามสกุล",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "id": "field_2",
      "type": "email",
      "label": "อีเมล",
      "required": true
    },
    {
      "id": "field_3",
      "type": "phone",
      "label": "เบอร์โทรศัพท์",
      "required": true,
      "validation": {
        "pattern": "^[0-9]{10}$"
      }
    },
    {
      "id": "field_4",
      "type": "select",
      "label": "ชั้นปีที่กำลังศึกษา",
      "required": true,
      "options": [
        { "value": "m4", "label": "ม.4" },
        { "value": "m5", "label": "ม.5" },
        { "value": "m6", "label": "ม.6" }
      ]
    },
    {
      "id": "field_5",
      "type": "radio",
      "label": "เพศ",
      "required": true,
      "options": [
        { "value": "male", "label": "ชาย" },
        { "value": "female", "label": "หญิง" },
        { "value": "other", "label": "อื่นๆ" }
      ]
    },
    {
      "id": "field_6",
      "type": "checkbox",
      "label": "ทักษะที่สนใจ",
      "required": false,
      "options": [
        { "value": "programming", "label": "การเขียนโปรแกรม" },
        { "value": "design", "label": "การออกแบบ" },
        { "value": "marketing", "label": "การตลาด" }
      ]
    },
    {
      "id": "field_7",
      "type": "textarea",
      "label": "เหตุผลที่สมัคร",
      "required": true,
      "validation": {
        "minLength": 50,
        "maxLength": 500
      }
    },
    {
      "id": "field_8",
      "type": "file",
      "label": "อัพโหลดสำเนาบัตรประชาชน",
      "required": true,
      "accept": "image/*,.pdf",
      "maxSize": 5242880
    }
  ]
}
```

**Field Types:**
- `text` - Single line text
- `textarea` - Multi-line text
- `email` - Email address
- `phone` - Phone number
- `number` - Number input
- `date` - Date picker
- `select` - Dropdown selection
- `radio` - Radio buttons
- `checkbox` - Multiple checkboxes
- `file` - File upload

**API Rules:**
- **List**: `@request.auth.id != ""`
- **View**: Public (for registration page)
- **Create**: `@request.auth.id != "" && camp.organizer = @request.auth.id`
- **Update**: `camp.organizer = @request.auth.id`
- **Delete**: `camp.organizer = @request.auth.id`

---

### 5. **registrations** (Base Collection)

Student registrations for camps.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `camp` | relation | ✅ | camps (single) | Related camp |
| `user` | relation | ❌ | users (single) | Registered user (if logged in) |
| `form_data` | json | ✅ | | Submitted form data |
| `files` | file | ❌ | multiple, max 20MB | Uploaded files |
| `status` | select | ✅ | default: "pending" | Application status |
| `payment_status` | select | ❌ | default: "unpaid" | Payment status |
| `payment_slip` | file | ❌ | single, max 5MB | Payment slip image |
| `payment_verified_at` | date | ❌ | | Payment verification date |
| `notes` | text | ❌ | | Organizer notes |
| `rating` | number | ❌ | min: 1, max: 5 | Post-event rating |
| `feedback` | text | ❌ | | Post-event feedback |
| `submitted_at` | date | ✅ | auto | Submission date |
| `reviewed_at` | date | ❌ | | Review date |
| `reviewed_by` | relation | ❌ | users (single) | Reviewer |
| `created` | date | ✅ | auto | Creation date |
| `updated` | date | ✅ | auto | Last update date |

**Status Options:**
- `pending` - รอการตรวจสอบ
- `reviewing` - กำลังตรวจสอบ
- `accepted` - ผ่านการคัดเลือก
- `waitlist` - รายชื่อสำรอง
- `rejected` - ไม่ผ่านการคัดเลือก
- `cancelled` - ยกเลิกการสมัคร

**Payment Status Options:**
- `unpaid` - ยังไม่ชำระ
- `pending` - รอตรวจสอบ
- `paid` - ชำระแล้ว
- `refunded` - คืนเงินแล้ว

**Form Data JSON Structure:**
```json
{
  "field_1": "สมชาย ใจดี",
  "field_2": "somchai@example.com",
  "field_3": "0812345678",
  "field_4": "m6",
  "field_5": "male",
  "field_6": ["programming", "design"],
  "field_7": "ผมสนใจเข้าร่วมค่ายเพราะ...",
  "field_8": "file_id_from_pocketbase"
}
```

**Indexes:**
- `camp`
- `user`
- `status`
- `submitted_at`

**API Rules:**
- **List**: `camp.organizer = @request.auth.id || user = @request.auth.id || @request.auth.role = "admin"`
- **View**: `camp.organizer = @request.auth.id || user = @request.auth.id || @request.auth.role = "admin"`
- **Create**: Public (allow guest registration) or `@request.auth.id != ""`
- **Update**: `camp.organizer = @request.auth.id || @request.auth.role = "admin"`
- **Delete**: `user = @request.auth.id || camp.organizer = @request.auth.id || @request.auth.role = "admin"`

---

### 6. **notifications** (Base Collection)

In-app notifications for users.

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `user` | relation | ✅ | users (single) | Target user |
| `title` | text | ✅ | | Notification title |
| `message` | text | ✅ | | Notification message |
| `type` | select | ✅ | | Notification type |
| `link` | text | ❌ | | Related link/URL |
| `related_camp` | relation | ❌ | camps (single) | Related camp |
| `related_registration` | relation | ❌ | registrations (single) | Related registration |
| `read` | bool | ❌ | default: false | Read status |
| `read_at` | date | ❌ | | Read timestamp |
| `created` | date | ✅ | auto | Creation date |

**Type Options:**
- `registration_received` - ได้รับการสมัคร
- `registration_accepted` - ผ่านการคัดเลือก
- `registration_rejected` - ไม่ผ่านการคัดเลือก
- `camp_reminder` - เตือนค่ายใกล้เริ่ม
- `payment_reminder` - เตือนชำระเงิน
- `camp_updated` - ค่ายมีการอัพเดต
- `system` - ระบบทั่วไป

**API Rules:**
- **List**: `user = @request.auth.id`
- **View**: `user = @request.auth.id`
- **Create**: `@request.auth.role = "admin" || @request.auth.role = "organizer"`
- **Update**: `user = @request.auth.id` (only read status)
- **Delete**: `user = @request.auth.id`

---

### 7. **analytics** (View Collection)

Analytics and statistics (optional, for future implementation).

| Field Name | Type | Required | Options | Description |
|------------|------|----------|---------|-------------|
| `id` | text | ✅ | auto | Auto-generated ID |
| `camp` | relation | ✅ | camps (single) | Related camp |
| `date` | date | ✅ | | Analytics date |
| `page_views` | number | ❌ | default: 0 | Page views |
| `unique_visitors` | number | ❌ | default: 0 | Unique visitors |
| `registrations_count` | number | ❌ | default: 0 | New registrations |
| `conversion_rate` | number | ❌ | | Conversion rate (%) |
| `created` | date | ✅ | auto | Creation date |

**API Rules:**
- **List**: `camp.organizer = @request.auth.id || @request.auth.role = "admin"`
- **View**: `camp.organizer = @request.auth.id || @request.auth.role = "admin"`
- **Create**: System only
- **Update**: System only
- **Delete**: `@request.auth.role = "admin"`

---

## Relations Diagram

```
users
  ├─ has many → camps (as organizer)
  ├─ has many → registrations
  ├─ has many → notifications
  └─ belongs to → faculties

faculties
  └─ has many → camps

camps
  ├─ belongs to → users (organizer)
  ├─ belongs to → faculties
  ├─ has one → registration_forms
  ├─ has many → registrations
  └─ has many → analytics

registration_forms
  └─ belongs to → camps

registrations
  ├─ belongs to → camps
  ├─ belongs to → users (optional)
  └─ belongs to → users (reviewed_by)

notifications
  ├─ belongs to → users
  ├─ belongs to → camps (optional)
  └─ belongs to → registrations (optional)

analytics
  └─ belongs to → camps
```

---

## Hooks & Business Logic

### After Camp Create/Update
```javascript
// Update slug automatically
if (!record.slug) {
  record.slug = generateSlug(record.title);
}

// Auto-close registration if deadline passed
if (record.registration_end < new Date()) {
  record.status = 'closed';
}

// Mark as full if max participants reached
if (record.current_participants >= record.max_participants) {
  record.status = 'full';
}
```

### After Registration Create
```javascript
// Increment camp participants count
camp.current_participants++;

// Create notification for organizer
createNotification({
  user: camp.organizer,
  title: 'มีการสมัครเข้าค่ายใหม่',
  message: `มีผู้สมัครเข้าค่าย ${camp.title}`,
  type: 'registration_received',
  related_camp: camp.id,
  related_registration: registration.id
});

// Send email confirmation to applicant
sendEmail({
  to: registration.form_data.email,
  subject: 'ยืนยันการสมัครค่าย',
  template: 'registration_confirmation'
});
```

### After Registration Status Update
```javascript
// Notify applicant when status changes
if (record.status === 'accepted') {
  createNotification({
    user: record.user,
    title: 'ยินดีด้วย! คุณผ่านการคัดเลือก',
    message: `คุณได้รับการคัดเลือกเข้าค่าย ${camp.title}`,
    type: 'registration_accepted',
    related_camp: record.camp,
    related_registration: record.id
  });
}
```

---

## Indexes Strategy

### Performance Indexes
```sql
-- camps
CREATE INDEX idx_camps_status ON camps(status);
CREATE INDEX idx_camps_faculty ON camps(faculty);
CREATE INDEX idx_camps_start_date ON camps(start_date);
CREATE INDEX idx_camps_registration_end ON camps(registration_end);
CREATE INDEX idx_camps_featured ON camps(featured);

-- registrations
CREATE INDEX idx_registrations_camp ON registrations(camp);
CREATE INDEX idx_registrations_user ON registrations(user);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_submitted_at ON registrations(submitted_at);

-- notifications
CREATE INDEX idx_notifications_user_read ON notifications(user, read);
```

---

## Data Validation Rules

### Camp Dates Validation
```javascript
// start_date must be after today
start_date >= new Date()

// end_date must be after start_date
end_date > start_date

// registration_end must be before start_date
registration_end < start_date

// registration_start must be before registration_end
registration_start < registration_end
```

### Registration Validation
```javascript
// Check if camp is accepting registrations
camp.status === 'published'

// Check if registration is still open
new Date() <= camp.registration_end

// Check if not full
camp.current_participants < camp.max_participants

// Check if user hasn't already registered
!registrations.exists(camp = currentCamp && user = currentUser)
```

---

## Security Best Practices

1. **Authentication Required**: Most operations require authentication
2. **Authorization Checks**: Users can only modify their own records
3. **File Size Limits**: Enforce file size limits (5MB for images, 20MB for documents)
4. **Rate Limiting**: Implement rate limiting on registration submissions
5. **Input Validation**: Validate all user inputs (email, phone, dates)
6. **SQL Injection Prevention**: PocketBase handles this automatically
7. **XSS Prevention**: Sanitize rich text content

---

## Migration Strategy

### Initial Data Seed

```javascript
// Seed faculties
const faculties = [
  { code: 'ENG', name_th: 'วิศวกรรมศาสตร์', name_en: 'Engineering' },
  { code: 'SCI', name_th: 'วิทยาศาสตร์', name_en: 'Science' },
  { code: 'IT', name_th: 'เทคโนโลยีสารสนเทศ', name_en: 'Information Technology' },
  { code: 'ARCH', name_th: 'สถาปัตยกรรมศาสตร์', name_en: 'Architecture' },
  { code: 'AGRO', name_th: 'อุตสาหกรรมเกษตร', name_en: 'Agro-Industry' }
];

// Create admin user
const admin = {
  email: 'admin@kmitl.ac.th',
  username: 'admin',
  name: 'System Admin',
  role: 'admin',
  password: 'SecurePassword123!',
  verified: true
};
```

---

## Backup & Recovery

- **Automatic Backups**: Daily backups of PocketBase database
- **Backup Location**: Cloud storage (Cloudflare R2 / Supabase Storage)
- **Retention Policy**: Keep 30 days of backups
- **Recovery Time**: < 1 hour
- **File Backups**: Separate backup for uploaded files

---

## Future Enhancements

### Phase 2 (Post-MVP)
- Add `camp_templates` collection for reusable camp templates
- Add `email_templates` collection for custom email notifications
- Add `reviews` collection for post-event reviews
- Add `certificates` collection for participant certificates
- Add `payments` collection for detailed payment tracking
- Add `announcements` collection for camp announcements

### Phase 3 (Advanced Features)
- Add `chat_messages` collection for in-app chat
- Add `event_schedule` collection for detailed schedules
- Add `teams` collection for team-based camps
- Add `certificates_templates` collection
- Add `referrals` collection for referral tracking

---

## Development Checklist

### Week 1: Database Setup
- [ ] Install PocketBase
- [ ] Create all collections
- [ ] Configure relations
- [ ] Set up authentication
- [ ] Seed initial data (faculties)
- [ ] Create test users
- [ ] Test API rules

### Week 2: Integration
- [ ] Integrate with SvelteKit
- [ ] Set up file uploads
- [ ] Implement real-time subscriptions
- [ ] Add data validation
- [ ] Test all CRUD operations
- [ ] Set up automated backups

---

**Schema Version**: 1.0  
**Status**: Ready for Implementation  
**Next Review**: After MVP Testing

