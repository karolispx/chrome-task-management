// Initialize tasks' arrays
var activeTasks = []
var completedTasks = []


// When everything has loaded
$(document).ready(() => {
    // Focus on the 'task' input everytime the popup is loaded
    $('#task-input').focus()


    // Load tasks
    loadTasks()


    // Create task
    $('#tasks-form').submit((event) => {
        let taskInput = $('#task-input')

        if ($.trim(taskInput.val()) !== '') {
            // Push to start of array
            activeTasks.unshift({
                'task': taskInput.val(),
                'date_created': getCurrentDateTime()
            })

            // Reset task input
            taskInput.val('')

            // Save and reload tasks
            saveAndReloadTasks()

            // Switch to 'active tasks' tab
            $('#active-tasks-tab').click()

            // Display message
            displayMessage('Task has been created successfully!', 'success')
        } else {
            // Display message
            displayMessage('Please provide a task!', 'warning')
        }

        event.preventDefault()
    })


    // Complete task
    $(document).on('click', '.complete-task', (button) => {
        if (button && button.currentTarget) {
            let buttonObject = button.currentTarget

            if (buttonObject) {
                let taskId = $(buttonObject).data('task')

                // Get the task, adjust 'date_updated' and add it to 'completed tasks' list
                let task = activeTasks[taskId]

                if (task) {
                    task.date_updated = getCurrentDateTime()
                    completedTasks.unshift(task)
    
                    // Remove this task from 'active tasks' list
                    activeTasks.splice(taskId, 1)
    
                    // Display message
                    displayMessage('Task has been completed successfully!', 'success')

                    // Save and reload tasks
                    saveAndReloadTasks()
                } else {
                    // Display message
                    displayMessage('This task does not exist!', 'danger')
                }
            }
        }
    })


    // Activate task
    $(document).on('click', '.activate-task', (button) => {
        if (button && button.currentTarget) {
            let buttonObject = button.currentTarget

            if (buttonObject) {
                let taskId = $(buttonObject).data('task')

                // Get the task, adjust 'date_updated' and add it to 'active tasks' list
                let task = completedTasks[taskId]

                if (task) {
                    task.date_updated = getCurrentDateTime()
                    activeTasks.unshift(task)
    
                    // Remove this task from 'completed tasks' list
                    completedTasks.splice(taskId, 1)
    
                    // Display message
                    displayMessage('Task has been activated successfully!', 'success')

                    // Save and reload tasks
                    saveAndReloadTasks()
                } else {
                    // Display message
                    displayMessage('This task does not exist!', 'danger')
                }
            }
        }
    })


    // Delete task
    $(document).on('click', '.delete-task', (button) => {
        var confirmClear = confirm('Are you sure you want to delete this task?')

        if (confirmClear) {
            if (button && button.currentTarget) {
                let buttonObject = button.currentTarget
    
                if (buttonObject) {
                    let taskId = $(buttonObject).data('task')
    
                    // Get the task from 'completed tasks' list and remote it
                    let task = completedTasks[taskId]
    
                    if (task) {
                        // Remove this task from 'completed tasks' list
                        completedTasks.splice(taskId, 1)
        
                        // Display message
                        displayMessage('Task has been deleted successfully!', 'success')
                      
                        // Save and reload tasks
                        saveAndReloadTasks()
                    } else {
                        // Display message
                        displayMessage('This task does not exist!', 'danger')
                    }
                }
            }
        }
    })


    // Delete all tasks
    $(document).on('click', '#delete-tasks', () => {
        var confirmDelete = confirm('Are you sure you want to delete all tasks?')

        if (confirmDelete) {
            // Reset tasks' arrays
            activeTasks = []
            completedTasks = []

            // Display message
            displayMessage('All tasks have been deleted successfully!', 'success')

            // Save and reload tasks
            saveAndReloadTasks()
        }
    })


    // Load tasks
    function loadTasks() {
        loadActiveTasks()
        loadCompletedTasks()
    }

    // Save tasks
    function saveAndReloadTasks() {
        chrome.storage.local.set({active_tasks: activeTasks}, () => {})
        chrome.storage.local.set({completed_tasks: completedTasks}, () => {})

        // Load tasks
        loadTasks()
    }


    // Load active tasks
    function loadActiveTasks() {
        // Get active tasks
        chrome.storage.local.get(['active_tasks'], (result) => {
            activeTasks = result.active_tasks

            $('.active-tasks-number').text(activeTasks.length)
            $('#active-tasks-table tbody').html('')

            if (activeTasks.length > 0) {
                $.each(activeTasks, (index, value) => {
                    $('#active-tasks-table tbody').append(`
                        <tr>
                            <td>
                                <h5>${value.task}</h5>
                                
                                <small>
                                    <strong>Date created:</strong> ${value.date_created}
                                </small>
                            </td>

                            <td class="text-right">
                                <button class="btn btn-info complete-task" data-task="${index}" title="Move to COMPLETED tasks">
                                    <i class="fa fa-check"></i>
                                </button>
                            </td>
                        </tr>
                    `)
                })
            } else {
                $('#active-tasks-table tbody').append(`
                    <tr>
                        <td colspan="2" class="text-center">
                            <h5>No active tasks available.</h5>
                        </td>
                    </tr>
                `)
            }
        })
    }


    // Load completed tasks
    function loadCompletedTasks() {
        // Get completed tasks
        chrome.storage.local.get(['completed_tasks'], (result) => {
            completedTasks = result.completed_tasks

            $('.completed-tasks-number').text(completedTasks.length)
            $('#completed-tasks-table tbody').html('')

            if (completedTasks.length > 0) {
                $.each(completedTasks, (index, value) => {
                    $('#completed-tasks-table tbody').append(`
                        <tr>
                            <td>
                                <h5>${value.task}</h5>
                                
                                <small>
                                    <strong>Date completed:</strong> ${value.date_updated}
                                </small>
                            </td>

                            <td class="text-right">
                                <div class="btn-group" role="group">
                                    <button class="btn btn-info activate-task" data-task="${index}" title="Move back to ACTIVE tasks">
                                        <i class="fa fa-undo"></i>
                                    </button><br />

                                    <button class="btn btn-danger delete-task" data-task="${index}" title="Delete">
                                        <i class="fa fa-trash"></i>
                                    </button>
                                </div>
                            </td>

                        </tr>
                    `)
                })
            } else {    
                $('#completed-tasks-table tbody').append(`
                    <tr>
                        <td colspan="2" class="text-center">
                            <h5>No completed tasks available.</h5>
                        </td>
                    </tr>
                `)
            }
        })
    }
    

    // Display message
    function displayMessage(message, status) {
       if (message && status) {
           let alert = `
                <div class="tasks-feedback-alert alert alert-${status} fade show text-center" role="alert">
                    ${message}
                </div>
           `

           $('#tasks-feedback').html(alert)

            $('.tasks-feedback-alert').delay(2000).slideUp(200, (item) => {
                $(item).alert('close')
            })
       }
    }


    // Get current date
    function getCurrentDateTime(today = new Date()) {
        let date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate()
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

        return date + ' ' + time
    }
})

