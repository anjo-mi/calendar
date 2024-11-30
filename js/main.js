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
        if (this.tasks.size > 0){
            this.element.style.backgroundColor = RED;
        }else{
            this.element.style.backgroundColor = BLUE
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
        if(this.tasks.size > 0){
            this.element.style.backgroundColor = YELLOW;
            this.days.forEach(day => {
                if (day.element){
                    if (day.tasks.size > 0){
                        day.element.style.backgroundColor = RED;
                    }else{
                        day.element.style.backgroundColor = YELLOW;
                    }
                }
            });
        }else{
            this.element.style.backgroundColor = 'white'
            this.days.forEach(day => {
                if (day.element){
                    if (day.tasks.size > 0){
                        day.element.style.backgroundColor = RED;
                    }else{
                        day.element.style.backgroundColor = BLUE;
                    }
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
        this.setupModal();
        this.setupModalButtons();
        this.render(); // render actual days of month
    }

    getWeekKey(date) {
        // create new date to avoid fucking up inputs again

        const tempDate = new Date(date);

        // find monday from selected date
        const day = tempDate.getDay();
        const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
        tempDate.setDate(diff);

        // return mondays date as week key
        return `${tempDate.getFullYear()}-${tempDate.getMonth()}-${tempDate.getDate()}`
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
        this.titleInput = document.getElementById('taskTitle');
        this.descInput = document.getElementById('taskDescription');
        this.currentCallback = null;


        // keydown handlers for modal inputs
        [this.titleInput, this.descInput].forEach(input => {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    const submitEvent = new Event('submit', {
                        cancelable: true,
                        bubbles: true
                    });
                    this.taskForm.dispatchEvent(submitEvent);
                };
            })
        })

        this.taskForm.addEventListener('submit', e =>{
            e.preventDefault();
            const title = this.titleInput.value;
            const description = this.descInput.value || 'seat of the pants';

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

    setupModalButtons(){
        const addDailyTaskBtn = document.getElementById('addDailyTask');
        const weekTaskFromDayBtn = document.getElementById('weekTaskFromDay');
        const addWeeklyTaskBtn = document.getElementById('addWeeklyTask');

        this.currentViewDate = null;

        addDailyTaskBtn.addEventListener('click', () => {
            // hide the day view modal
            document.getElementById('dayViewModal').style.display = 'none';

            // show the add-task modal
            this.showModal((title,description) => {
                const task = new Task(title, description);
                this.addDayTask(this.currentViewDate, task);
                this.render();
                this.showDayView(this.currentViewDate);
            });
        });

        weekTaskFromDayBtn.addEventListener('click', () => {
            // hide the day view modal
            document.getElementById('dayViewModal').style.display = 'none';

            // get start of week from current day
            const weekStart = new Date(this.currentViewDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
            // show the add-weekly-task modal
            this.showModal((title,description) => {
                const task = new Task(title, description);
                this.addWeekTask(weekStart, task);

                this.render();
                const viewDate = new Date(this.currentViewDate);

                
                // update day view and show it again
                this.showDayView(viewDate);
            });
        });


        addWeeklyTaskBtn.addEventListener('click', () => {
            // hide the week view modal
            document.getElementById('weekViewModal').style.display = 'none';

            this.showModal((title,description) => {
                const task = new Task(title, description);
                this.addWeekTask(this.currentViewDate, task);
                // update week-view and show it again
                this.render();
                this.showWeekView(this.currentViewDate);
            })
        });
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

    showDayView(date){
        const dayViewModal = document.getElementById('dayViewModal');
        const dayViewDate = document.getElementById('dayViewDate');
        const dayViewDateSpan = document.getElementById('dayViewDateSpan');
        const dayViewWeekNum = document.getElementById('dayViewWeekNum');
        const dayViewWeekSpan = document.getElementById('dayViewWeekSpan');
        const dayViewDailyTasks = document.getElementById('dayViewDailyTasks');
        const dayViewWeeklyTasks = document.getElementById('dayViewWeeklyTasks');
        const closeDayView = document.getElementById('closeDayView');
        this.currentViewDate = date;

        // format for date display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = date.toLocaleString(undefined, options);

        // get week #
        const weekKey = this.getWeekKey(date);
        const weekNum = parseInt(weekKey.split('-')[2], 10);

        // get tasks
        const dayKey = this.getDayKey(date);
        const week = this.weeks.get(weekKey);

        // update modal content
        dayViewDate.textContent = dateStr;
        dayViewDateSpan.textContent = dateStr;
        dayViewWeekNum.textContent = weekNum;
        dayViewWeekSpan.textContent = `${date.toLocaleDateString(undefined, { month: 'long' })} Week ${weekNum}`;

        // clear previous
        dayViewDailyTasks.innerHTML = '';
        dayViewWeeklyTasks.innerHTML = '';

        // add daily tasks
        if (week && week.days.has(dayKey)){
            const day = week.days.get(dayKey);
            day.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task-item');
// TODO??? add description box
                taskEl.textContent = task.title;
                dayViewDailyTasks.appendChild(taskEl);
            });
        }

        // add weekly tasks
        if (week){
            week.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task-item');
// TODO??? add description box
                taskEl.textContent = task.title;
                dayViewWeeklyTasks.appendChild(taskEl);
            });
        }

        // show modal
        dayViewModal.style.display = 'flex';

        // close button handler
        closeDayView.onclick = () => dayViewModal.style.display = 'none';

        // escape key handler
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') dayViewModal.style.display = 'none';
        });

        // close on escape
        dayViewModal.onclick = (e) => {
            if (e.target === dayViewModal) dayViewModal.style.display = 'none';
        }
    }


    showWeekView(weekStart){
        const weekViewModal = document.getElementById('weekViewModal');
        const weekViewNum = document.getElementById('weekViewNum');
        const weekViewSpan = document.getElementById('weekViewSpan');
        const weekViewWeeklyTasks = document.getElementById('weekViewWeeklyTasks');
        const weekViewDailyTasks = document.getElementById('weekViewDailyTasks');
        const closeWeekView = document.getElementById('closeWeekView');
        this.currentViewDate = weekStart;

        // get week info
        const weekKey = this.getWeekKey(weekStart);
        const weekNum = parseInt(weekKey.split('-')[2], 10);
        const week = this.weeks.get(weekKey);

        // calculate week date range
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6);
        const dateRangeStr = `${weekStart.toLocaleDateString()} ${weekEnd.toLocaleDateString()}`;

        // update modal content
        weekViewNum.textContent = weekNum;
        weekViewSpan.textContent = dateRangeStr;

        // clear previous
        weekViewWeeklyTasks.innerHTML = '';
        weekViewDailyTasks.innerHTML = '';

        // add weekly tasks
        if (week){
            week.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.classList.add('task-item');
// TODO??? add description box
                taskEl.textContent = task.title;
                weekViewWeeklyTasks.appendChild(taskEl);
            });

            // add daily tasks
            week.days.forEach(day => {
                day.tasks.forEach(task => {
                    const taskEl = document.createElement('div');
                    taskEl.classList.add('task-item');
// TODO??? add description box
                    taskEl.textContent = `${day.date.toLocaleDateString()}: ${task.title}`;
                    weekViewDailyTasks.appendChild(taskEl);
                });
            });
        }

        // show modal
        weekViewModal.style.display = 'flex';

        // close button handler
        closeWeekView.onclick = () => weekViewModal.style.display = 'none';

        // escape key handler
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') weekViewModal.style.display = 'none';
        });

        // close on escape
        weekViewModal.onclick = (e) => {
            if (e.target === weekViewModal) weekViewModal.style.display = 'none';
        }
    }


    listeners(){
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const today = parseInt(day.getAttribute('day'),10);
                const clickedDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), today);
                this.showDayView(clickedDay);
            });
        });

        document.querySelectorAll('.weekly-task-cell').forEach(week => {
            week.addEventListener('click', () => {
                const thisWeek = parseInt(week.getAttribute('week'),10);
                
                const firstOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
                let firstsDayPosition = firstOfMonth.getDay();
                firstsDayPosition = firstsDayPosition === 0 ? 6 : firstsDayPosition - 1;

                const firstWeekStart = new Date(firstOfMonth);
                firstWeekStart.setDate(1 - firstsDayPosition);

                const weekStart = new Date(firstWeekStart);
                weekStart.setDate(firstWeekStart.getDate() + (thisWeek * 7));

                this.showWeekView(weekStart);
            });
        })

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