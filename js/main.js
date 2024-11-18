class Calendar{
    constructor(date = new Date()) {
        this.currentDate = date
        this.calGrid = document.querySelector('.calendar-grid');
        this.year = this.currentDate.getFullYear();
        this.month = this.currentDate.getMonth();

        this.firstOfMonth = new Date(this.year, this.month, 1).getDay();

        this.lastOfMonth = new Date(this.year, this.month + 1, 0).getDate();

        this.renderWeeks()
    }

    renderWeeks(){
        
        // remove any preloaded headers
        const headers = this.calGrid.querySelectorAll('.day-header, .task-column');
        this.calGrid.innerHTML = '';


        // put in new headers
        const taskHeader = document.createElement('div');
        taskHeader.classList.add('task-column');
        taskHeader.textContent = 'Weekly Tasks';
        this.calGrid.appendChild(taskHeader);


        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            this.calGrid.appendChild(dayHeader);
        })

        let dayCount = 1;

        // add weeks
        for (let week = 0; week < 6; week++) {
            const weeklyTasks = document.createElement('div');
            weeklyTasks.classList.add('task-task-cell');
            weeklyTasks.textContent = `Week ${week + 1}`;
            this.calGrid.appendChild(weeklyTasks);

            // add days to each week
            for (let day = 0; day < 7; day++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('calendar-day');
                
                if (week === 0 && day >= this.firstOfMonth || 
                    week > 0 && dayCount <= this.lastOfMonth){
                        dayCell.textContent = dayCount;
                        dayCount++
                }
                this.calGrid.appendChild(dayCell);
            }
        }
    }
}

const calendar = new Calendar()