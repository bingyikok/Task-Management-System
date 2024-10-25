<script lang="ts">
  // Removed Appdetails popup

  import { createEventDispatcher } from "svelte";

  export let app: {[keys:string]: string | number};
  export let groupname : string[];
  const dispatch = createEventDispatcher();

  function closeDetails() {
    dispatch('close');
  }
</script>

<div class="popup-overlay">
  <div class="popup-content">
    <div class="popup-header">
      <h2>App Acronym: {app.app_acronym}</h2>
      <button class="close-btn" on:click={closeDetails}>✖</button>
    </div>

    <div class="popup-body">
      <div class="left-section">
        <p>
          <strong>Start Date:</strong>
          <input class="input" type="date" bind:value={app.app_startdate} />
        </p>
        <p>
          <strong>End Date:</strong>
          <input class="input" type="date" bind:value={app.app_enddate} />
        </p>

        <h3>Task Permissions</h3>
        <p>
          <strong>Create:</strong>
          <select class="input" bind:value={app.app_permit_create}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </p>
        <p>
          <strong>Open:</strong> 
          <select class="input" bind:value={app.app_permit_open}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </p>
        <p>
          <strong>ToDo:</strong> 
          <select class="input" bind:value={app.app_permit_todolist}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </p>
        <p>
          <strong>Doing:</strong> 
          <select class="input" bind:value={app.app_permit_doing}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </p>
        <p>
          <strong>Done:</strong> 
          <select class="input" bind:value={app.app_permit_done}>
            {#each groupname as group}
              <option value={group}>{group}</option>
            {/each}
          </select>
        </p>
      </div>

      <div class="right-section">
        <p><strong>Description:</strong></p>
        <pre>
          <textarea id="app_description" class="input" maxlength="255" placeholder="App Description" bind:value={app.app_description} />
        </pre>
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
    z-index: 1000;
  }

  .popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
    overflow-y: auto;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    margin-bottom: 50px;
  }

  .close-btn {
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }

  .popup-body {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    height: 100%;
  }

  .left-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-left: 10%;
  }

  .right-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .right-section p {
    margin: 0;
  }

  h2, h3 {
    margin: 0;
  }

  h2 {
    font-size: 24px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .popup-body p {
    margin: 5px 0;
  }

  textarea {
  flex-grow: 1;
  width: 80%;
  resize: none;
  min-height: 400px; /* Set a minimum height */
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
}
</style>