<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { isLoggedIn, isAdmin } from '$lib/stores/states';
    import axios from 'axios';
    import Alert from '$lib/components/Alert.svelte';

    const isPL : boolean = $page.data.isPL || false;
    const groupname: string[] = $page.data.groupname || [];
    let loading : boolean = false;
    let apps: {[keys:string]: string | number}[] = $page.data.apps || [];
    let newApp: {[keys:string]: string | number} = { app_acronym: '', app_rnumber: '', app_startdate: '', app_enddate: '', app_permit_create: '', app_permit_open: '', app_permit_todolist: '', app_permit_doing: '', app_permit_done: '', app_description: '' };
    let errorMessage : {[key:string]: string} = {};
    let alertMessage : string = '';
    let alertColour : string = '';
    let editingIndex : number = null;

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

  async function createApp() {
    try{
      const response = await axios.post('http://localhost:3000/createapp', newApp, {
        headers: { 'content-type' : 'application/json'}, 
        withCredentials: true
      })
      if (response.status === 200) {
        errorMessage = {};
        // apps = [{...newApp}, ...apps];
        triggerAlert("App successfully created", "green");
        newApp = { app_acronym: '', app_rnumber: 0, app_startdate: '', app_enddate: '', app_permit_create: '', app_permit_open: '', app_permit_todolist: '', app_permit_doing: '', app_permit_done: '', app_description: '' };
      }
    } catch (error) {
      if (error.response.status === 400 || 403 ) {
        errorMessage = error.response.data.fields || 'An unexpected error occurred.';
        triggerAlert(error.response.data.message, "red");
      } else {
        alert(error.response.data || 'An unexpected error occurred.');
      }
    } finally {
      refreshApp();
    }
  }

  function openApp(index: number) {
    localStorage.setItem("app_acronym", `${apps[index].app_acronym}`);
    window.location.href = "/tasklist";
  }

  function editApp(index: number) {
    editingIndex = index;
  }

  async function saveUpdate(index: number) {
    const updateApp = apps[index];

    try {
      const response = await axios.post("http://localhost:3000/updateApp", updateApp, { 
        headers: {"content-type" : "application/json"},
        withCredentials: true,
      });
      if (response.status === 200) {
        refreshApp();
        editingIndex = null;
      }
    } catch (error) {
      if (error.response.status === 400 || 403 ) {
        errorMessage = error.response.data.fields || 'An unexpected error occurred.';
        triggerAlert(error.response.data.message, "red");
      } else {
        alert(error.response.data || 'An unexpected error occurred.');
      }
    }
  }

  function cancelUpdate(index: number) {
    refreshApp();
    editingIndex = null;
  }

  function triggerAlert(message: string, colour: string) {
    alertMessage = ''; // Need to have a state change in prop
    alertColour = '';
    alertMessage = message;
    alertColour = colour;
  }

  function autoExpand(event: Event) {
    const element = event.target as HTMLTextAreaElement;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }

  async function refreshApp() {
    try{
        const response = await axios.get('http://localhost:3000/apps', {
          headers: { 'content-type' : 'application/json'}, 
          withCredentials: true
        })
        if (response.status === 200) {
          apps = response.data;
        }
    } catch (error) {
      alert(error.response.data || 'An unexpected error occurred.');
    }
  }
</script>

<Alert alertMessage={alertMessage} bgColor={alertColour} />

