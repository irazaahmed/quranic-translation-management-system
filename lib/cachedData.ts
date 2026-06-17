"use server";

import { cache } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Language, Meeting, Project, MeetingWithLanguage, ProjectStats } from "@/lib/supabase";

// ============================================
// Cached Data Fetching Functions
// These functions use React's cache() for request memoization
// ============================================

/**
 * Fetch all languages - CACHED
 * Cached for the duration of a single request
 */
export const getCachedLanguages = cache(async (): Promise<Language[]> => {
  const { data, error } = await supabase
    .from("languages")
    .select(`
      id,
      country,
      language,
      responsible_person,
      priority,
      work_status,
      last_meeting_at,
      assigned_day,
      project_id,
      created_at,
      updated_at
    `)
    .order("language", { ascending: true });

  if (error) throw error;
  return data || [];
});

/**
 * Fetch recent meetings with language data - CACHED
 * Cached for the duration of a single request
 */
export const getCachedRecentMeetings = cache(async (limit: number = 20): Promise<MeetingWithLanguage[]> => {
  const { data: meetingsData, error } = await supabase
    .from("meetings")
    .select(`
      id,
      language_id,
      meeting_date,
      meeting_type,
      participants,
      discussion_points,
      action_items,
      created_at,
      languages:language_id (
        id,
        country,
        language,
        responsible_person,
        priority,
        work_status
      )
    `)
    .order("meeting_date", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (meetingsData || []).map((row: any) => ({
    meeting: {
      id: row.id,
      language_id: row.language_id,
      meeting_date: row.meeting_date,
      meeting_type: row.meeting_type,
      participants: row.participants,
      discussion_points: row.discussion_points,
      translation_progress: row.translation_progress || null,
      progress_percentage: row.progress_percentage || null,
      action_items: row.action_items,
      next_meeting_date: row.next_meeting_date || null,
      meeting_notes: row.meeting_notes || null,
      created_at: row.created_at,
      updated_at: row.updated_at || "",
    },
    language: row.languages as Language,
  }));
});

/**
 * Fetch upcoming meetings (next_meeting_date >= today) - CACHED
 */
export const getCachedUpcomingMeetings = cache(async (limit: number = 8): Promise<MeetingWithLanguage[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("meetings")
    .select(`
      id,
      language_id,
      meeting_date,
      next_meeting_date,
      participants,
      action_items,
      created_at,
      languages:language_id (
        id, country, language, responsible_person, priority, work_status
      )
    `)
    .gte("next_meeting_date", today.toISOString().slice(0, 10))
    .order("next_meeting_date", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    meeting: {
      id: row.id,
      language_id: row.language_id,
      meeting_date: row.meeting_date,
      meeting_type: null,
      participants: row.participants,
      discussion_points: null,
      translation_progress: null,
      progress_percentage: null,
      action_items: row.action_items,
      next_meeting_date: row.next_meeting_date,
      meeting_notes: null,
      created_at: row.created_at,
      updated_at: "",
    },
    language: row.languages as Language,
  }));
});

/**
 * Fetch stale languages - CACHED
 * Cached for the duration of a single request
 */
export const getCachedStaleLanguages = cache(async (days: number = 7): Promise<Language[]> => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await supabase
    .from("languages")
    .select(`
      id,
      country,
      language,
      responsible_person,
      priority,
      work_status,
      last_meeting_at,
      assigned_day,
      project_id,
      created_at,
      updated_at
    `)
    .eq("work_status", "in_progress")
    .or(`last_meeting_at.is.null,last_meeting_at.lt.${daysAgo.toISOString()}`)
    .order("last_meeting_at", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data || [];
});

/**
 * Fetch urgent languages (no meeting for X days) - CACHED
 * Cached for the duration of a single request
 */
export const getCachedUrgentLanguages = cache(async (days: number = 7): Promise<Language[]> => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const { data, error } = await supabase
    .from("languages")
    .select(`
      id,
      country,
      language,
      responsible_person,
      priority,
      work_status,
      last_meeting_at,
      assigned_day,
      project_id,
      created_at,
      updated_at
    `)
    .eq("work_status", "in_progress")
    .or(`last_meeting_at.is.null,last_meeting_at.lt.${daysAgo.toISOString()}`)
    .order("last_meeting_at", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data || [];
});

