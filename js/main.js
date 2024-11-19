class Task{
    constructor(title, description){
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.created = new Date();
    }
}


class Day{
    constructor(date){
        this.date = date;
        this.tasks = new Map();
        this.element = null;
    }

    addTask(task){
        this.tasks.set(task.id, task);
        this.updateDisplay();
    }

    updateDisplay(){
        if(this.element){
            const taskList = document.createElement('div');
            taskList.classList.add('day-tasks');
            this.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task');
                taskEl.textContent = task.title;
                taskList.appendChild(taskEl);
            });



            const existing = this.element.querySelector('.day-tasks');
// pretty sure i wont wana leave the removal in
            // if(existing) existing.remove();

            this.element.appendChild(taskList);
        }
    }

}


class Week{
    construcotr(start){
        this.startDate = start;
        this.days = new Map();
        this.tasks = new Map();
        this.element = null;
    }

    addTask(task){
        this.tasks.set(task.id, task);
        this.updateDisplay();
    }

    updateDisplay(){
        if(this.element){
            const taskList = document.createElement('div');
            taskList.classList.add('week-tasks');
            this.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task');
                taskEl.textContent = task.title;
                taskList.appendChild(taskEl);
            });

            const existing = this.element.querySelector('.week-tasks');

// same as days, pretty sure i dont want this here
            // if(existing) existing.remove();

            this.element.appendChild(taskList);
        }
    }
}




class Calendar {
    constructor(date = new Date()) {
        this.currentDate = date;
        this.calGrid = document.querySelector('.calendar-grid');
        this.monthYearSpan = document.querySelector('.month-year');
        this.weeks = new Map();
        this.setupNavigation();
        this.render();
    }

    getWeekKey(date) {
        const week = Math.ceil(date.getDate() / 7);
        return `${date.getFullYear()}-${date.getMonth()}-${week}`;
    }

    getDayKey(date){
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
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
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        this.monthYearSpan.textContent = `${monthNames[month]} ${year}`;

        // Clear grid
        this.calGrid.innerHTML = '';

        
        // Add headers
        this.calGrid.appendChild(this.createHeader('Weekly Tasks'));
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
            this.calGrid.appendChild(this.createHeader(day));
        });
        
        // Add calendar cells
        let dayCount = 1;
        
        const totalWeeks = Math.ceil((firstDay + lastDate) / 7);
        
        this.calGrid.style.gridTemplateRows = `auto repeat(${totalWeeks}, minmax(2rem, 1fr))`

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

                if ((week === 0 && day >= firstDay) || (week > 0 &&dayCount <= lastDate)) {
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