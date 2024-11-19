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
            if(existing) existing.remove();

            this.element.appendChild(taskList);
        }
    }

}


class Week{
    constructor(start){
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
            if(existing) existing.remove();

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
        
// dont forget, remember to place back in if grid is misaligned
        // this.calGrid.style.gridTemplateRows = `auto repeat(${totalWeeks}, minmax(2rem, 1fr))`

        for (let week = 0; week < totalWeeks; week++) {
            const weekStart = new Date(year, month, (week * 7) + 1 - firstDay);
            const weekKey = this.getWeekKey(weekStart);

            // create and/or retrieve week
            if (!this.weeks.has(weekKey)){
                this.weeks.set(weekKey, new Week(weekStart));
            }
            const weekObj = this.weeks.get(weekKey);
            

            // create weekly task cells
            const weeklyTask = document.createElement('div');
            weeklyTask.classList.add('weekly-task-cell');
            weekObj.element = weeklyTask;
            weekObj.updateDisplay();
            this.calGrid.appendChild(weeklyTask);
            
            
            // Add days
            for (let day = 0; day < 7; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-day';

                if ((week === 0 && day >= firstDay) || (week > 0 &&dayCount <= lastDate)) {
                    const currentDay = new Date(year,month, dayCount);
                    const dayKey = this.getDayKey(currentDay);

                    // create and/or retrieve days
                    if(!weekObj.days.has(dayKey)){
                        weekObj.days.set(dayKey, new Day(currentDay));

                    }
                    const dayObj = weekObj.days.get(dayKey);


                    const dateNumber = document.createElement('span');
                    dateNumber.className = 'date-number';
                    dateNumber.textContent = dayCount;
                    dayCell.appendChild(dateNumber);

                    dayObj.element = dayCell;
                    dayObj.updateDisplay();

                    dayCount++;
                }

                this.calGrid.appendChild(dayCell);
            }
        }
    }

    addDayTask(date, task){
        const dayKey = this.getDayKey(date);
        const weekKey = this.getWeekKey(date);
        const week = this.weeks.get(weekKey);

        if (week && week.days.has(dayKey)){
            week.days.get(dayKey).addTask(task);
        }
    }

    addWeekTask(date, task){
        const weekKey = this.getWeekKey(date);
        const week = this.weeks.get(weekKey);
        if (week) week.addTask(task);
    }


    createHeader(text) {
        const header = document.createElement('div');
        header.className = text === 'Weekly Tasks' ? 'task-column' : 'day-header';
        header.textContent = text;
        return header;
    }
}

const calendar = new Calendar();