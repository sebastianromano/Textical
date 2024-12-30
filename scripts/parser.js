function parseTime(timeStr, today) {
    timeStr = timeStr.toLowerCase().trim();
    let hours = 0;
    let minutes = 0;

    // Handle special time expressions
    const timeExpressions = {
        'quarter past': 15,
        'quarter to': -15,
        'half past': 30
    };

    // Check for special time expressions first
    for (const [expr, mins] of Object.entries(timeExpressions)) {
        if (timeStr.includes(expr)) {
            minutes = mins;
            timeStr = timeStr.replace(expr, '').trim();
            break;
        }
    }

    // Handle word numbers
    const wordToNum = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12
    };

    for (const [word, num] of Object.entries(wordToNum)) {
        if (timeStr.includes(word)) {
            timeStr = timeStr.replace(word, num.toString());
        }
    }

    // Handle time periods
    const timePeriods = {
        'morning': [5, 11],    // 5AM to 11AM
        'afternoon': [12, 17], // 12PM to 5PM
        'evening': [17, 22],   // 5PM to 10PM
        'night': [18, 23]      // 6PM to 11PM
    };

    for (const [period, [start, end]] of Object.entries(timePeriods)) {
        if (timeStr.includes(period)) {
            hours = start;
            break;
        }
    }

    // If no period was found, parse the time normally
    if (hours === 0) {
        if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':');
            hours = parseInt(h);
            minutes = parseInt(m);
        } else {
            const numMatch = timeStr.match(/\d+/);
            if (numMatch) {
                hours = parseInt(numMatch[0]);
            }
        }
    }

    // Smart AM/PM inference
    const isPM = timeStr.includes('pm') ||
        timeStr.includes('evening') ||
        timeStr.includes('night') ||
        timeStr.includes('dinner') ||
        (!timeStr.includes('am') && (hours < 7 || hours === 12));

    if (isPM && hours < 12) {
        hours += 12;
    } else if (!isPM && hours === 12) {
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

    // Split by conjunctions while preserving original text
    const segments = inputText.split(/\s*(?:,|\sand\s|,\s+then\s+|then\s+|afterwards\s+|after\s+that\s+)\s*/i)
        .filter(segment => segment.trim());

    // Enhanced time pattern including special expressions
    const timePattern = /\b(?:at\s+)?(\d+(?::\d+)?|quarter\s+(?:past|to)|half\s+past\s+\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?:\s*(?:am|pm))?\s*(?:in\s+the\s+(?:morning|afternoon|evening|night))?\b/i;

    segments.forEach(segment => {
        const timeMatch = segment.match(timePattern);

        if (timeMatch) {
            const timeStr = segment.slice(timeMatch.index);
            const time = parseTime(timeStr, today);

            // Get description by removing time-related parts
            let description = segment
                .replace(timeMatch[0], '')
                .replace(/^(?:at|in|on|by|then|and|,)\s+/i, '')  // Remove leading prepositions
                .replace(/\s*(?:in\s+the\s+(?:morning|afternoon|evening|night))\s*/i, '')  // Remove period references
                .replace(/(?:i(?:'m|'ll|\s+will|\s+have\s+to)*|going|to|have|got|need\s+to)\s+/g, '')
                .trim();

            // Only capitalize first letter if not already containing capitals
            if (description && !/[A-Z]/.test(description)) {
                description = description.charAt(0).toUpperCase() + description.slice(1);
            }

            // Estimate duration based on keywords
            let duration = 60;
            const durationKeywords = {
                'lunch': 60,
                'meeting': 60,
                'appointment': 30,
                'call': 30,
                'coffee': 30,
                'dinner': 90,
                'movie': 150,
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
