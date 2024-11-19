class Task{
    constructor(title, description){
        this.id = crypto.randomUUID(); //make a radndom id
        this.title = title;
        this.description = description;
        this.created = new Date(); // track when created
    }
}


class Day{
    constructor(date){
        this.date = date;
        this.tasks = new Map(); // tasks are accessed in map object
        this.element = null; // empty object when no tasks are present
    }

    addTask(task){
        this.tasks.set(task.id, task); // set any tasks to the specified day
        this.updateDisplay(); // show tasks in day
    }

    updateDisplay(){
        // check that the day is properly assigned to a DOM element (from Calendar.render())
        if(this.element){
            // create a new div to go in the element
            const taskList = document.createElement('div');
            taskList.classList.add('day-tasks');
            // put every item in the task list into the task list
            this.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task');
                taskEl.textContent = task.title;
                taskList.appendChild(taskEl);
            });


            // if a pre-existing task list is present, remove it
            const existing = this.element.querySelector('.day-tasks');
            if(existing) existing.remove();
            // append the newly updated task list to the day
            this.element.appendChild(taskList);
        }
    }

}


class Week{
    constructor(start){
        this.startDate = start;
        this.days = new Map(); // obj map for each week's days
        this.tasks = new Map(); // obj map for weekly tasks
        this.element = null; // empty object when there are no tasks
    }

    addTask(task){
        this.tasks.set(task.id, task); // set the tasks for the week to the obj map
        this.updateDisplay(); // show updated tasks
    }

    // same as day
    updateDisplay(){
        // check that the week is assigned to a DOM element (from Calendar.render())
        if(this.element){
            // create task list for the tasks 
            const taskList = document.createElement('div');
            taskList.classList.add('week-tasks');
            // put every item in the task list into the task list
            this.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task');
                taskEl.textContent = task.title;
                taskList.appendChild(taskEl);
            });

            // if a pre-existing task list is present, remove it
            const existing = this.element.querySelector('.week-tasks');
            if(existing) existing.remove();
            // append the newly updated task list to the week
            this.element.appendChild(taskList);
        }
    }
}




class Calendar {
    constructor(date = new Date()) {
        this.currentDate = date; // assign the date selected, or default = today
        this.calGrid = document.querySelector('.calendar-grid'); // get the physical calendar grid
        this.monthYearSpan = document.querySelector('.month-year'); // get the physical location for the month and year
        this.weeks = new Map(); // create an obj map for the weeks of the month
        this.setupNavigation(); // allow next/prev buttons
        this.render(); // render actual days of month
    }

    getWeekKey(date) {
        // week number, starting w min 1
        const week = Math.ceil(date.getDate() / 7);
        // return the date in yyyy-mm-week format
        return `${date.getFullYear()}-${date.getMonth()}-${week}`;
    }

    getDayKey(date){
        // return the date in yyyy-mm-dd format
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }

    setupNavigation() {
        document.querySelector('.prev-month').addEventListener('click', () => {
            // when prev button is hit, re-render -1 month
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.querySelector('.next-month').addEventListener('click', () => {
            // when next is hit, re-render +1 month
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    }

    render() {
        // takes current date or newly inputted date, sets the year and month
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        // get the first day of the month, adjust so weeks can start on mondays
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;
        // get the last day of the month
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        // set the year/month headers to selected date
        this.monthYearSpan.textContent = `${monthNames[month]} ${year}`;

        // clear grid
        this.calGrid.innerHTML = '';

        
        // add headers
        this.calGrid.appendChild(this.createHeader('Weekly Tasks'));
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
            this.calGrid.appendChild(this.createHeader(day));
        });
        
        // add calendar cells
        let dayCount = 1;


        // if there are only 5 weeks elapsed in the given month, dont show a 6th
        const totalWeeks = Math.ceil((firstDay + lastDate) / 7);
        for (let week = 0; week < totalWeeks; week++) {
            const weekStart = new Date(year, month, (week * 7) + 1 - firstDay);
            console.log(weekStart);
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