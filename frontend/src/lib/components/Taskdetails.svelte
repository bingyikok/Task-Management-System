<script lang="ts">
import axios from "axios";
import { createEventDispatcher } from "svelte";

export let task : {[key:string]: string };
export let taskAction: string;
export let permit: { [key : string] : boolean }
export let planOptions : string[] = [];

const dispatch = createEventDispatcher();

let newNote : string = '';
let errorMessage: string = '';
let newPlan: string = task.task_plan;
let hideReject : boolean = false;

$: if (newPlan !== task.task_plan && task.task_state === "Done") {
        hideReject = true;
    } else {
        hideReject = false;
    }

const buttonName = {
    Open : ["Save & Release", ""],
    Todo : ["Save & Pickup", ""],
    Doing : ["Save & Seek Review", "Save & Giveup"],
    Done : ["Save & Approve", "Save & Reject"],
    Closed : ["", ""]
}

function hideButton() {
    if(taskAction === "Create Task") {
        return !permit.permit_create;
    }

    switch (task.task_state) {
        case 'Open':
            return !permit.permit_open;
        
        case 'Todo':
            return !permit.permit_todolist;
        
        case 'Doing':
            return !permit.permit_doing;
            
        case 'Done':
            return !permit.permit_done;
    }
}

async function createTask() {
    task.task_notes = newNote;
    task.task_plan = newPlan;
    try {
      const response = await axios.post('http://localhost:3000/createtask', task, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (response.status === 200) {
        errorMessage = '';
        task.task_name = '';
        task.task_plan = '';
        newPlan = '';
        task.task_description = '';
        task.task_notes = '';
        newNote = '';
        dispatch('saved', { message: "Task successfully created", colour: "green", remainOpen: true });
        };
    } catch (error) {
        // console.log(error);
        if (error.response.status === 403 || 400) {
                dispatch("error", { message: error.response.data.message, colour: "red", remainOpen: true });
            } else {
                alert(error.response.data || "An unexpected error occurred.");
            }
    }
}

async function promoteTask() {
    // await saveChanges();
    try {
      const response = await axios.post('http://localhost:3000/promote',
        {
            task_id: task.task_id,
            task_state: task.task_state,
            task_notes: newNote,
            task_plan: newPlan,
            task_app_acronym: task.task_app_acronym,
        }, 
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
      });

      if (response.status === 200) {
        dispatch('saved', { message: "Task successfully promoted", colour: "green" });
        };
    } catch (error) {
        if (error.response.status === 403 || 400) {
                dispatch("error", { message: error.response.data.message, colour: "red", remainOpen: true });
            } else {
                alert(error.response.data || "An unexpected error occurred.");
            }
    }
}

async function demoteTask() {
    // await saveChanges();
    try {
      const response = await axios.post('http://localhost:3000/demote',
        {
            task_id: task.task_id,
            task_state: task.task_state,
            task_notes: newNote,
            task_plan: newPlan,
            task_app_acronym: task.task_app_acronym,
        }, 
        {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        });

      if (response.status === 200) {
        dispatch('saved', { message: "Task successfully demoted", colour: "green" });
        };
    } catch (error) {
        if (error.response.status === 403 || 400) {
                dispatch("error", { message: error.response.data.message, colour: "red", remainOpen: true });
            } else {
                alert(error.response.data || "An unexpected error occurred.");
            }
    }
}

