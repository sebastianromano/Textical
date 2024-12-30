class ICalGenerator {
    static formatICSDate(date) {
        return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    }

    static createICSContent(appointment) {
        const startTime = appointment.time;
        const endTime = new Date(startTime.getTime() + appointment.duration * 60000);
        
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${this.formatICSDate(startTime)}`,
            `DTEND:${this.formatICSDate(endTime)}`,
            `SUMMARY:${appointment.title}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');
    }

    static downloadICSFile(appointment) {
        const icsContent = this.createICSContent(appointment);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const filename = `${appointment.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        const message = document.getElementById('success-message');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}