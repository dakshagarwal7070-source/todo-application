const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');
const undoMessage = document.getElementById('undo-message');
const undoButton = document.getElementById('undo-button');
const undoCountdown = document.getElementById('undo-countdown');

// Load the saved tasks when the page opens.
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deletedTask = null;
let deletedTaskNumber = 0;
let countdownTimer;
let hideMessageTimer;

// Clear the list and draw it again after each change.
function showTasks() {
  taskList.innerHTML = '';
  taskCount.textContent = tasks.length;

  if (tasks.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  // Add one row for each task.
  for (let taskNumber = 0; taskNumber < tasks.length; taskNumber++) {
    const task = tasks[taskNumber];
    const row = document.createElement('li');
    row.className = 'task-row';
    if (task.completed) {
      row.className = 'task-row is-done';
    }

    const doneButton = document.createElement('button');
    doneButton.className = 'task-toggle';
    doneButton.type = 'button';
    if (task.completed) {
      doneButton.className = 'task-toggle is-done';
      doneButton.textContent = 'Undo';
    } else {
      doneButton.textContent = 'Mark done';
    }

    // Mark the task done, or change it back to not done.
    doneButton.addEventListener('click', function () {
      task.completed = !task.completed;
      showTasks();
    });

    const taskName = document.createElement('span');
    taskName.className = 'task-text';
    taskName.textContent = task.name;

    const buttons = document.createElement('div');
    buttons.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'row-button';
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    // Ask for a new name and update the task.
    editButton.addEventListener('click', function () {
      const newName = prompt('Edit this task:', task.name);
      if (newName !== null) {
        const cleanName = newName.trim();
        if (cleanName !== '') {
          task.name = cleanName;
          showTasks();
        }
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'row-button delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    
    // Remove this task from the array.
    deleteButton.addEventListener('click', function () {
      if (confirm('Delete "' + task.name + '"?')) {
        clearInterval(countdownTimer);
        clearTimeout(hideMessageTimer);

        deletedTask = task;
        deletedTaskNumber = taskNumber;
        tasks.splice(taskNumber, 1);
        showTasks();

        let secondsLeft = 5;
        undoCountdown.textContent = secondsLeft;
        undoButton.disabled = false;
        undoMessage.style.display = 'flex';

        // Update the countdown once each second.
        countdownTimer = setInterval(function () {
          secondsLeft = secondsLeft - 1;
          undoCountdown.textContent = secondsLeft;

          if (secondsLeft === 0) {
            clearInterval(countdownTimer);
            undoButton.disabled = true;

            hideMessageTimer = setTimeout(function () {
              undoMessage.style.display = 'none';
              deletedTask = null;
              undoButton.disabled = false;
            }, 700);
          }
        }, 1000);
      }
    });

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);
    row.appendChild(doneButton);
    row.appendChild(taskName);
    row.appendChild(buttons);
    taskList.appendChild(row);
  }

  // Save the tasks in the browser.
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Put the task back if Undo is clicked in time.
undoButton.addEventListener('click', function () {
  if (deletedTask !== null) {
    clearInterval(countdownTimer);
    clearTimeout(hideMessageTimer);
    tasks.splice(deletedTaskNumber, 0, deletedTask);
    deletedTask = null;
    undoMessage.style.display = 'none';
    undoButton.disabled = false;
    showTasks();
  }
});

// Add a new task when the form is submitted.
taskForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const taskName = taskInput.value.trim();
  if (taskName === '') {
    return;
  }

  // Add the task with a name and a completion status.
  tasks.push({
    name: taskName,
    completed: false
  });

  taskInput.value = '';
  showTasks();
});

showTasks();
