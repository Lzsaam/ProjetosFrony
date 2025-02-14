document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const toggleCompletedButton = document.getElementById('toggle-completed');
    const clearCompletedButton = document.getElementById('clear-completed');
    const progressBar = document.querySelector('.progress');
    const progressText = document.getElementById('progress-text');
    const filterButtons = document.querySelectorAll('.filter-button');
    const notification = document.getElementById('notification');
    const deleteNotification = document.getElementById('delete-notification');
    const editNotification = document.getElementById('edit-notification');
    const taskCount = document.getElementById('task-count');
    const prioritySelect = document.getElementById('priority');
    const searchTaskInput = document.getElementById('search-task');
    const sortTasksSelect = document.getElementById('sort-tasks');
    const markAllCompletedButton = document.getElementById('mark-all-completed');
    const unmarkAllCompletedButton = document.getElementById('unmark-all-completed');
    const deleteAllTasksButton = document.getElementById('delete-all-tasks');
    const editAllTasksButton = document.getElementById('edit-all-tasks');
    const exportTasksButton = document.getElementById('export-tasks');
    const importTasksButton = document.getElementById('import-tasks');
    const duplicateAllTasksButton = document.getElementById('duplicate-all-tasks');
    let showCompleted = true;

    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task));
        updateProgress();
        updateTaskCount();
    };

    const saveTasks = () => {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('span').textContent,
                completed: taskItem.classList.contains('completed'),
                date: taskItem.dataset.date,
                priority: taskItem.dataset.priority
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
        updateTaskCount();
    };

    const addTaskToDOM = (task) => {
        const taskItem = document.createElement('li');
        taskItem.style.animation = 'addTask 0.5s forwards';

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskItem.appendChild(taskText);

        const taskDate = document.createElement('small');
        taskDate.textContent = ` (${new Date(task.date).toLocaleDateString()})`;
        taskItem.appendChild(taskDate);

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge ${task.priority}`;
        priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        taskItem.appendChild(priorityBadge);

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit edit-button"></i>';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const newText = prompt('Editar tarefa:', taskText.textContent);
            const newPriority = prompt('Editar prioridade (low, medium, high):', task.priority);
            if (newText && newPriority) {
                taskText.textContent = newText;
                task.priority = newPriority;
                priorityBadge.className = `priority-badge ${newPriority}`;
                priorityBadge.textContent = newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
                saveTasks();
                showEditNotification();
            }
        });
        taskItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                taskItem.style.animation = 'slideToTrash 0.5s forwards';
                setTimeout(() => {
                    taskItem.remove();
                    saveTasks();
                    showDeleteNotification();
                }, 500);
            }
        });
        taskItem.appendChild(deleteButton);

        taskItem.addEventListener('click', () => {
            taskItem.classList.toggle('completed');
            taskItem.style.animation = 'completeTask 0.3s';
            saveTasks();
        });

        if (task.completed) {
            taskItem.classList.add('completed');
        }

        taskItem.dataset.date = task.date || new Date().toISOString();
        taskItem.dataset.priority = task.priority || 'low';
        taskList.appendChild(taskItem);
    };

    const updateProgress = () => {
        const tasks = taskList.querySelectorAll('li');
        const completedTasks = taskList.querySelectorAll('li.completed');
        const progress = tasks.length ? (completedTasks.length / tasks.length) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% concluído`;

        if (progress === 100) {
            progressBar.style.backgroundColor = '#4caf50';
            showNotification();
        } else {
            progressBar.style.backgroundColor = '#CA8E82';
        }
    };

    const updateTaskCount = () => {
        const totalTasks = taskList.querySelectorAll('li').length;
        const activeTasks = taskList.querySelectorAll('li:not(.completed)').length;
        const completedTasks = taskList.querySelectorAll('li.completed').length;
        taskCount.textContent = `Total: ${totalTasks} | Ativas: ${activeTasks} | Concluídas: ${completedTasks}`;
    };

    const showNotification = () => {
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    };

    const showDeleteNotification = () => {
        deleteNotification.style.display = 'block';
        setTimeout(() => {
            deleteNotification.style.display = 'none';
        }, 3000);
    };

    const showEditNotification = () => {
        editNotification.style.display = 'block';
        setTimeout(() => {
            editNotification.style.display = 'none';
        }, 3000);
    };

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (taskText) {
            const task = { text: taskText, completed: false, date: new Date().toISOString(), priority: priority };
            addTaskToDOM(task);
            saveTasks();
            taskInput.value = '';
        }
    });

    toggleCompletedButton.addEventListener('click', () => {
        showCompleted = !showCompleted;
        taskList.querySelectorAll('li.completed').forEach(taskItem => {
            taskItem.style.display = showCompleted ? 'flex' : 'none';
        });
        toggleCompletedButton.textContent = showCompleted ? 'Ocultar Tarefas Concluídas' : 'Exibir Tarefas Concluídas';
    });

    clearCompletedButton.addEventListener('click', () => {
        taskList.querySelectorAll('li.completed').forEach(taskItem => {
            taskItem.remove();
        });
        saveTasks();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTasks(button.id);
        });
    });

    const filterTasks = (filter) => {
        const tasks = taskList.querySelectorAll('li');
        tasks.forEach(task => {
            switch (filter) {
                case 'filter-all':
                    task.style.display = 'flex';
                    break;
                case 'filter-active':
                    task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
                    break;
                case 'filter-completed':
                    task.style.display = task.classList.contains('completed') ? 'flex' : 'none';
                    break;
            }
        });
    };

    searchTaskInput.addEventListener('input', () => {
        const searchText = searchTaskInput.value.toLowerCase();
        const tasks = taskList.querySelectorAll('li');
        tasks.forEach(task => {
            const taskText = task.querySelector('span').textContent.toLowerCase();
            task.style.display = taskText.includes(searchText) ? 'flex' : 'none';
        });
    });

    sortTasksSelect.addEventListener('change', () => {
        const sortBy = sortTasksSelect.value;
        const tasks = Array.from(taskList.querySelectorAll('li'));
        tasks.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            } else if (sortBy === 'priority') {
                const priorities = { low: 1, medium: 2, high: 3 };
                return priorities[a.dataset.priority] - priorities[b.dataset.priority];
            }
        });
        tasks.forEach(task => taskList.appendChild(task));
    });

    const markAllTasksCompleted = () => {
        taskList.querySelectorAll('li').forEach(taskItem => {
            if (!taskItem.classList.contains('completed')) {
                taskItem.classList.add('completed');
                taskItem.style.animation = 'completeTask 0.3s';
            }
        });
        saveTasks();
    };

    const unmarkAllTasksCompleted = () => {
        taskList.querySelectorAll('li.completed').forEach(taskItem => {
            taskItem.classList.remove('completed');
            taskItem.style.animation = 'completeTask 0.3s';
        });
        saveTasks();
    };

    const deleteAllTasks = () => {
        if (confirm('Tem certeza que deseja excluir todas as tarefas?')) {
            taskList.innerHTML = '';
            saveTasks();
        }
    };

    const editAllTasks = () => {
        taskList.querySelectorAll('li').forEach(taskItem => {
            const taskText = taskItem.querySelector('span');
            const newText = prompt('Editar tarefa:', taskText.textContent);
            const newPriority = prompt('Editar prioridade (low, medium, high):', taskItem.dataset.priority);
            if (newText && newPriority) {
                taskText.textContent = newText;
                taskItem.dataset.priority = newPriority;
                const priorityBadge = taskItem.querySelector('.priority-badge');
                priorityBadge.className = `priority-badge ${newPriority}`;
                priorityBadge.textContent = newPriority.charAt(0).toUpperCase() + newPriority.slice(1);
            }
        });
        saveTasks();
    };

    const exportTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importTasks = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const tasks = JSON.parse(e.target.result);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                taskList.innerHTML = '';
                tasks.forEach(task => addTaskToDOM(task));
                updateProgress();
                updateTaskCount();
            };
            reader.readAsText(file);
        }
    };

    const duplicateAllTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const duplicatedTask = { ...task, date: new Date().toISOString() };
            addTaskToDOM(duplicatedTask);
        });
        saveTasks();
    };

    importTasksButton.addEventListener('change', importTasks);

    markAllCompletedButton.addEventListener('click', markAllTasksCompleted);
    unmarkAllCompletedButton.addEventListener('click', unmarkAllTasksCompleted);
    deleteAllTasksButton.addEventListener('click', deleteAllTasks);
    editAllTasksButton.addEventListener('click', editAllTasks);
    exportTasksButton.addEventListener('click', exportTasks);
    duplicateAllTasksButton.addEventListener('click', duplicateAllTasks);

    loadTasks();
});