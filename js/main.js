class Calendar {
    constructor(date = new Date()) {
        this.currentDate = date;
        this.calGrid = document.querySelector('.calendar-grid');
        this.monthYearSpan = document.querySelector('.month-year');
        this.setupNavigation();
        this.render();
    }

    setupNavigation() {
        document.querySelector('.prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.querySelector('.next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        this.monthYearSpan.textContent = `${monthNames[month]} ${year}`;

        // Clear grid
        this.calGrid.innerHTML = '';

        // Add headers
        this.calGrid.appendChild(this.createHeader('Weekly Tasks'));
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            this.calGrid.appendChild(this.createHeader(day));
        });

        // Add calendar cells
        let dayCount = 1;
        const totalWeeks = Math.ceil((firstDay + lastDate) / 7);

        for (let week = 0; week < totalWeeks; week++) {
            // Add weekly task cell
            const weeklyTask = document.createElement('div');
            weeklyTask.className = 'weekly-task-cell';
            weeklyTask.textContent = `Week ${week + 1}`;
            this.calGrid.appendChild(weeklyTask);

            // Add days
            for (let day = 0; day < 7; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';

                if ((week === 0 && day >= firstDay) || (dayCount <= lastDate)) {
                    const dateNumber = document.createElement('span');
                    dateNumber.className = 'date-number';
                    dateNumber.textContent = dayCount;
                    dayCell.appendChild(dateNumber);
                    dayCount++;
                }

                this.calGrid.appendChild(dayCell);
            }
        }
    }

    createHeader(text) {
        const header = document.createElement('div');
        header.className = text === 'Weekly Tasks' ? 'task-column' : 'day-header';
        header.textContent = text;
        return header;
    }
}

const calendar = new Calendar();