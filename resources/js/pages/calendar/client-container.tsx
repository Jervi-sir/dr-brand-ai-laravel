import { useMemo, useState, useEffect } from 'react';
import { format, parseISO, isSameDay, startOfDay, isSameMonth, isToday } from 'date-fns';
import { useCalendar } from './calendar-context';
import { IEvent, colorClasses } from './types';
import {
  getCalendarCells,
  calculateMonthEventPositions,
  getMonthCellEvents,
  navigateDate,
} from './helpers';
import { EventDetailsDialog } from './dialogs/event-details-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE_EVENTS = 3;

export function ClientContainer() {
  const { events, selectedDate, setSelectedDate } = useCalendar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (direction: 'previous' | 'next') => {
    setSelectedDate(navigateDate(selectedDate, direction));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        selectedDate={selectedDate}
        onNavigate={handleNavigate}
        onToday={handleToday}
      />
      <MonthView
        events={events}
        selectedDate={selectedDate}
        isMobile={isMobile}
        onDaySelect={(date) => setSelectedDate(date)}
      />
    </div>
  );
}

function CalendarHeader({
  selectedDate,
  onNavigate,
  onToday,
}: {
  selectedDate: Date;
  onNavigate: (direction: 'previous' | 'next') => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <CalendarIcon className="size-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{format(selectedDate, 'MMMM yyyy')}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('previous')}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function MonthView({
  events,
  selectedDate,
  isMobile,
  onDaySelect,
}: {
  events: IEvent[];
  selectedDate: Date;
  isMobile: boolean;
  onDaySelect: (date: Date) => void;
}) {
  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);
  const eventPositions = useMemo(
    () => calculateMonthEventPositions([], events, selectedDate),
    [events, selectedDate]
  );

  return (
    <div className="flex-1 overflow-hidden">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {DAY_LABELS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-muted-foreground uppercase"
          >
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((cell, idx) => (
          <MonthCell
            key={idx}
            cell={cell}
            events={events}
            eventPositions={eventPositions}
            selectedDate={selectedDate}
            isMobile={isMobile}
            onDaySelect={onDaySelect}
          />
        ))}
      </div>
    </div>
  );
}

function MonthCell({
  cell,
  events,
  eventPositions,
  selectedDate,
  isMobile,
  onDaySelect,
}: {
  cell: { day: number; currentMonth: boolean; date: Date };
  events: IEvent[];
  eventPositions: Record<string, number>;
  selectedDate: Date;
  isMobile: boolean;
  onDaySelect: (date: Date) => void;
}) {
  const cellEvents = useMemo(
    () => getMonthCellEvents(cell.date, events, eventPositions),
    [cell.date, events, eventPositions]
  );

  const visibleEvents = cellEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hasMore = cellEvents.length > MAX_VISIBLE_EVENTS;
  const today = isToday(cell.date);
  const isSelected = isSameDay(cell.date, selectedDate);

  return (
    <div
      className={cn(
        'min-h-[80px] md:min-h-[100px] border-b border-r p-1 cursor-pointer',
        'transition-colors',
        !cell.currentMonth && 'bg-muted/30',
        isSelected && 'bg-accent/20',
        'hover:bg-accent/10'
      )}
      onClick={() => onDaySelect(cell.date)}
    >
      <div className="flex items-center justify-between px-1">
        <span
          className={cn(
            'text-xs font-medium',
            !cell.currentMonth && 'text-muted-foreground/50',
            today &&
            'bg-primary text-primary-foreground rounded-full size-6 flex items-center justify-center text-center'
          )}
        >
          {cell.day}
        </span>
      </div>
      <div className="space-y-0.5 mt-1">
        {visibleEvents.map((event) => (
          <EventDetailsDialog key={event.id} event={event}>
            <button
              className={cn(
                'w-full text-left text-xs px-1.5 py-0.5 rounded truncate block',
                'transition-opacity hover:opacity-80',
                colorClasses[event.stage || ''] || colorClasses.default
              )}
              title={event.title}
              onClick={(e) => e.stopPropagation()}
            >
              {isMobile ? '•' : event.title}
            </button>
          </EventDetailsDialog>
        ))}
        {hasMore && (
          <span className="text-xs text-muted-foreground px-1">
            +{cellEvents.length - MAX_VISIBLE_EVENTS} more
          </span>
        )}
      </div>
    </div>
  );
}
