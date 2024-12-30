function parseTime(timeStr, today) {
    timeStr = timeStr.toLowerCase().trim();
    let hours = 0;
    let minutes = 0;

    // Handle more time formats
    const timePatterns = {
        wordNumbers: {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'noon': 12, 'midnight': 0
        },
        periods: {
            'morning': 9,
            'afternoon': 14,
            'evening': 18,
            'night': 20
        },
        relativeTime: {
            'in an hour': 1,
            'in two hours': 2,
            'in three hours': 3
        }
    };

    // Handle word numbers
    for (const [word, num] of Object.entries(timePatterns.wordNumbers)) {
        if (timeStr.includes(word)) {
            timeStr = timeStr.replace(word, num.toString());
        }
    }

    // Handle different time formats
    if (timeStr.includes(':')) {
        // Handle HH:MM format
        const [h, m] = timeStr.split(':');
        hours = parseInt(h);
        minutes = parseInt(m);
    } else if (timeStr.includes('hour')) {
        // Handle relative time (in X hours)
        const now = new Date();
        for (const [phrase, offset] of Object.entries(timePatterns.relativeTime)) {
            if (timeStr.includes(phrase)) {
                return new Date(now.getTime() + offset * 60 * 60 * 1000);
            }
        }
    } else if (Object.keys(timePatterns.periods).some(period => timeStr.includes(period))) {
        // Handle time periods (morning, afternoon, etc.)
        for (const [period, defaultHour] of Object.entries(timePatterns.periods)) {
            if (timeStr.includes(period)) {
                hours = defaultHour;
                break;
            }
        }
    } else {
        // Handle basic hour format
        hours = parseInt(timeStr);
    }

    // Adjust for AM/PM
    if (timeStr.includes('pm') || (!timeStr.includes('am') && hours > 0 && hours < 7)) {
        hours = hours % 12 + 12;
    } else if (timeStr.includes('am') && hours === 12) {
        hours = 0;
    }

    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function parseAppointments(inputText) {
    if (!inputText.trim()) return [];

    const today = new Date();
    const appointments = [];

    // Split by common conjunctions and punctuation
    const segments = inputText.toLowerCase()
        .replace(/[,;]/g, ' and ')
        .split(/\s+(?:and|then|after that|afterwards|later)\s+/);

    // More comprehensive time pattern
    const timePattern = /\b(?:at\s+)?(\d+(?::\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon|midnight|morning|afternoon|evening|night|in an hour|in two hours|in three hours)(?:\s*(?:am|pm))?\b/i;

    segments.forEach(segment => {
        const timeMatch = segment.match(timePattern);

        if (timeMatch) {
            const timeStr = timeMatch[1];
            const time = parseTime(timeStr, today);
            const fullSegment = segment;

            // Remove time-related parts from the segment
            let cleanSegment = fullSegment.replace(timeMatch[0], '');
            // Remove common time prepositions when they're at the start
            cleanSegment = cleanSegment.replace(/^(?:at|in|on|by)\s+/, '');
            // Remove common connecting words at the start
            cleanSegment = cleanSegment.replace(/^(?:then|and|,)\s+/, '');

            // Clean up common phrases while keeping the rest of the text intact
            let description = cleanSegment
                .replace(/(?:i(?:'m|'ll|\s+will|\s+have\s+to)*|going|to|have|got|need\s+to)\s+/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            // If the description ended up before the time expression, get it from there
            if (!description) {
                description = fullSegment
                    .slice(0, fullSegment.indexOf(timeMatch[0]))
                    .replace(/(?:i(?:'m|'ll|\s+will|\s+have\s+to)*|going|to|have|got|need\s+to)\s+/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            // Only capitalize if the description is all lowercase
            if (description === description.toLowerCase()) {
                description = description.charAt(0).toUpperCase() + description.slice(1);
            }

            // Estimate duration based on keywords
            let duration = 60; // default duration in minutes
            const durationKeywords = {
                'lunch': 60,
                'meeting': 60,
                'appointment': 30,
                'call': 30,
                'coffee': 30,
                'dinner': 90,
                'movie': 120,
                'concert': 180,
                'visit': 120
            };

            for (const [keyword, mins] of Object.entries(durationKeywords)) {
                if (description.toLowerCase().includes(keyword)) {
                    duration = mins;
                    break;
                }
            }

            if (description) {
                description = description.charAt(0).toUpperCase() + description.slice(1);
                appointments.push({
                    title: description,
                    time: time,
                    duration: duration
                });
            }
        }
    });

    return appointments.sort((a, b) => a.time - b.time);
}

// Export for use in main.js
window.parseAppointments = parseAppointments;
window.parseTime = parseTime;
