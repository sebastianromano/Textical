// DOM Elements
const naturalInput = document.getElementById('natural-input');
const appointmentsContainer = document.getElementById('appointments-container');

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    card.innerHTML = `
        <div class="appointment-time">${formatTime(appointment.time)}</div>
        <div class="appointment-description">${appointment.title}</div>
        <div class="download-hint">Click to download →</div>
    `;
    card.addEventListener('click', () => ICalGenerator.downloadICSFile(appointment));
    return card;
}

function parseInput() {
    const input = naturalInput.value;
    const appointments = parseAppointments(input);
    
    appointmentsContainer.innerHTML = '';
    appointments.forEach(appointment => {
        appointmentsContainer.appendChild(createAppointmentCard(appointment));
    });
}

// Event Listeners
naturalInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        parseInput();
    }
});