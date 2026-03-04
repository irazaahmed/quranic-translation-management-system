import { supabase } from "./supabaseClient";

// ============================================
// Types: Languages
// ============================================

export interface Language {
  id: string;
  country: string;
  language: string;
  responsible_person: string | null;
  priority: "low" | "medium" | "high" | null;
  last_meeting_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLanguageInput {
  country: string;
  language: string;
  responsible_person?: string | null;
  priority?: "low" | "medium" | "high" | null;
}

export interface UpdateLanguageInput {
  country?: string;
  language?: string;
  responsible_person?: string | null;
  priority?: "low" | "medium" | "high" | null;
}

// ============================================
// Types: Meetings
// ============================================

export interface Meeting {
  id: string;
  language_id: string;
  meeting_date: string;
  meeting_type: string | null;
  participants: string | null;
  discussion_points: string | null;
  translation_progress: string | null;
  progress_percentage: number | null;
  action_items: string | null;
  next_meeting_date: string | null;
  meeting_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingInput {
  language_id: string;
  meeting_date: string;
  meeting_type?: string | null;
  participants?: string | null;
  discussion_points?: string | null;
  translation_progress?: string | null;
  progress_percentage?: number | null;
  action_items?: string | null;
  next_meeting_date?: string | null;
  meeting_notes?: string | null;
}

export interface UpdateMeetingInput {
  meeting_date?: string;
  meeting_type?: string | null;
  participants?: string | null;
  discussion_points?: string | null;
  translation_progress?: string | null;
  progress_percentage?: number | null;
  action_items?: string | null;
  next_meeting_date?: string | null;
  meeting_notes?: string | null;
}

// ============================================
// Functions: Languages
// ============================================

/**
 * Fetch all languages from the database
 */
export async function getAllLanguages(): Promise<Language[]> {
  try {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Fetched languages:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
}

/**
 * Fetch languages that haven't had a meeting in the specified number of days
 */
export async function getStaleLanguages(days: number = 3): Promise<Language[]> {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - days);

    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .or(`last_meeting_at.is.null,last_meeting_at.lt.${threeDaysAgo.toISOString()}`)
      .order("last_meeting_at", { ascending: true, nullsFirst: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching stale languages:", error);
    throw error;
  }
}

/**
 * Fetch languages that have no meeting or last meeting was 7+ days ago (for urgent follow-ups)
 */
export async function getLanguagesNoMeeting(days: number = 7): Promise<Language[]> {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .or(`last_meeting_at.is.null,last_meeting_at.lt.${daysAgo.toISOString()}`)
      .order("last_meeting_at", { ascending: true, nullsFirst: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching languages with no meeting:", error);
    throw error;
  }
}

/**
 * Create a new language
 */
export async function createLanguage(
  input: CreateLanguageInput
): Promise<Language | null> {
  try {
    const { data, error } = await supabase
      .from("languages")
      .insert([
        {
          country: input.country,
          language: input.language,
          responsible_person: input.responsible_person ?? null,
          priority: input.priority ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating language:", error);
    throw error;
  }
}

/**
 * Update a language
 */
export async function updateLanguage(
  languageId: string,
  input: UpdateLanguageInput
): Promise<Language | null> {
  try {
    const updateData: Partial<Language> = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("languages")
      .update(updateData)
      .eq("id", languageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating language:", error);
    throw error;
  }
}

/**
 * Delete a language
 */
export async function deleteLanguage(languageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("languages")
      .delete()
      .eq("id", languageId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting language:", error);
    throw error;
  }
}

/**
 * Get a single language by ID
 */
export async function getLanguageById(id: string): Promise<Language | null> {
  try {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching language:", error);
    throw error;
  }
}

// ============================================
// Functions: Meetings
// ============================================

/**
 * Fetch all meetings from the database
 */
export async function getAllMeetings(): Promise<Meeting[]> {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }
}

/**
 * Fetch meetings for a specific language
 */
export async function getMeetingsByLanguage(
  languageId: string
): Promise<Meeting[]> {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("language_id", languageId)
      .order("meeting_date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching meetings by language:", error);
    throw error;
  }
}

/**
 * Create a new meeting
 */
export async function createMeeting(
  input: CreateMeetingInput
): Promise<Meeting | null> {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .insert([
        {
          language_id: input.language_id,
          meeting_date: input.meeting_date,
          meeting_type: input.meeting_type ?? null,
          participants: input.participants ?? null,
          discussion_points: input.discussion_points ?? null,
          translation_progress: input.translation_progress ?? null,
          progress_percentage: input.progress_percentage ?? null,
          action_items: input.action_items ?? null,
          next_meeting_date: input.next_meeting_date ?? null,
          meeting_notes: input.meeting_notes ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

/**
 * Update a meeting
 */
export async function updateMeeting(
  meetingId: string,
  input: UpdateMeetingInput
): Promise<Meeting | null> {
  try {
    const updateData: Partial<Meeting> = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("meetings")
      .update(updateData)
      .eq("id", meetingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    const { error } = await supabase.from("meetings").delete().eq("id", meetingId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting meeting:", error);
    throw error;
  }
}

/**
 * Get a single meeting by ID
 */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw error;
  }
}

/**
 * Get the most recent meeting for a language
 */
export async function getLatestMeetingByLanguage(
  languageId: string
): Promise<Meeting | null> {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("language_id", languageId)
      .order("meeting_date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    console.error("Error fetching latest meeting:", error);
    throw error;
  }
}

/**
 * Search meetings by participants, discussion points, next action, or language name
 */
export interface MeetingWithLanguage {
  meeting: Meeting;
  language: Language | null;
}

export async function searchMeetings(query: string): Promise<MeetingWithLanguage[]> {
  try {
    // First, search meetings by text fields
    const { data: meetingsData, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .or(
        `participants.ilike.%${query}%,discussion_points.ilike.%${query}%,action_items.ilike.%${query}%`
      )
      .order("meeting_date", { ascending: false })
      .limit(20);

    if (meetingsError) throw meetingsError;

    // Also search by language name
    const { data: languagesData, error: languagesError } = await supabase
      .from("languages")
      .select("id")
      .ilike("language", `%${query}%`);

    if (languagesError) throw languagesError;

    // Get meetings for matching languages
    let languageMeetings: Meeting[] = [];
    if (languagesData && languagesData.length > 0) {
      const languageIds = languagesData.map((lang) => lang.id);
      const { data: langMeetingsData, error: langMeetingsError } = await supabase
        .from("meetings")
        .select("*")
        .in("language_id", languageIds)
        .order("meeting_date", { ascending: false });

      if (langMeetingsError) throw langMeetingsError;
      languageMeetings = langMeetingsData || [];
    }

    // Combine and deduplicate results
    const allMeetings = [...(meetingsData || []), ...languageMeetings];
    const uniqueMeetings = allMeetings.filter(
      (meeting, index, self) => index === self.findIndex((m) => m.id === meeting.id)
    );

    // Enrich with language data
    const meetingsWithLanguage: MeetingWithLanguage[] = await Promise.all(
      uniqueMeetings.map(async (meeting) => ({
        meeting,
        language: await getLanguageById(meeting.language_id),
      }))
    );

    return meetingsWithLanguage;
  } catch (error) {
    console.error("Error searching meetings:", error);
    throw error;
  }
}

/**
 * Get recent meetings with language data
 */
export async function getRecentMeetings(limit: number = 20): Promise<MeetingWithLanguage[]> {
  try {
    const { data: meetingsData, error } = await supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const meetingsWithLanguage: MeetingWithLanguage[] = await Promise.all(
      (meetingsData || []).map(async (meeting) => ({
        meeting,
        language: await getLanguageById(meeting.language_id),
      }))
    );

    return meetingsWithLanguage;
  } catch (error) {
    console.error("Error fetching recent meetings:", error);
    throw error;
  }
}

/**
 * Get weekly report data - meetings from the last 7 days grouped by language
 */
export interface WeeklyReportData {
  weekStart: Date;
  weekEnd: Date;
  totalMeetings: number;
  totalLanguages: number;
  languagesWithMeetings: Array<{
    language: Language;
    meetings: Meeting[];
  }>;
}

export async function getWeeklyReport(): Promise<WeeklyReportData> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch meetings from the last 7 days
    const { data: meetingsData, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .gte("meeting_date", sevenDaysAgo.toISOString())
      .order("meeting_date", { ascending: false });

    if (meetingsError) throw meetingsError;

    const meetings = meetingsData || [];

    // Group meetings by language
    const meetingsByLanguage = new Map<string, Meeting[]>();
    const languageIds = new Set<string>();

    meetings.forEach((meeting) => {
      languageIds.add(meeting.language_id);
      const existing = meetingsByLanguage.get(meeting.language_id) || [];
      existing.push(meeting);
      meetingsByLanguage.set(meeting.language_id, existing);
    });

    // Fetch language details
    const languagesWithMeetings: WeeklyReportData["languagesWithMeetings"] = [];

    for (const [languageId, langMeetings] of meetingsByLanguage.entries()) {
      const language = await getLanguageById(languageId);
      if (language) {
        languagesWithMeetings.push({
          language,
          meetings: langMeetings.sort((a, b) =>
            new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
          ),
        });
      }
    }

    // Sort languages alphabetically
    languagesWithMeetings.sort((a, b) =>
      a.language.language.localeCompare(b.language.language)
    );

    return {
      weekStart: sevenDaysAgo,
      weekEnd: now,
      totalMeetings: meetings.length,
      totalLanguages: languagesWithMeetings.length,
      languagesWithMeetings,
    };
  } catch (error) {
    console.error("Error fetching weekly report:", error);
    throw error;
  }
}

/**
 * Get monthly report data - meetings from the last 30 days grouped by language
 */
export interface MonthlyReportData {
  monthStart: Date;
  monthEnd: Date;
  totalMeetings: number;
  totalLanguages: number;
  languagesWithMeetings: Array<{
    language: Language;
    meetings: Meeting[];
  }>;
}

export async function getMonthlyReport(): Promise<MonthlyReportData> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch meetings from the last 30 days
    const { data: meetingsData, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .gte("meeting_date", thirtyDaysAgo.toISOString())
      .order("meeting_date", { ascending: false });

    if (meetingsError) throw meetingsError;

    const meetings = meetingsData || [];

    // Group meetings by language
    const meetingsByLanguage = new Map<string, Meeting[]>();
    const languageIds = new Set<string>();

    meetings.forEach((meeting) => {
      languageIds.add(meeting.language_id);
      const existing = meetingsByLanguage.get(meeting.language_id) || [];
      existing.push(meeting);
      meetingsByLanguage.set(meeting.language_id, existing);
    });

    // Fetch language details
    const languagesWithMeetings: MonthlyReportData["languagesWithMeetings"] = [];

    for (const [languageId, langMeetings] of meetingsByLanguage.entries()) {
      const language = await getLanguageById(languageId);
      if (language) {
        languagesWithMeetings.push({
          language,
          meetings: langMeetings.sort((a, b) =>
            new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
          ),
        });
      }
    }

    // Sort languages alphabetically
    languagesWithMeetings.sort((a, b) =>
      a.language.language.localeCompare(b.language.language)
    );

    return {
      monthStart: thirtyDaysAgo,
      monthEnd: now,
      totalMeetings: meetings.length,
      totalLanguages: languagesWithMeetings.length,
      languagesWithMeetings,
    };
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    throw error;
  }
}