async function saveChanges() {
    if (!newNote && newPlan===task.task_plan) {
        dispatch("error", { message: "No changes", colour: "red", remainOpen: true })
        return;
    } else {
        try {
            const response = await axios.post('http://localhost:3000/savechanges', 
            { 
                task_id: task.task_id, 
                task_notes: newNote, 
                task_state: task.task_state, 
                task_plan: newPlan, 
                task_app_acronym: task.task_app_acronym,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (response.status === 200) {
                newNote = '';
                getUpdatedChanges();
                dispatch('saved', { message: "Task successfully saved", colour: "green", remainOpen: true });
            };
        } catch (error) {
            if (error.response.status === 403 || 400) {
                dispatch("error", { message: error.response.data.message, colour: "red", remainOpen: true });
            } else {
                alert(error.response.data || "An unexpected error occurred.");
            }
        } finally {
            
        }
    }
}

async function getUpdatedChanges() {
    try {
        const response = await axios.post('http://localhost:3000/updatechange', 
        { 
            task_id: task.task_id, 
        }, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        })
        if (response.status === 200) {
            task = response.data;
        };
    } catch (error) {
        alert(error.response.data || "An unexpected error occurred.");
    }
}

function cancelChanges() {
    dispatch("close");
};

function resetSelection() {
    newPlan = task.task_plan;
    hideReject = false;
}
</script>

<div class="popup-overlay">
    <div class="popup-content">
        <div class="popup-header">
            <h2>{taskAction}</h2>
            <button class="close-btn" on:click={cancelChanges}>✖</button>
        </div>

    <div class="popup-body">
    <div class="form-section">
    <div class="form-field">
        <label for="taskName">Task name:</label>
        {#if errorMessage}
        <div class="error">{errorMessage}</div>
        {/if}
        <input id="taskName" type="text" bind:value={task.task_name} placeholder="Enter task name" disabled={taskAction!=="Create Task"} />
    </div>

    <div class="form-field">
        <label for="taskID">Task ID:</label>
        <p id="taskID">{task.task_id}</p>
    </div>

    <div class="form-field">
        <label for="plan">Plan:</label>
        <div class="planSelect">
        <button class="clear-btn" on:click={resetSelection} hidden={newPlan===task.task_plan}>Reset</button>
        <select id="plan" bind:value={newPlan} disabled={!((task.task_state==="Done" && permit.permit_done) || (taskAction==="Create Task" && permit.permit_create) || (task.task_state==="Open" && permit.permit_open))}>
            {#each planOptions as plan}
                <option value={plan}>{plan}</option>
            {/each}
        </select>
        </div>
    </div>

    <div class="form-field">
        <label for="state">State:</label>
        <p id="state">{task.task_state}</p>
    </div>

    <div class="form-field">
        <label for="creator">Creator:</label>
        <p id="creator">{task.task_creator}</p>
    </div>

    <div class="form-field">
        <label for="owner">Owner:</label>
        <p id="owner">{task.task_owner}</p>
    </div>
        <label for="description">Description:</label>
        <textarea id="description" maxlength="255" bind:value={task.task_description} placeholder={taskAction==='Create Task'?"Enter task description":""} disabled={taskAction!=="Create Task"} ></textarea>
</div>

<div class="notes-section">
    <div class="oldnotes">
        <label for="notes">Notes:</label>
        <p id="notes">{task.task_notes}</p>
    </div>
    <div class="newnote" hidden={task.task_state==="Closed" || hideButton()}>
        <label for="newnote">Add note:</label>
        <textarea id="newnote" bind:value={newNote} placeholder="Add a note"></textarea>
    </div>
</div>
</div>
        <div class="popup-footer">
            <div class="left-btn">
                <button class="btn" on:click={createTask} hidden={taskAction!=="Create Task"}>Create Task</button>
                <!-- <button class="btn" on:click={promoteTask} hidden={!(task.task_state==="Open" && permit.permit_open && taskAction!=="Create Task")}>Save & Release</button>
                <button class="btn" on:click={promoteTask} hidden={!(task.task_state==="Todo" && permit.permit_todolist)}>Save & Pickup</button>
                <button class="btn" on:click={promoteTask} hidden={!(task.task_state==="Doing" && permit.permit_doing)}>Save & Seek Approval</button>
                <button class="btn" on:click={demoteTask} hidden={!(task.task_state==="Doing" && permit.permit_doing)}>Save & Give Up</button>
                <button class="btn" on:click={promoteTask} hidden={!(task.task_state==="Done" && permit.permit_done && newPlan===task.task_plan)}>Save & Approve</button>
                <button class="btn" on:click={demoteTask} hidden={!(task.task_state==="Done" && permit.permit_done)}>Save & Reject</button> -->
                <button class="btn" on:click={promoteTask} hidden={!buttonName[task.task_state][0] || hideButton() || hideReject || taskAction==="Create Task"}>{buttonName[task.task_state][0]}</button>
                <button class="btn" on:click={demoteTask} hidden={!buttonName[task.task_state][1] || hideButton() }>{buttonName[task.task_state][1]}</button>
            </div>
            <div class="right-btn">
                <button class="btn" on:click={saveChanges} hidden={taskAction==="Create Task" || task.task_state==="Closed" || hideButton() || hideReject}>Save Changes</button>
                <button class="btn" on:click={cancelChanges}>Cancel</button>
            </div>
        </div>
</div>
</div>

<style>
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .popup-content {
        position: fixed;
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .popup-header h2 {
        margin: 0;
    }

    .close-btn {
        background-color: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
    }

    .popup-body {
        display: flex;
        /* justify-content: space-between; */
        gap: 10px;
        height: 80%;
        min-height: 60%;
        overflow-y: auto;
    }

    .form-section {
        display: grid;
        gap: 10px;
        min-width: 30%;
        max-width: 50%;
        overflow: auto;
    }

    .notes-section {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .form-field {
        display: flex;
        align-items: center;
    }

    .form-field label {
        min-width: 120px;
        font-weight: bold;
    }

    .form-field input, .form-field select, .form-field p {
        padding: 10px;
    }

    .oldnotes {
        white-space: pre-line;
        overflow-y: auto;
        flex-grow: 1;
    }

    .newnote {
        min-height: 50%;
    }

    label {
        font-weight: bold;
    }

    input, select {
        width: auto;
        min-width: 200px;
    }

    textarea {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        resize: none;
        box-sizing: border-box;
        min-height: 85%;
    }

     #description {
        min-height: 100px;
    }

    .popup-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 10px;
    }

    .btn {
        padding: 10px 20px;
        border: none;
        background-color: #333;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    }

    .btn:hover {
        background-color: #555;
    }

    .error {
        color: red;
        font-size: 12px;
        margin-left: 130px;
        position: absolute;
        margin-bottom: 50px;
    }

    input:disabled, select:disabled, textarea:disabled {
        border: none;
        background: none;
        color: black;
        opacity: 1;
        appearance: none;
    }

    .clear-btn {
        position: absolute;
        right: 0;
        bottom: 10px;
        margin-right: -50px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #ff0000;
    }

    .clear-btn:hover {
        color: #ff0000be;
        text-decoration: underline;
    }

    .planSelect {
        position: relative;
    }
</style>