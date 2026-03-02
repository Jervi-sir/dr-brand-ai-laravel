import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { CalendarProvider } from './calendar-context';
import { ClientContainer } from './client-container';
import { IEvent } from './types';
import type { BreadcrumbItem } from '@/types';
import ChatLayout from '@/layouts/chat-layout/layout';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calendar', href: '/calendar' }];

export default function Page() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async (date: Date) => {
    const month = format(date, 'yyyy-MM');
    try {
      setIsLoading(true);
      const response = await axios.get(`/calendar/api/content?month=${month}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [format(selectedDate, 'yyyy-MM')]);

  return (
    <ChatLayout title="Calendar">
      <Head title="Calendar" />
      <div className="p-4 h-full">
        <CalendarProvider
          events={events}
          enableDnd={false}
          initialSelectedDate={selectedDate}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
            </div>
          ) : (
            <ClientContainer />
          )}
        </CalendarProvider>
      </div>
    </ChatLayout>
  );
}
