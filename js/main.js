const YELLOW = 'rgba(255, 255, 0, 0.4)';
const GREEN = 'rgba(0, 255, 0, 0.4)';
const RED = 'rgba(255, 0, 0, 0.4)';
const BLUE = 'rgba(0, 0, 255, 0.4)';




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
        this.tasks = new Map(); // stores daily tasks, with id as key
        this.element = null; // references DOM element, null when not rendered
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

// TODO: daily elements revert to blue if the day has no tasks, even if the week does
        if (this.element){
            this.element.style.backgroundColor = this.tasks.size > 0 ? RED : BLUE;
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
        if(this.element){
            // if there are tasks in the week, switch the background color of the week
            if(this.tasks.size > 0){
                this.element.style.backgroundColor = YELLOW; // semi transparent yellow
            } else {
                this.element.style.backgroundColor = 'white'; // reset background
            }
            // change the background of each day in the week
            this.days.forEach(day => {
                if(this.tasks.size > 0 && day.element.style.backgroundColor !== RED){
                    day.element.style.backgroundColor = YELLOW;
                }
            });
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

    setupModal(){
        this.modal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.cancelButton = document.getElementById('cancelTask');
        this.currentCallback = null;

        this.taskForm.addEventListener('submit', e =>{
            e.preventDefault();
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value || 'seat of the pants';

            if (this.currentCallback){
                this.currentCallback(title, description);
            }
            this.hideModal();
        });

        // cancel button functionality
        this.cancelButton.addEventListener('click', () => this.hideModal());

        // close modal when clicking outside
        this.modal.addEventListener('click', e => {
            if (e.target === this.modal) this.hideModal();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.hideModal();
        })
    }

    showModal(callback){
        this.currentCallback = callback;
        this.modal.style.display = 'flex';
        this.taskForm.reset();
    }

    hideModal(){
        this.modal.style.display = 'none';
        this.currentCallback = null;
    }


    listeners(){
        if (!this.modal) this.setupModal();

        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const today = parseInt(day.getAttribute('day'),10);
                const clickedDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), today);

                this.showModal((title, description) => {
                   const task = new Task(title, description);
                   this.addDayTask(clickedDay, task); 
                });
            });
        });
        document.querySelectorAll('.weekly-task-cell').forEach(week => {
            week.addEventListener('click', () => {
                const thisWeek = parseInt(week.getAttribute('week'),10) -1;
                const weekStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
                weekStart.setDate(weekStart.getDate() + (thisWeek * 7));

                this.showModal((title, description) => {
                    const task = new Task(title, description);
                    this.addWeekTask(weekStart, task);
                });
            });
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
            // multiply week start by 7 to increment weeks, add one since its 0-indexed, subtract first day's index
            const weekStart = new Date(year, month, (week * 7) + 1 - firstDay);
            // create a week key for each start of week
            const weekKey = this.getWeekKey(weekStart);

            // create and/or retrieve week
            if (!this.weeks.has(weekKey)){
                this.weeks.set(weekKey, new Week(weekStart));
            }
            // get the key from each specific week
            const weekObj = this.weeks.get(weekKey);
            

            // create weekly task cells
            const weeklyTask = document.createElement('div');
            weeklyTask.classList.add('weekly-task-cell');
            weeklyTask.setAttribute('week', week);
            // add weekly tasks to each specific week
            weekObj.element = weeklyTask;
            weekObj.updateDisplay(); // update the display
            // put the weekly tasks on the grid
            this.calGrid.appendChild(weeklyTask);
            
            
            // for each week, add 7 days
            for (let day = 0; day < 7; day++) {
                const dayCell = document.createElement('div');
                
                
                
                // first week: only give days after month has started
                // subsequent weeks: only show days before end of month
                if ((week === 0 && day >= firstDay) || (week > 0 &&dayCount <= lastDate)) {
                    dayCell.classList.add('calendar-day');
                    dayCell.setAttribute('day', dayCount);
                    // create a new date for each day
                    const currentDay = new Date(year,month, dayCount);
                    // get the key of each day
                    const dayKey = this.getDayKey(currentDay);

                    // if the days inside the week object dont already have a key, make it
                    if(!weekObj.days.has(dayKey)){
                        weekObj.days.set(dayKey, new Day(currentDay));

                    }
                    // get each day object
                    const dayObj = weekObj.days.get(dayKey);

                    // give each dayCell the correct number and class specified to it
                    const dateNumber = document.createElement('span');
                    dateNumber.classList.add('date-number');
                    dateNumber.textContent = dayCount;
                    dayCell.appendChild(dateNumber);


                    // add day cell's tasks to day obj and update display
                    dayObj.element = dayCell;
                    dayObj.updateDisplay();
                    
                    // incrememnt day for next loop thru days
                    dayCount++;
                }
                // add the day cells to the grid
                this.calGrid.appendChild(dayCell);
            }
        }
        this.listeners();
    }

    addDayTask(date, task){
        // get proper keys
        const dayKey = this.getDayKey(date);
        const weekKey = this.getWeekKey(date);
        const week = this.weeks.get(weekKey);
        // if the week exists and has days inside it, get the key for the day and add the task
        if (week && week.days.has(dayKey)){
            week.days.get(dayKey).addTask(task);
        }
    }

    addWeekTask(date, task){
        // get proper keys
        const weekKey = this.getWeekKey(date);
        const week = this.weeks.get(weekKey);
        // if the week (key) exists, add the task
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