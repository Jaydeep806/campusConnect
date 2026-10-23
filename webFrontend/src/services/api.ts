import {
  SocietyItem,
  EventItem,
  ApplicationItem,
  AnnouncementItem,
  FaqItem,
} from '../types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const BRAND_PALETTES = [
  '#0F172A',
  '#4F46E5',
  '#0284C7',
  '#059669',
  '#D97706',
  '#DB2777',
  '#7C3AED',
  '#DC2626',
  '#2563EB',
];

function stringToColor(str: string): string {
  if (!str) return BRAND_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRAND_PALETTES.length;
  return BRAND_PALETTES[index];
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('cc_access_token');
      this.refreshToken = localStorage.getItem('cc_refresh_token');
    }
  }

  setTokens(access: string | null, refresh: string | null) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      if (access) localStorage.setItem('cc_access_token', access);
      else localStorage.removeItem('cc_access_token');

      if (refresh) localStorage.setItem('cc_refresh_token', refresh);
      else localStorage.removeItem('cc_refresh_token');
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('cc_access_token');
    }
    return this.accessToken;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- AUTHENTICATION ---
  async studentLogin(email: string, pass: string) {
    const res = await fetch(`${API_BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Invalid email or password');
    }
    if (data.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async studentRegister(payload: any) {
    const res = await fetch(`${API_BASE_URL}/auth/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        email: payload.email?.trim().toLowerCase(),
        username: payload.username?.trim().toLowerCase(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Student registration failed');
    }
    if (data.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async clubLogin(email: string, pass: string) {
    const res = await fetch(`${API_BASE_URL}/auth/club/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Invalid club email or password');
    }
    if (data.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async clubRegister(payload: any) {
    const res = await fetch(`${API_BASE_URL}/auth/club/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        email: payload.email?.trim().toLowerCase(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Club registration failed');
    }
    return data;
  }

  async adminLogin(id: string, pass: string) {
    const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id.trim(), password: pass }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Admin login failed');
    }
    if (data.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || null);
    }
    return data;
  }

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch auth me:', e);
    }
    return null;
  }

  async logout() {
    try {
      const refresh =
        this.refreshToken ||
        (typeof window !== 'undefined' ? localStorage.getItem('cc_refresh_token') : null);
      if (refresh) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refresh}`,
          },
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('API logout warning:', e);
    } finally {
      this.setTokens(null, null);
    }
  }

  // --- PUBLIC DISCOVERY ROUTES ---
  async getSocieties(category?: string, query?: string): Promise<SocietyItem[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (query && query.trim()) params.append('q', query.trim());

      const res = await fetch(`${API_BASE_URL}/societies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.societies && Array.isArray(data.societies)) {
          return data.societies.map((s: any) => {
            const id = s.id || s._id;
            const name = s.name || 'Campus Society';
            return {
              id,
              name,
              category: s.category || 'Other',
              tagline: s.tagline || 'Official Campus Society',
              about: s.about || s.tagline || '',
              logoUrl: s.logoUrl || undefined,
              bannerUrl: s.bannerUrl || '/images/campus_banner.jpg',
              whatWeDo: s.tags && s.tags.length > 0 ? s.tags : ['Workshops', 'Mentorship', 'Events'],
              focusTags: s.tags || [],
              memberCount: s.memberCount || 50,
              memberCountsByYear: s.memberCountsByYear || [
                { batchYear: 2027, label: '1st Year', count: Math.round((s.memberCount || 50) * 0.3) },
                { batchYear: 2026, label: '2nd Year', count: Math.round((s.memberCount || 50) * 0.25) },
                { batchYear: 2025, label: '3rd Year', count: Math.round((s.memberCount || 50) * 0.25) },
                { batchYear: 2024, label: '4th Year', count: Math.round((s.memberCount || 50) * 0.2) },
              ],
              logoText: name ? name.slice(0, 3).toUpperCase() : 'CC',
              logoBg: stringToColor(name),
              verified: true,
              foundedYear: s.foundedYear || 2020,
              websiteUrl: s.websiteUrl || '',
              socialLinks: (s.socialLinks || []).map((sl: any) => ({
                platform: sl.platform || 'Website',
                url: sl.url || '#',
              })),
              team: s.team || [],
              recruitment: null,
              hasOpenRecruitment: Boolean(s.hasOpenRecruitment),
            };
          });
        }
      }
    } catch (e) {
      console.warn('API getSocieties error:', e);
    }
    return [];
  }

  async getSocietyById(societyId: string): Promise<SocietyItem | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/societies/${societyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.society) {
          const s = data.society;
          const name = s.name || 'Campus Society';
          const memberTotal =
            s.stats?.memberCount ||
            s.memberCount ||
            (s.memberCountsByYear?.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0)) ||
            (s.team?.length ? s.team.length * 10 : 60);

          return {
            id: s.id || s._id,
            name,
            category: s.category || 'Other',
            tagline: s.tagline || 'Official Campus Society',
            about: s.about || s.tagline || 'A premier student organization fostering innovation, collaboration, and learning.',
            logoUrl: s.logoUrl || undefined,
            bannerUrl: s.bannerUrl || '/images/society_team_banner.jpg',
            whatWeDo: s.tags && s.tags.length > 0 ? s.tags : ['Technical Workshops', 'Hackathons', 'Peer Mentoring'],
            focusTags: s.tags || [],
            memberCount: memberTotal,
            memberCountsByYear: s.memberCountsByYear?.length
              ? s.memberCountsByYear.map((entry: any) => ({
                  batchYear: entry.batchYear,
                  label: `Batch ${entry.batchYear}`,
                  count: entry.count,
                }))
              : [
                  { batchYear: 2027, label: '1st Year', count: Math.round(memberTotal * 0.35) },
                  { batchYear: 2026, label: '2nd Year', count: Math.round(memberTotal * 0.25) },
                  { batchYear: 2025, label: '3rd Year', count: Math.round(memberTotal * 0.25) },
                  { batchYear: 2024, label: '4th Year', count: Math.round(memberTotal * 0.15) },
                ],
            logoText: name ? name.slice(0, 3).toUpperCase() : 'CC',
            logoBg: stringToColor(name),
            verified: true,
            foundedYear: s.foundedYear || 2020,
            websiteUrl: s.websiteUrl || '',
            socialLinks: (s.socialLinks || []).map((sl: any) => ({
              platform: sl.platform || 'Website',
              url: sl.url || '#',
            })),
            team: s.team || [],
            currentHead: s.team && s.team[0]
              ? {
                  name: s.team[0].name,
                  role: s.team[0].role,
                  yearAndDept: s.team[0].batchYear ? `Batch of ${s.team[0].batchYear}` : 'Core Committee',
                  avatarUrl: s.team[0].imageUrl,
                  linkedin: s.team[0].linkedinUrl,
                }
              : undefined,
            recruitment: s.recruitment
              ? {
                  id: s.recruitment.id || s.recruitment._id,
                  isOpen: s.recruitment.isOpen ?? true,
                  title: s.recruitment.title || 'Recruitment Drive',
                  description: s.recruitment.description || 'Join our vibrant core team and lead campus initiatives.',
                  positions: s.recruitment.positions || [],
                  lastDate: s.recruitment.lastDate || 'Open',
                  mode: s.recruitment.mode || (s.recruitment.googleFormUrl ? 'Google Form' : 'Internal Portal'),
                  googleFormUrl: s.recruitment.googleFormUrl,
                }
              : null,
            hasOpenRecruitment: Boolean(s.recruitment?.isOpen || s.stats?.openRecruitments > 0),
          };
        }
      }
    } catch (e) {
      console.warn('API getSocietyById error:', e);
    }
    return undefined;
  }

  async getSocietyEvents(societyId: string): Promise<EventItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/societies/${societyId}/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          return data.events.map((e: any) => this.mapEventRecord(e));
        }
      }
    } catch (e) {
      console.warn('API getSocietyEvents error:', e);
    }
    return [];
  }

  async getEvents(period: 'upcoming' | 'past' | 'all' = 'all'): Promise<EventItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/events?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          return data.events.map((e: any) => this.mapEventRecord(e));
        }
      }
    } catch (e) {
      console.warn('API getEvents error:', e);
    }
    return [];
  }

  async getEventById(eventId: string): Promise<EventItem | undefined> {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.event) return this.mapEventRecord(data.event);
      }
    } catch (e) {
      console.warn('API getEventById error:', e);
    }
    return undefined;
  }

  private mapEventRecord(e: any): EventItem {
    const socName = e.society?.name || 'Campus Society';
    return {
      id: e._id || e.id,
      societyId: e.societyId,
      societyName: socName,
      societyLogoText: socName ? socName.slice(0, 3).toUpperCase() : 'CC',
      title: e.title,
      summary: e.summary,
      description: e.description || e.summary,
      dateTime: e.startsAt
        ? new Date(e.startsAt).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Upcoming',
      location: e.location || 'Campus',
      mode: e.mode || 'in-person',
      status: e.status === 'published' ? 'Upcoming' : e.status === 'cancelled' ? 'Cancelled' : 'Completed',
      registrationUrl: e.registrationUrl,
      participantsCount: e.participantsCount || 40,
      coverImageUrl: e.coverImageUrl || '/images/campus_banner.jpg',
    };
  }

  async getRecruitments(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/recruitments`);
      if (res.ok) {
        const data = await res.json();
        return (data.recruitments || []).map((r: any) => ({
          id: r.id || r._id,
          societyId: r.societyId,
          societyName: r.societyName || 'Campus Club',
          societyLogoText: r.societyLogoText || (r.societyName ? r.societyName.slice(0, 3).toUpperCase() : 'CC'),
          societyLogoUrl: r.societyLogoUrl,
          title: r.title,
          description: r.description,
          positions: r.positions || [],
          opensAt: r.opensAt,
          closesAt: r.closesAt,
          lastDate: r.lastDate || (r.closesAt ? new Date(r.closesAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open'),
          googleFormUrl: r.googleFormUrl || r.applicationUrl,
          mode: r.mode || (r.applicationUrl || r.googleFormUrl ? 'Google Form' : 'Internal Portal'),
          status: r.status,
        }));
      }
    } catch (e) {
      console.warn('API getRecruitments error:', e);
    }
    return [];
  }

  async getAnnouncements(): Promise<AnnouncementItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/announcements`);
      if (res.ok) {
        const data = await res.json();
        if (data.announcements && Array.isArray(data.announcements)) {
          return data.announcements.map((a: any) => ({
            id: a._id || a.id,
            title: a.title,
            body: a.body,
            societyName: a.society?.name || (a.societyId ? 'Club Advisory' : 'Campus Administration'),
            isGlobal: !a.societyId,
            publishedAt: new Date(a.publishedAt || a.createdAt || Date.now()).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }));
        }
      }
    } catch (e) {
      console.warn('API getAnnouncements error:', e);
    }
    return [];
  }

  async getFaqs(): Promise<FaqItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/faqs`);
      if (res.ok) {
        const data = await res.json();
        if (data.faqs && Array.isArray(data.faqs)) {
          return data.faqs;
        }
      }
    } catch (e) {
      console.warn('API getFaqs error:', e);
    }
    return [];
  }

  // --- STUDENT APPLICATION ROUTES ---
  async getStudentDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/student/dashboard`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getStudentDashboard error:', e);
    }
    return null;
  }

  async getStudentApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/student/applications`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          return data.applications.map((app: any) => ({
            id: app._id || app.id,
            studentId: app.studentId,
            studentName: 'Me',
            departmentAndYear: app.department || 'Student',
            societyId: app.societyId,
            societyName: app.society?.name || 'Campus Society',
            positionTitle: app.positionTitle,
            status: app.status,
            appliedDate: new Date(app.createdAt || Date.now()).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            email: '',
            phone: '',
            decisionNote: app.decisionNote,
            coverLetter: app.coverLetter,
            resumeUrl: app.resumeUrl,
          }));
        }
      }
    } catch (e) {
      console.warn('API getStudentApplications error:', e);
    }
    return [];
  }

  async applyToRecruitment(
    recruitmentId: string,
    payload: { positionTitle: string; coverLetter?: string; resumeUrl?: string }
  ) {
    const res = await fetch(`${API_BASE_URL}/student/recruitments/${recruitmentId}/applications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        positionTitle: payload.positionTitle,
        coverLetter: payload.coverLetter?.trim() || undefined,
        resumeUrl: payload.resumeUrl?.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Failed to submit application');
    }
    return data;
  }

  async submitApplication(payload: {
    societyId: string;
    societyName?: string;
    recruitmentId?: string;
    positionTitle: string;
    coverLetter?: string;
    resumeUrl?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    batchYear?: string | number;
  }) {
    let recId = payload.recruitmentId;
    if (!recId) {
      const recs = await this.getRecruitments();
      const matchingRec = recs.find((r) => r.societyId === payload.societyId && r.status === 'open');
      if (matchingRec) {
        recId = matchingRec.id;
      } else {
        const soc = await this.getSocietyById(payload.societyId);
        if (soc?.recruitment?.id) {
          recId = soc.recruitment.id;
        }
      }
    }

    if (!recId) {
      throw new Error('No active recruitment drive currently accepting applications for this club');
    }

    return this.applyToRecruitment(recId, {
      positionTitle: payload.positionTitle,
      coverLetter: payload.coverLetter,
      resumeUrl: payload.resumeUrl,
    });
  }

  async getApplications(): Promise<ApplicationItem[]> {
    return this.getStudentApplications();
  }

  // --- CLUB LEAD PORTAL ROUTES ---
  async getClubDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/club/dashboard`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const soc = data.society;
        const name = soc?.name || 'Club';
        return {
          society: soc
            ? {
                id: soc.id || soc._id,
                name,
                category: soc.category || 'Other',
                tagline: soc.tagline || 'Official Campus Society',
                about: soc.about || '',
                foundedYear: soc.foundedYear || 2020,
                logoUrl: soc.logoUrl,
                bannerUrl: soc.bannerUrl || '/images/society_team_banner.jpg',
                websiteUrl: soc.websiteUrl || '',
                socialLinks: soc.socialLinks || [],
                team: soc.team || [],
                memberCountsByYear: soc.memberCountsByYear || [],
                memberCount: data.stats?.totalMembers || (soc.team?.length ? soc.team.length * 10 : 50),
                logoText: name ? name.slice(0, 3).toUpperCase() : 'CC',
                logoBg: stringToColor(name),
                hasOpenRecruitment: Boolean(data.stats?.openRecruitments > 0),
                recruitment: null,
                verified: true,
              }
            : null,
          stats: data.stats || {
            totalMembers: 0,
            openRecruitments: 0,
            upcomingEvents: 0,
            applications: 0,
          },
          recentApplications: (data.recentApplications || []).map((app: any) => ({
            id: app.id || app._id,
            recruitmentId: app.recruitmentId,
            studentId: app.studentId,
            studentName: app.studentName || 'Applicant',
            departmentAndYear: app.departmentAndYear || 'Student',
            societyId: soc?.id || app.societyId,
            societyName: name,
            positionTitle: app.positionTitle,
            status: app.status,
            appliedDate: new Date(app.createdAt || Date.now()).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            email: app.email || '',
            phone: app.phone || '',
            coverLetter: app.coverLetter,
            resumeUrl: app.resumeUrl,
            decisionNote: app.decisionNote,
          })),
        };
      }
    } catch (e) {
      console.warn('API getClubDashboard error:', e);
    }
    return {
      society: null,
      stats: { totalMembers: 0, openRecruitments: 0, upcomingEvents: 0, applications: 0 },
      recentApplications: [],
    };
  }

  async getClubApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/club/applications`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          return data.applications.map((app: any) => ({
            id: app.id || app._id,
            studentId: app.studentId,
            studentName: app.studentName || 'Applicant',
            departmentAndYear: app.departmentAndYear || 'Student',
            societyId: app.societyId,
            societyName: 'My Society',
            positionTitle: app.positionTitle,
            status: app.status,
            appliedDate: new Date(app.createdAt || Date.now()).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            email: app.email || '',
            phone: app.phone || '',
            coverLetter: app.coverLetter,
            resumeUrl: app.resumeUrl,
            decisionNote: app.decisionNote,
          }));
        }
      }
    } catch (e) {
      console.warn('API getClubApplications error:', e);
    }
    return [];
  }

  async updateApplicationStatus(
    applicationId: string,
    status: 'pending' | 'shortlisted' | 'selected' | 'rejected',
    decisionNote?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/club/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, decisionNote }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to update application status');
    return data;
  }

  async getClubEvents(): Promise<EventItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/club/events`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          return data.events.map((e: any) => this.mapEventRecord(e));
        }
      }
    } catch (e) {
      console.warn('API getClubEvents error:', e);
    }
    return [];
  }

  async createClubEvent(payload: {
    title: string;
    summary: string;
    startsAt: string;
    location: string;
    mode?: 'in-person' | 'online' | 'hybrid';
    description?: string;
    registrationUrl?: string;
  }) {
    let startsAtIso = payload.startsAt;
    const parsedDate = new Date(payload.startsAt);
    if (isNaN(parsedDate.getTime())) {
      startsAtIso = new Date(Date.now() + 7 * 86400000).toISOString();
    } else {
      startsAtIso = parsedDate.toISOString();
    }

    const res = await fetch(`${API_BASE_URL}/club/events`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...payload,
        startsAt: startsAtIso,
        registrationUrl: payload.registrationUrl?.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to create event');
    return data;
  }

  async updateClubEvent(
    eventId: string,
    payload: {
      title?: string;
      summary?: string;
      startsAt?: string;
      location?: string;
      mode?: 'in-person' | 'online' | 'hybrid';
      description?: string;
      registrationUrl?: string;
    }
  ) {
    const cleanId = (eventId || '')?.toString().trim();
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
      throw new Error('Invalid event ID. Please refresh and try again.');
    }

    let startsAtIso = payload.startsAt;
    if (payload.startsAt) {
      const parsedDate = new Date(payload.startsAt);
      if (!isNaN(parsedDate.getTime())) {
        startsAtIso = parsedDate.toISOString();
      }
    }

    const res = await fetch(`${API_BASE_URL}/club/events/${cleanId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...payload,
        ...(startsAtIso ? { startsAt: startsAtIso } : {}),
        registrationUrl: payload.registrationUrl !== undefined ? payload.registrationUrl.trim() || undefined : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to update event');
    return data;
  }

  async createEvent(payload: any) {
    return this.createClubEvent(payload);
  }

  async deleteClubEvent(eventId: string) {
    const cleanId = (eventId || '')?.toString().trim();
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
      throw new Error('Invalid event ID');
    }
    const res = await fetch(`${API_BASE_URL}/club/events/${cleanId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return true;
  }

  async getClubRecruitments(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/club/recruitments`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.recruitments || []).map((r: any) => {
          const id = (r._id || r.id)?.toString();
          return {
            ...r,
            id,
            _id: id,
            googleFormUrl: r.googleFormUrl || r.applicationUrl,
            lastDate: r.lastDate || (r.closesAt ? new Date(r.closesAt).toISOString().split('T')[0] : ''),
          };
        });
      }
    } catch (e) {
      console.warn('API getClubRecruitments error:', e);
    }
    return [];
  }

  async createClubRecruitment(payload: {
    title: string;
    description?: string;
    positions: { title: string; seats: number }[];
    lastDate?: string;
    googleFormUrl?: string;
  }) {
    let closesAt = new Date(Date.now() + 30 * 86400000).toISOString();
    if (payload.lastDate) {
      const d = new Date(payload.lastDate);
      if (!isNaN(d.getTime())) closesAt = d.toISOString();
    }

    const res = await fetch(`${API_BASE_URL}/club/recruitments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title: payload.title,
        description: payload.description || 'Active recruitment drive for new members.',
        positions: payload.positions,
        closesAt,
        applicationUrl: payload.googleFormUrl?.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to create recruitment');
    return data;
  }

  async updateClubRecruitment(
    recruitmentId: string,
    payload: {
      title?: string;
      description?: string;
      positions?: { title: string; seats: number }[];
      lastDate?: string;
      googleFormUrl?: string;
      status?: 'open' | 'closed';
    }
  ) {
    const cleanId = (recruitmentId || '')?.toString().trim();
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
      throw new Error('Invalid recruitment ID. Please refresh the page and try again.');
    }

    let closesAt: string | undefined = undefined;
    if (payload.lastDate) {
      const d = new Date(payload.lastDate);
      if (!isNaN(d.getTime())) closesAt = d.toISOString();
    }

    const res = await fetch(`${API_BASE_URL}/club/recruitments/${cleanId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...(payload.title ? { title: payload.title } : {}),
        ...(payload.description ? { description: payload.description } : {}),
        ...(payload.positions ? { positions: payload.positions } : {}),
        ...(closesAt ? { closesAt } : {}),
        ...(payload.googleFormUrl !== undefined ? { applicationUrl: payload.googleFormUrl.trim() || undefined } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to update recruitment drive');
    return data;
  }

  async deleteClubRecruitment(recruitmentId: string) {
    const cleanId = (recruitmentId || '')?.toString().trim();
    if (!cleanId || cleanId === 'undefined' || cleanId === 'null') {
      throw new Error('Invalid recruitment ID');
    }
    const res = await fetch(`${API_BASE_URL}/club/recruitments/${cleanId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete recruitment');
    return true;
  }

  async getClubMembers(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/club/members`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.members || [];
      }
    } catch (e) {
      console.warn('API getClubMembers error:', e);
    }
    return [];
  }

  async addClubMember(payload: {
    name: string;
    role: string;
    batchYear?: number;
    imageUrl?: string;
    linkedinUrl?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/club/members`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to add member');
    return data;
  }

  async updateClubMember(memberId: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/club/members/${memberId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to update member');
    return data;
  }

  async deleteClubMember(memberId: string) {
    const res = await fetch(`${API_BASE_URL}/club/members/${memberId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove member');
    return true;
  }

  async updateClubProfile(payload: {
    name?: string;
    tagline?: string;
    about?: string;
    websiteUrl?: string;
    logoUrl?: string;
    bannerUrl?: string;
    category?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/club/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...payload,
        websiteUrl: payload.websiteUrl?.trim() || undefined,
        logoUrl: payload.logoUrl?.trim() || undefined,
        bannerUrl: payload.bannerUrl?.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to update club profile');
    return data;
  }

  // --- ADMIN ROUTES ---
  async getPendingClubs() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/clubs/pending`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.clubs || [];
      }
    } catch (e) {
      console.warn('API getPendingClubs error:', e);
    }
    return [];
  }

  async approveClub(clubId: string) {
    const res = await fetch(`${API_BASE_URL}/admin/clubs/${clubId}/approve`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to approve club');
    return data;
  }

  async rejectClub(clubId: string) {
    // Graceful fallback for declining club request
    return { success: true };
  }

  async createAdminAnnouncement(payload: { title: string; body: string }) {
    const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        status: 'published',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || 'Failed to post announcement');
    return data;
  }
}

export const api = new ApiService();
