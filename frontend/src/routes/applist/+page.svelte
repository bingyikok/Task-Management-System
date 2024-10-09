<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { isLoggedIn } from '$lib/stores/states';

    $: isLoggedIn.set($page.data.isActive)

  onMount(() => {
    if ($page.data.status === 403) {
      const message : string = encodeURIComponent("unauthorised");
      goto(`/unauthorised?${message}`);
    } else if (!$isLoggedIn) {
      const message : string = encodeURIComponent("account_disabled");
      goto(`/unauthorised?${message}`);
    }
  })

  let apps = [
    {
      acronym: "xxxxx",
      rnumber: "xxxxxx",
      startDate: "xxxxxx",
      endDate: "xxxxxx",
      taskCreate: "xxx",
      taskOpen: "xxx",
      taskToDo: "xxxx",
      taskDoing: "xxx",
      taskDone: "xxx",
      description: "xxxxxxxxxx"
    },
    {
      acronym: "xxxxx",
      rnumber: "xxxxxx",
      startDate: "xxxxxx",
      endDate: "xxxxxx",
      taskCreate: "xxx",
      taskOpen: "xxx",
      taskToDo: "xxxx",
      taskDoing: "xxx",
      taskDone: "xxx",
      description: "xxxxxxxxxx"
    }
  ];

  function createApp() {
    // Implement create app logic here
    alert("Create App clicked!");
  }

  function openApp(index) {
    // Implement open app logic here
    alert(`Open App ${index} clicked!`);
  }
</script>

<div class="container">

  <button class="button" on:click={createApp}>Create App</button>

  <table>
    <thead>
      <tr>
        <th>Acronym</th>
        <th>Rnumber</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Task Create</th>
        <th>Task Open</th>
        <th>Task To Do</th>
        <th>Task Doing</th>
        <th>Task Done</th>
        <th>Description</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each apps as app, index}
        <tr>
          <td>{app.acronym}</td>
          <td>{app.rnumber}</td>
          <td>{app.startDate}</td>
          <td>{app.endDate}</td>
          <td>{app.taskCreate}</td>
          <td>{app.taskOpen}</td>
          <td>{app.taskToDo}</td>
          <td>{app.taskDoing}</td>
          <td>{app.taskDone}</td>
          <td>{app.description}</td>
          <td>
            <button class="button" on:click={() => openApp(index)}>Open App</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .container {
    padding: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
  }
  th {
    background-color: #f4f4f4;
  }
  .button {
    padding: 10px 20px;
    margin: 10px;
    background-color: #333;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
  .button:hover {
    background-color: #555;
  }
</style>