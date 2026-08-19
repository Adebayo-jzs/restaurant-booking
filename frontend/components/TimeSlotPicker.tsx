import { Availability, TimeSlot } from '@/lib/types';

interface TimeSlotPickerProps {
  availabilities?: Availability[];
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

export default function TimeSlotPicker({
  availabilities = [],
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: TimeSlotPickerProps) {
  // If no availabilities are returned, generate sample dates for demo/fallback
  const hasAvailabilities = availabilities && availabilities.length > 0;

  const currentAvailability = availabilities.find(
    (a) => a.date.split('T')[0] === selectedDate.split('T')[0]
  );

  const availableSlots: TimeSlot[] = currentAvailability?.timeSlots || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Date Selector Tabs */}
      <div>
        <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
          Select Reservation Date
        </label>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {hasAvailabilities ? (
            availabilities.map((avail) => {
              const dateObj = new Date(avail.date);
              const dateStr = avail.date.split('T')[0];
              const isSelected = selectedDate.split('T')[0] === dateStr;
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <button
                  key={avail.date}
                  type="button"
                  onClick={() => {
                    onSelectDate(avail.date);
                    // Reset selected time when date changes
                    if (avail.timeSlots.length > 0) {
                      onSelectTime(avail.timeSlots[0].time);
                    } else {
                      onSelectTime('');
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    minWidth: '85px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {dayName}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: isSelected ? 'var(--accent-gold)' : '#fff' }}>
                    {monthDay}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {avail.timeSlots.length} slots
                  </span>
                </button>
              );
            })
          ) : (
            <div
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No upcoming time slots listed for this restaurant yet.
            </div>
          )}
        </div>
      </div>

      {/* 2. Time Slot Grid */}
      {hasAvailabilities && (
        <div>
          <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
            Select Time Slot
          </label>

          {availableSlots.length === 0 ? (
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-rose)',
                fontSize: '0.9rem',
              }}
            >
              All time slots for this date are currently fully booked or closed.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onSelectTime(slot.time)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                      color: isSelected ? '#0f172a' : '#fff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>{slot.time}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: isSelected ? '#0f172a' : 'var(--accent-emerald)',
                      }}
                    >
                      {slot.capacity} seats left
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
