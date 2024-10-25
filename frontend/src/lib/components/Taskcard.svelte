<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let task_id: string;
  export let task_name: string;
  export let task_owner: string;
  export let plan_colour: string;

  function openTask() {
    dispatch('open');
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="task-card" style="border-left-color: {plan_colour || 'transparent'}" on:click={openTask}>
  <p><strong>{task_id}</strong></p>
  <p>{task_name}</p>
  <p>Owner: {task_owner}</p>
</div>

<style>
  .task-card {
    background-color: #ccf2f4;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    border: none;
    text-align: left;
    cursor: pointer;
    border-left: 5px solid;
    text-wrap: nowrap;
  }

  .task-card:hover {
    background-color: #b4c8ff;
  }

  p {
    margin: 5px 0;
  }

  strong {
    font-size: 16px;
  }
</style>