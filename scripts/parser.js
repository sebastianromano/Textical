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

    // Handle time periods first
    const timePeriods = {
        'morning': { start: 5, end: 11, default: 9 },
        'afternoon': { start: 12, end: 17, default: 14 },
        'evening': { start: 17, end: 22, default: 19 },
        'night': { start: 18, end: 23, default: 20 }
    };

    let periodFound = false;
    for (const [period, times] of Object.entries(timePeriods)) {
        if (timeStr.includes(period)) {
            hours = times.default;
            periodFound = true;
            break;
        }
    }

    // Check for quarter past/to expressions
    let quarterExpression = false;
    for (const [expr, mins] of Object.entries(timeExpressions)) {
        if (timeStr.includes(expr)) {
            minutes = mins;
            if (minutes < 0) {
                minutes += 60;
                hours -= 1;
            }
            quarterExpression = true;
            timeStr = timeStr.replace(expr, '').trim();
            break;
        }
    }

    if (!periodFound && !quarterExpression) {
        // Handle word numbers
        const wordToNum = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'noon': 12, 'midnight': 0
        };

        for (const [word, num] of Object.entries(wordToNum)) {
            if (timeStr.includes(word)) {
                timeStr = timeStr.replace(word, num.toString());
            }
        }

        // Parse the time
        if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':');
            hours = parseInt(h);
            if (!quarterExpression) minutes = parseInt(m);
        } else {
            const numMatch = timeStr.match(/\d+/);
            if (numMatch) {
                hours = parseInt(numMatch[0]);
            }
        }
    }

    // Smart AM/PM inference
    const pmKeywords = ['pm', 'evening', 'night', 'dinner', 'late', 'afternoon'];
    const isPM = pmKeywords.some(keyword => timeStr.includes(keyword)) ||
        (!timeStr.includes('am') && !timeStr.includes('morning') && (hours < 7 || hours === 12));

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

    // Enhanced time pattern
    const timePattern = /\b(?:at\s+)?(\d+(?::\d+)?|quarter\s+(?:past|to)|half\s+past\s+\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon|midnight)(?:\s*(?:am|pm))?\s*(?:in\s+the\s+(?:morning|afternoon|evening|night))?\b/i;

    segments.forEach(segment => {
        const timeMatch = segment.match(timePattern);

        if (timeMatch) {
            const fullTimeStr = segment.slice(timeMatch.index);
            const time = parseTime(fullTimeStr, today);

            // Get description by removing time-related parts
            let description = segment
                .replace(timeMatch[0], '')
                .replace(/^(?:at|in|on|by|then|and|,)\s+/i, '')
                .replace(/\s*(?:in\s+the\s+(?:morning|afternoon|evening|night))\s*/i, '')
                .replace(/(?:i(?:'m|'ll|\s+will|\s+have\s+to)*|going|to|have|got|need\s+to)\s+/g, '')
                .trim();

            // Preserve original text case
            if (description) {
                // Only capitalize first letter if the original text was all lowercase
                const originalDescription = description;
                if (!/[A-Z]/.test(originalDescription.slice(1))) {
                    description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
                }
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
                'visit': 120,
                'snack': 30
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
