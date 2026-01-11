import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type TableName = 'scan_jobs' | 'diagnosis_reports' | 'simulation_results';

interface UseRealtimeNotificationOptions {
  table: TableName;
  userId: string | undefined;
  enabled?: boolean;
  queryKeysToInvalidate: string[][];
  successMessage: { title: string; description: string };
  failedMessage: { title: string; description: string };
  onStatusChange?: (newStatus: string, recordId: string) => void;
}

/**
 * Hook to subscribe to realtime status updates and show toast notifications
 * when tasks complete or fail.
 */
export function useRealtimeNotification({
  table,
  userId,
  enabled = true,
  queryKeysToInvalidate,
  successMessage,
  failedMessage,
  onStatusChange,
}: UseRealtimeNotificationOptions) {
  const queryClient = useQueryClient();
  const processedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !enabled) return;

    const channelName = `${table}_status_${userId}_${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
        },
        async (payload) => {
          const oldRecord = payload.old as Record<string, unknown>;
          const newRecord = payload.new as Record<string, unknown>;
          const recordId = newRecord.id as string;
          const newStatus = newRecord.status as string;
          const oldStatus = oldRecord.status as string;

          // Skip if already processed (prevent duplicate toasts)
          if (processedIds.current.has(`${recordId}_${newStatus}`)) {
            return;
          }

          // Only trigger on status transitions from processing/queued to completed/failed
          const wasProcessing = oldStatus === 'processing' || oldStatus === 'queued';
          const isNowComplete = newStatus === 'completed';
          const isNowFailed = newStatus === 'failed';

          if (!wasProcessing || (!isNowComplete && !isNowFailed)) {
            return;
          }

          // For tables that don't have user_id directly, we need to verify ownership
          // through related data. For now, we'll let RLS handle this.
          
          // Mark as processed
          processedIds.current.add(`${recordId}_${newStatus}`);

          // Invalidate queries to refresh data
          queryKeysToInvalidate.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });

          // Show appropriate toast
          if (isNowComplete) {
            toast({
              title: successMessage.title,
              description: successMessage.description,
              className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            });
          } else if (isNowFailed) {
            toast({
              title: failedMessage.title,
              description: failedMessage.description,
              variant: 'destructive',
            });
          }

          // Call optional callback
          onStatusChange?.(newStatus, recordId);
        }
      )
      .subscribe();

    // Cleanup processed IDs periodically to prevent memory issues
    const cleanupInterval = setInterval(() => {
      processedIds.current.clear();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, [userId, table, enabled, queryKeysToInvalidate, successMessage, failedMessage, onStatusChange, queryClient]);
}