/**
 * Fetch project statistics - CACHED
 * Uses a single query with JOINs for optimal performance
 * Cached for the duration of a single request
 */
export const getCachedProjectStats = cache(async (): Promise<ProjectStats[]> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      description,
      created_at,
      languages (
        id,
        work_status,
        last_meeting_at,
        meetings (
          meeting_date
        )
      )
    `);

  if (error) throw error;

  const stats: ProjectStats[] = [];

  for (const project of data || []) {
    const languages = project.languages || [];
    
    // Calculate meetings this week from nested data
    let meetingsThisWeek = 0;
    languages.forEach(lang => {
      const meetings = lang.meetings || [];
      meetings.forEach(meeting => {
        if (new Date(meeting.meeting_date) >= sevenDaysAgo) {
          meetingsThisWeek++;
        }
      });
    });

    stats.push({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
      },
      totalLanguages: languages.length,
      inProgress: languages.filter(l => l.work_status === 'in_progress').length,
      completed: languages.filter(l => l.work_status === 'completed').length,
      notStarted: languages.filter(l => l.work_status === 'not_started').length,
      meetingsThisWeek,
      needsAttention: languages.filter(l =>
        l.work_status === 'in_progress' &&
        (!l.last_meeting_at || new Date(l.last_meeting_at) < fourteenDaysAgo)
      ).length,
    });
  }

  return stats;
});

/**
 * Schedule data: every language with its assigned weekday, project name,
 * latest recorded meeting date and the next scheduled follow-up. Used by the
 * /schedule page to show whether each weekly meeting happened or is pending.
 */
export interface ScheduleEntry {
  id: string;
  language: string;
  country: string;
  responsible_person: string | null;
  work_status: string;
  assigned_day: string | null;
  project_id: string | null;
  projectName: string | null;
  /** ISO date of the most recent recorded meeting (or null). */
  lastMeeting: string | null;
  /** ISO date of the soonest upcoming follow-up (next_meeting_date >= today), or null. */
  nextMeeting: string | null;
}

export const getCachedScheduleData = cache(async (): Promise<ScheduleEntry[]> => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("languages")
    .select(`
      id,
      language,
      country,
      responsible_person,
      work_status,
      assigned_day,
      project_id,
      projects:project_id ( name ),
      meetings ( meeting_date, next_meeting_date )
    `)
    .order("language", { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => {
    const meetings: Array<{ meeting_date: string; next_meeting_date: string | null }> =
      row.meetings || [];

    let lastMeeting: string | null = null;
    for (const m of meetings) {
      if (m.meeting_date && (!lastMeeting || m.meeting_date > lastMeeting)) {
        lastMeeting = m.meeting_date;
      }
    }

    let nextMeeting: string | null = null;
    for (const m of meetings) {
      const nm = m.next_meeting_date;
      if (nm && nm >= todayStr && (!nextMeeting || nm < nextMeeting)) {
        nextMeeting = nm;
      }
    }

    return {
      id: row.id,
      language: row.language,
      country: row.country,
      responsible_person: row.responsible_person,
      work_status: row.work_status,
      assigned_day: row.assigned_day ?? null,
      project_id: row.project_id ?? null,
      projectName: row.projects?.name ?? null,
      lastMeeting,
      nextMeeting,
    };
  });
});

/**
 * Fetch all projects - CACHED
 * Cached for the duration of a single request
 */
export const getCachedProjects = cache(async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
});

/**
 * Fetch all meetings count for this week - CACHED
 * Optimized to only count meetings without fetching full data
 */
export const getCachedMeetingsCountThisWeek = cache(async (): Promise<number> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const { count, error } = await supabase
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .gte("meeting_date", sevenDaysAgo.toISOString());

  if (error) throw error;
  return count || 0;
});
