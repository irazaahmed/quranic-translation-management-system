import { Meeting } from "@/lib/supabase";
import MeetingActions from "@/app/meetings/MeetingActions";

interface MeetingCardProps {
  meeting: Meeting;
  formattedDate: string;
}

export default function MeetingCard({ meeting, formattedDate }: MeetingCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 transition-colors duration-200">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 transition-colors duration-200">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200">
              {formattedDate}
            </h4>
            {meeting.participants && (
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Participants:</span> {meeting.participants}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Discussion Points */}
        {meeting.discussion_points && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Discussion Points</h5>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap transition-colors duration-200">
              {meeting.discussion_points}
            </div>
          </div>
        )}

        {/* Next Action */}
        {meeting.action_items && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Next Action</h5>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap transition-colors duration-200">
              {meeting.action_items}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <MeetingActions
          meetingId={meeting.id}
          languageId={meeting.language_id}
        />
      </div>
    </div>
  );
}
