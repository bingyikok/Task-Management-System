<script lang="ts">
  import { page } from '$app/stores';
  import Taskcard from '$lib/components/Taskcard.svelte';
  import Taskdetails from '$lib/components/Taskdetails.svelte';
  import Planlist from '$lib/components/Planlist.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import { isLoggedIn, isAdmin } from '$lib/stores/states';
  import axios from 'axios';
  import { onMount } from 'svelte';
    // import Appdetails from '$lib/components/Appdetails.svelte';

  const isPM : boolean = $page.data.isPM || false;
  const appDetails: { [key:string]: string } = $page.data.app;
  const username: string = $page.data.username
  const states = ['Open', 'Todo', 'Doing', 'Done', 'Closed'];
  const permit = { 
    permit_create: $page.data.app_permit_create, 
    permit_open: $page.data.app_permit_open, 
    permit_todolist: $page.data.app_permit_todolist, 
    permit_doing: $page.data.app_permit_doing, 
    permit_done: $page.data.app_permit_done };

  let groupedTasks : {[keys:string]: string }[][] = $page.data.groupedTasks || [];
  let plans : {[keys:string]: string}[] = $page.data.plans;
  let planSelect: string[] = $page.data.planSelect;
  let viewPlans : boolean = false;
  let viewTask : boolean = false;
  let taskDetails : { [keys:string]: string } = {};
  let taskAction : string = '';
  let alertMessage : string = '';
  let alertColour : string = '';
  let loading : boolean = false;
    // let viewApp : boolean = false;

  $: isLoggedIn.set($page.data.isActive);
  $: isAdmin.set($page.data.isAdmin);

  onMount(() => {    
    loading = true;

    if ($page.data.status === 401) {
    const message : string = encodeURIComponent("unauthorised");
      window.location.href = `/unauthorised?${message}`;
    } else if ($page.data.error) {
      alert($page.data.error);
      return;
    } else if (!$isLoggedIn) {
      const message : string = encodeURIComponent("account_disabled");
      window.location.href = `/unauthorised?${message}`;
    }
    
    loading = false;
  })

  function viewPlanlist() {
    updatePlans();
    viewPlans = true;
  }

  function closePlanlist() {
    viewPlans = false;
  }
  
  function openTask(state: number, index: number) {
    taskAction = "View/Edit Task";
    taskDetails = groupedTasks[state][index];
    viewTask = true;
  }

  function closeTask() {
    viewTask = false;
  }

  function createTask() {
    taskAction = "Create Task";
    taskDetails = {task_name: '', task_id: `${appDetails.app_acronym}_${appDetails.app_rnumber+1}`, task_app_acronym: appDetails.app_acronym, task_plan: '', task_state: 'Open', task_creator: username, task_owner: username, task_description: '', task_notes: '' };
    viewTask = true;
  };

  async function updateTasks(event?: CustomEvent) {
    loading = true;

    try {
      const response = await axios.post('http://localhost:3000/tasks', { app_acronym: appDetails.app_acronym }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (response.status === 200) {
        groupedTasks = response.data;
        if (event) {
          triggerAlert(event.detail.message, event.detail.colour);

          if(!event.detail.remainOpen) {
            viewTask = false;
          }
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        alert(error.response.data || 'An unexpected error occurred.');
      } else {
        triggerAlert(error.response.data.message, "red");
      }
    } finally {
      loading = false;
    }
  }

  async function updatePlans(event?: CustomEvent) {
    loading = true;

    try {
      const response = await axios.post('http://localhost:3000/plans', { app_acronym: appDetails.app_acronym }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (response.status === 200) {
        plans = response.data.existingPlans;
        planSelect = response.data.planNames;

        if(event) {
          triggerAlert(event.detail.message, event.detail.colour);
        }
      }
    } catch (error) {
      if (error.response.status === 500) {
        alert(error.response.data || 'An unexpected error occurred.');
      } else {
        triggerAlert(error.response.data.message, "red");
      }
    } finally {
      loading = false;
    }
  }

  function handleError(event: CustomEvent) {
    triggerAlert(event.detail.message, event.detail.colour);

    if (event.detail.message === "Error: Account disabled" || event.detail.message === "No token access") {
      setTimeout(()=>location.reload(), 1000);
    } else {
      updateTasks();
      updatePlans();
    }
  }

  function triggerAlert(message: string, colour: string) {
    alertMessage = ''; // Need to have a state change in prop
    alertColour = '';
    alertMessage = message;
    alertColour = colour;
  }

  //Removed app details popup
  /* function viewAppDetails() {
    viewApp = true;
  };

  function closeApp() {
    viewApp = false;
  } */
</script>

<Alert alertMessage={alertMessage} bgColor={alertColour} />
<!-- {#if viewApp}
<Appdetails on:close={closeApp} app={appDetails} />
{/if} -->
{#if viewPlans}
<Planlist on:close={closePlanlist} on:created={updatePlans} on:error={handleError} app_acronym={appDetails.app_acronym} plans={plans} isPM={isPM}/>
{/if}
{#if viewTask}
<Taskdetails on:close={closeTask} on:saved={updateTasks} on:error={handleError} task={taskDetails} planOptions={planSelect} taskAction={taskAction} permit={permit}/>
{/if}
<div class="container">
  {#if appDetails}
<h1>{appDetails.app_acronym}</h1>
{/if}
<div class="header">
  <!-- <button class="app-details-link" on:click={viewAppDetails}>View App Details</button> -->
  <div class="button-group">
    <button class="btn" on:click={viewPlanlist} >Plans</button>
    <button class="btn" on:click={createTask} hidden={!permit.permit_create}>Create Task</button>
  </div>
</div>
</div>
{#if !loading}
<div class="task-board">
  {#each groupedTasks as tasksInState, state}
    <div class="task-column">
      <h3>{states[state]}</h3>
      {#each tasksInState as task, index}
        <Taskcard on:open={()=>openTask(state, index)} task_id={task.task_id} task_name={task.task_name} task_owner={task.task_owner} plan_colour={task.plan_colour} />
      {/each}
    </div>
  {/each}
</div>
{/if}

<style>
  .container {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  h1 {
    font-style: italic;
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .btn {
    background-color: #333;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
  }

  .btn:hover {
    background-color: #555;
  }

  .task-board {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    padding: 20px;
  }

  .task-column {
    background-color: #e4e4e4cc;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .task-column h3 {
    text-align: center;
    margin-bottom: 10px;
    font-size: 18px;
    min-width: 20%;
  }

  /* .app-details-link {
    background: none;
    border: none;
    color: blue;
    text-decoration: underline;
    padding: 0;
    font-size: inherit;
    cursor: pointer;
  }

  .app-details-link:hover {
    text-decoration: none;
  } */
</style>