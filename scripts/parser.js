function parseTime(timeStr, today) {
    timeStr = timeStr.toLowerCase().trim();
    let hours = 0;
    
    if (timeStr.includes(':')) {
        const [h, m] = timeStr.split(':');
        hours = parseInt(h);
        minutes = parseInt(m);
    } else {
        // Convert word numbers to digits
        const wordToDigit = {
            'two': '2',
            'three': '3',
            'four': '4',
            'five': '5',
            'six': '6',
            'seven': '7',
            'eight': '8',
            'nine': '9',
            'ten': '10',
            'eleven': '11',
            'twelve': '12'
        };

        for (const [word, digit] of Object.entries(wordToDigit)) {
            if (timeStr.includes(word)) timeStr = digit;
        }
        
        hours = parseInt(timeStr);
    }

    // Adjust for PM times
    if (timeStr.includes('pm') || hours <= 6) {
        hours = hours % 12 + 12;
    }

    const date = new Date(today);
    date.setHours(hours, 0, 0, 0);
    return date;
}

function parseAppointments(inputText) {
    if (!inputText.trim()) return [];

    const today = new Date();
    const appointments = [];
    const segments = inputText.toLowerCase().split(/\s*and\s*/);
    
    segments.forEach(segment => {
        const timePattern = /\b(?:at\s+)?(\d+(?::\d+)?|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?:\s*(?:am|pm))?\b/i;
        const timeMatch = segment.match(timePattern);
        
        if (timeMatch) {
            const timeStr = timeMatch[1];
            const time = parseTime(timeStr, today);
            
            let description = segment
                .slice(segment.indexOf(timeMatch[0]) + timeMatch[0].length)
                .replace(/(?:i'(?:m|ll)|going|to)\s+/g, '')
                .trim();
            
            description = description.charAt(0).toUpperCase() + description.slice(1);
            
            appointments.push({
                title: description,
                time: time,
                duration: 60 // default duration in minutes
            });
        }
    });

    return appointments.sort((a, b) => a.time - b.time);
}