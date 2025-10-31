# K-CAMP Project Documentation

## Executive Summary

K-CAMP is a web-based service platform designed to streamline camp and event organization at KMITL university. The platform provides ready-to-use templates for registration websites and forms, reducing the workload for event organizers while creating a centralized discovery hub for students seeking camps across all faculties.

## Problem Statement

### Current Challenges
- **High Workload**: Event organizers need technical expertise to create websites and registration forms
- **Resource Intensive**: Each camp requires dedicated developers and designers
- **Fragmented Information**: Students struggle to find camps across different faculties
- **Repetitive Work**: Similar registration systems built from scratch for each event

### Impact
These challenges create barriers for organizing quality events and limit student access to opportunities across the university.

## Solution Overview

K-CAMP addresses these challenges by providing:

1. **Template Library**: Pre-built, customizable website templates for camp registration
2. **Form Builder**: Drag-and-drop registration form creation
3. **Centralized Discovery**: Single platform for students to browse all KMITL camps
4. **Admin Dashboard**: Backend management system for organizers
5. **Zero-Cost Deployment**: University-hosted solution requiring no external payment

## Target Users

### Primary Users
- **Camp Organizers**: Faculty and student committees organizing events
- **Event Coordinators**: University departments managing multiple programs

### Secondary Users
- **Students**: High school and university students seeking camps
- **Faculty Advisors**: Supervising staff overseeing events

## Competitive Analysis

| Feature | K-CAMP | Camphub | i-folio |
|---------|--------|---------|---------|
| Camp Discovery | ✅ KMITL-focused | ✅ Nationwide | ❌ |
| Website Creation | ✅ Yes | ❌ No | ❌ No |
| Form Builder | ✅ Yes | ❌ No | ✅ Limited |
| Admin Dashboard | ✅ Yes | ❌ No | ✅ Yes |
| Cost | 🆓 Free | 💰 Varies | 💰 Paid |
| Target Scope | 🎯 KMITL Only | 🌐 All Thailand | 🏢 Enterprise |

### Key Differentiators
- **Integrated Solution**: Combines discovery and creation tools
- **Institution-Specific**: Optimized for KMITL workflows and branding
- **Complete Package**: End-to-end solution from creation to participant management

## Technical Architecture

### Frontend Stack
- **Framework**: SvelteKit (current implementation)
- **UI Components**: shadcn-svelte
- **Styling**: TailwindCSS
- **Animations**: Motion (formerly Framer Motion)
- **State Management**: Svelte stores

### Backend Stack
- **Primary Backend**: PocketBase (Auth, Database, Realtime)
- **Storage**: Supabase Storage / Cloudflare R2
- **API Extensions**: SvelteKit server endpoints

### Deployment
- **Hosting**: Vercel / Cloudflare Pages
- **Database**: Supabase Cloud
- **CDN**: Cloudflare

## 2-Week MVP Development Plan

### Week 1: Core Infrastructure & Authentication

#### Days 1-2: Foundation Setup
- [x] Project initialization with SvelteKit
- [x] Supabase integration (Auth + Database)
- [x] Authentication flow (Email/OAuth)
- [ ] Database schema design
  - Users table
  - Camps table (basic fields)
  - Registrations table

#### Days 3-4: Landing Page & Discovery
- [ ] Homepage with camp listings
- [ ] Camp card components
- [ ] Search and filter functionality (by faculty, date)
- [ ] Camp detail view page

#### Days 5-7: Camp Creation (Phase 1)
- [ ] Camp creation form (basic info)
  - Camp name, description
  - Date range
  - Faculty/department
  - Registration deadline
- [ ] Image upload functionality
- [ ] Camp preview page
- [ ] Draft/publish system

### Week 2: Registration System & Polish

#### Days 8-10: Registration Flow
- [ ] Registration form builder (simplified)
  - Text input
  - Email input
  - Phone number
  - File upload
  - Radio/checkbox options
- [ ] Student registration flow
- [ ] Registration submission handler
- [ ] Email confirmation (basic)

#### Days 11-12: Organizer Dashboard
- [ ] Dashboard layout
- [ ] Camp management (list, edit, delete)
- [ ] Registration list view
- [ ] Basic applicant management
- [ ] Export registrations (CSV)

#### Days 13-14: Testing & Deployment
- [ ] Bug fixes and testing
- [ ] Responsive design optimization
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Documentation completion

### Out of Scope (Post-MVP)
- Advanced form builder (conditional logic)
- Payment integration (RDCW Slip Verify)
- Email templates customization
- Analytics dashboard
- Multi-language support
- Advanced participant management
- Calendar integration
- Social media sharing tools

## Feature Prioritization

### Must-Have (Week 1-2)
1. User authentication
2. Camp creation (basic)
3. Camp discovery/listing
4. Registration form (simple)
5. Basic admin dashboard

### Should-Have (Week 3-4)
1. Email notifications
2. Advanced form builder
3. Better search/filters
4. File management
5. Registration analytics

### Could-Have (Future)
1. Payment processing
2. Certificate generation
3. Participant communication
4. Calendar sync
5. Social sharing

## Success Metrics

### MVP Launch Criteria
- ✅ 5+ camps created and published
- ✅ 50+ student registrations
- ✅ 3+ faculties represented
- ✅ <3s average page load time
- ✅ Mobile responsive (all pages)

### Long-term KPIs
- Monthly active camps
- Total registrations processed
- User satisfaction score
- System uptime (>99.5%)
- Average time to create camp (<15 min)

## Team Structure & Responsibilities

### 2-Week Sprint Team (3-4 people ideal)

**Full-Stack Developer(s)** (60%)
- Database design and backend API
- Frontend component development
- Integration work
- Deployment and DevOps

**UI/UX Designer** (20%)
- Interface design
- User flow optimization
- Component styling
- Responsive design

**Product Manager/QA** (20%)
- Requirements gathering
- Testing and bug tracking
- Documentation
- Stakeholder communication

## Risk Management

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict MVP feature list |
| Integration issues | Medium | Early Supabase testing |
| Performance problems | Medium | Code splitting, lazy loading |
| Auth complexity | Low | Use Supabase auth directly |

### Project Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Timeline slip | High | Daily standups, clear milestones |
| Unclear requirements | Medium | Weekly stakeholder demos |
| Resource constraints | Medium | Prioritize must-have features |

## Next Steps

### Immediate Actions
1. ✅ Set up development environment
2. ✅ Initialize Supabase project
3. [ ] Create database schema
4. [ ] Design UI mockups
5. [ ] Set up CI/CD pipeline

### Week 1 Checkpoint
- Working authentication
- Basic camp listing page
- Camp creation form (beta)

### Week 2 Checkpoint
- Full registration flow
- Admin dashboard (basic)
- Deployed MVP

## References & Resources

- **Similar Platforms**: Camphub (discovery), i-folio (event management)
- **Tech Documentation**: [SvelteKit](https://kit.svelte.dev), [Supabase](https://supabase.com/docs)
- **Design System**: [shadcn-svelte](https://www.shadcn-svelte.com)

## Repository & Documentation

- **GitHub**: [Set to Public]
- **Live Demo**: [To be deployed]
- **Access**: @kmitl.ac.th domain users

---

**Document Version**: 2.0  
**Last Updated**: October 24, 2025  
**Status**: Active Development  
**Target Launch**: 2 weeks from project start