<div class="container">
  <!-- <div class=options>
    <button class="button" on:click={createApp}>Create App</button>
  </div> -->
  <table>
    
    <thead>
      <tr>
        <th><label for="app_acronym">Acronym</label></th>
        <th><label for="app_rnumber">Rnumber</label></th>
        <th><label for="app_startdate">Start Date</label></th>
        <th><label for="app_enddate">End Date</label></th>
        <th><label for="app_permit_create">Task Create</label></th>
        <th><label for="app_permit_open">Task Open</label></th>
        <th><label for="app_permit_todolist">Task To Do</label></th>
        <th><label for="app_permit_doing">Task Doing</label></th>
        <th><label for="app_permit_done">Task Done</label></th>
        <th><label for="app_description">Description</label></th>
        <th>Create/View</th>
      </tr>
    </thead>
    
    {#if loading || !groupname || !apps}
    <p>Loading apps...</p>
    {:else}
    <tbody>
      {#if isPL}
      <tr>
        <td>
          {#if errorMessage.app_acronym}
            <div class="error">{errorMessage.app_acronym}</div>
          {/if}
          <input class="input" id="app_acronym" type="text" placeholder="Acronym" maxlength="50" bind:value={newApp.app_acronym} />
        </td>
        <td>
          {#if errorMessage.app_rnumber}
            <div class="error">{errorMessage.app_rnumber}</div>
          {/if}
          <input class="input" id="app_rnumber" type="text" placeholder="Rnumber" bind:value={newApp.app_rnumber} />
        </td>
        <td>
          {#if errorMessage.app_startdate}
            <div class="error">{errorMessage.app_startdate}</div>
          {/if}
          <input class="input" id="app_startdate" type="date" bind:value={newApp.app_startdate} />
        </td>
        <td>
          {#if errorMessage.app_enddate}
            <div class="error">{errorMessage.app_enddate}</div>
          {/if}
          <input class="input" id="app_enddate" type="date" bind:value={newApp.app_enddate} />
        </td>
        <td>
          <select class="input" id="app_permit_create" bind:value={newApp.app_permit_create}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </td>
        <td>
          <select class="input" id="app_permit_open" bind:value={newApp.app_permit_open}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </td>
        <td>
          <select class="input" id="app_permit_todolist" bind:value={newApp.app_permit_todolist}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </td>
        <td>
          <select class="input" id="app_permit_doing" bind:value={newApp.app_permit_doing}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </td>
        <td>
          <select class="input" id="app_permit_done" bind:value={newApp.app_permit_done}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </td>
         <td>
          <textarea id="app_description" class="input" maxlength="255" placeholder="App Description" on:input={autoExpand} bind:value={newApp.app_description} />
        </td>
        <td>
          <button class="btn" on:click={createApp}>Create App</button>
        </td>
      </tr>
      {/if}

      {#each apps as app, index}
        <tr>
          <td>
            {app.app_acronym}
          </td>
          <td>
            {app.app_rnumber}
          </td>
          {#if editingIndex === index}
          <td>
            <input class="startdate" type="date" bind:value={app.app_startdate} />
          </td>
          <td>
            <input class="enddate" type="date" bind:value={app.app_enddate} />
          </td>
          <td>
            <select class="input" id="app_permit_create" bind:value={app.app_permit_create}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </td>
          <td>
            <select class="input" id="app_permit_open" bind:value={app.app_permit_open}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </td>
          <td>
            <select class="input" id="app_permit_todolist" bind:value={app.app_permit_todolist}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </td>
          <td>
            <select class="input" id="app_permit_doing" bind:value={app.app_permit_doing}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </td>
          <td>
            <select class="input" id="app_permit_done" bind:value={app.app_permit_done}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}}
          </td>
          <td>
            <textarea class="description" bind:value={app.app_description} rows="5" />
          </td>
          <td>
              <button class="btn" on:click={() => saveUpdate(index)}>Save</button>
              <button class="btn" on:click={() => cancelUpdate(index)}>Cancel</button>
          </td>
          {:else}
          <td>
            <input class="startdate" type="date" bind:value={app.app_startdate} disabled/>
          </td>
          <td>
            <input class="enddate" type="date" bind:value={app.app_enddate} disabled/>
          </td>
          <td>
            {app.app_permit_create}
          </td>
          <td>
            {app.app_permit_open}
          </td>
          <td>
            {app.app_permit_todolist}
          </td>
          <td>
            {app.app_permit_doing}
          </td>
          <td>
            {app.app_permit_done}
          </td>
          <td>
            <textarea class="description" bind:value={app.app_description} rows="5" disabled/>
          </td>
          <td>
              <button class="btn" on:click={() => openApp(index)}>Open App</button>
              <button class="btn" on:click={() => editApp(index)}>Edit App</button>
          </td>
          {/if}
        </tr>
      {/each}
    </tbody>
    {/if}
  </table>
</div>

<style>
table {
  width: 100%;
  border-collapse: collapse;
  /* table-layout: auto; */
}

th, td {
  padding: 10px;
  border: 1px solid #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width:400px;
}

th {
  background-color: #e4e4e4cc;
}

td input[type="text"],
td input[type="date"],
td select {
  width: auto;
  min-width: 80%;
  gap: 10px;
  padding: 8px 5px;
}

textarea {
  width: 100%;
  min-width: 400px;
  min-height: 70%;
  resize: none;
}

.description {
  border: none;
  background-color: white;
  overflow-y: auto;
  resize: vertical;
}

.btn {
  padding: 8px 16px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.error {
    color: red;
    font-size: 12px;
  }

  .startdate, .enddate {
    border: none;
    background: none;
  }
</style>