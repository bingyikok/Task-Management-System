<script lang="ts">
  import axios from 'axios';
  import { onMount } from 'svelte';
  import MultiSelect from 'svelte-multiselect';
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from "$app/navigation";
  import { page } from '$app/stores';
  import { isLoggedIn, isAdmin } from '$lib/stores/states';

  let newGroup: string = '';
  let groupSelect: string[] = [];
  let editingIndex: number;
  let users : any = []; // {username: '', password: '', email: '', groupname: [], isActive: true}
  let newUser : any = { username: '', password:   '', email: '', groupname: [], isActive: true };
  let addError : { [key: string]: string } = {}; //username: '', password: '', email: '', groupname: '', isActive: ''
  let updateError : { [key: string]: string } = {}; //password: '', email: '', groupname: '', isActive: ''
  let newPassword : string = '';
  let loading : boolean = false;
  let originalGroup: string[] = [];
  let alertMessage: string = '';
  let alertColour : string = '';

  $: isLoggedIn.set($page.data.isActive);
  $: isAdmin.set($page.data.isAdmin);

  onMount(async () => {
    loading = true;

    if ($page.data.status === 401) {
    const message : string = encodeURIComponent("unauthorised");
      window.location.href = `/unauthorised?${message}`;
    } else if (!$isLoggedIn) {
      const message : string = encodeURIComponent("account_disabled");
      goto(`/unauthorised?${message}`);
    } else if (!$isAdmin) {
    const message : string = encodeURIComponent("not_admin");
      goto(`/unauthorised?${message}`);
    }

    resetAdd();
    resetUpdate();
    
    try {
      const [responseUser, responseGroups] = await Promise.all([
        axios.get('http://localhost:3000/users', {
        headers: { "Content-Type": "application/json"},
        withCredentials: true,  // Send cookies with the request
      }),
        axios.get('http://localhost:3000/groups', {
        headers: { "Content-Type": "application/json"},
        withCredentials: true  // Send cookies with the request
      })
      ]);

      if (responseUser.status === 200 && responseGroups.status === 200) {
        users = responseUser.data;
        groupSelect = responseGroups.data;
      }
    } catch (error: any) {
      return error.response.message || 'An unexpected error occurred.';
    } finally {
      loading = false; // Reset loading state
    }
  });

  function triggerAlert(message: string, colour: string) {
    alertMessage = ''; // Need to have a state change in prop
    alertColour = '';
    alertMessage = message;
    alertColour = colour;
  }

  function resetAdd() {
    newUser = { username: '', password: '', email: '', groupname: [], isActive: true };
    addError = { username: '', password: '', email: '', groupname: '', isActive: '' };
  }

  function resetUpdate() {
    updateError = { password: '', email: '', groupname: '', isActive: '' };
    newPassword = ""
  }

  async function addUser() {
    try {
      const response = await axios.post('http://localhost:3000/create', newUser, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // Send cookies with the request
      });

      if (response.status === 200) {
        users = [{ ...newUser }, ...users];
        triggerAlert("New user added sucessfully", "green");
        resetAdd();
      }
    } catch (error: any) {
      if (error.response.status === 403 || error.response.status === 401) {
        triggerAlert(error.response.data.message, "red");
        setTimeout(()=>location.reload(), 1000);
      } else {
        console.log(error.response.data)
        addError = error.response.data.fields || 'An unexpected error occurred.';
      }
    } finally {
      resetUpdate();
      editingIndex = null;
    }
  }

  async function saveUser(index: number) {
    let updateUser : any = users[index];
    updateUser = { ...updateUser, password: newPassword };

    try {
      const response = await axios.post('http://localhost:3000/update', updateUser, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // Send cookies with the request
      });

      if (response.status === 200) {
        resetUpdate();
        triggerAlert("User updated sucessfully", "green");
        editingIndex = null;
      }
    } catch (error: any) {
      if (error.response.status === 403 || error.response.status === 401) {
        triggerAlert(error.response.data.message, "red");
        setTimeout(()=>location.reload(), 1000);
      } else {
        updateError = error.response.data.fields || 'An unexpected error occurred.';
      }
    } finally {
      resetAdd();
    }
  }

  function editUser(index: number) {
    originalGroup = [...users[index].groupname];  // Add before change group to temp var
    editingIndex = index; // Enter edit mode for user at this index
    resetAdd();
    resetUpdate();
  }

  function cancelEdit(index: number) {
    users[index].groupname = originalGroup; //Restore group to before change
    resetAdd();
    resetUpdate();
    editingIndex = null;
  }

  async function createGroup() {
    try {
      const response = await axios.post('http://localhost:3000/creategroup/', { groupname: newGroup }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // Send cookies with the request
      });

      if (response.status === 200) {
        groupSelect = [newGroup, ...groupSelect];
        resetAdd();
        triggerAlert("New group created sucessfully", "green");
      }
    } catch (error: any) {
      if (error.response.status === 403 || error.response.status === 401) {
        triggerAlert(error.response.data.message, "red");
        setTimeout(()=>location.reload(), 1000);
      } else {
        addError.groupname = error.response.data.message || 'An unexpected error occurred.';
      }
    } finally {
      newGroup = '';
      resetUpdate();
      addError.username = '';
      addError.password = '';
      addError.email = '';
      editingIndex = null;
    }
  }
</script>

<Alert alertMessage={alertMessage} bgColor={alertColour}/>

<div class="container">
  <h2>User Management</h2>
  <br />
  {#if addError.groupname}
    <div class="error-group">{addError.groupname}</div>
  {/if}
  <div class="input-group">
    <label for="newGroup">Group Name:</label>
    <input class="input" type="text" bind:value={newGroup} id="newGroup" />
    <button class="btn" on:click={createGroup}>+</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>Username</th>
        <th>Password</th>
        <th>Email</th>
        <th>Group</th>
        <th>Active</th>
        <th>Create/Edit</th>
      </tr>
    </thead>
    
    <tbody>
      <tr>
        <td>
          {#if addError.username}
            <div class="error">{addError.username}</div>
          {/if}
          <input class="input" type="text" placeholder="Username" bind:value={newUser.username} />
        </td>
        <td>
          {#if addError.password}
            <div class="error">{addError.password}</div>
          {/if}
          <input class="input" type="password" placeholder="Password" bind:value={newUser.password} />
        </td>
        <td>
          {#if addError.email}
            <div class="error">{addError.email}</div>
          {/if}
          <input class="input" type="email" placeholder="Email" bind:value={newUser.email} />
        </td>
        <td>
          {#if groupSelect.length > 0}
          <MultiSelect bind:value={newUser.groupname} placeholder='' options={groupSelect} />
          {:else}
          <p>No groups available</p>
          {/if}
          <!-- <select bind:value={newUser.groupname}>
            {#each groupSelect as groups}
              <option value={groups}>{groups}</option>
            {/each}
          </select> -->
        </td>
        <td>
          <input type="checkbox" bind:checked={newUser.isActive} />
        </td>
        <td>
          <button class="btn" on:click={addUser}>➕</button>
        </td>
      </tr>

  {#if loading}
    <p>Loading group options...</p>
    {:else}
      {#each users as user, index}
        <tr>
          <td>{user.username}</td>
          {#if editingIndex === index}
            <td>
              {#if updateError.password}
                <div class="error">{updateError.password}</div>
              {/if}
              <input class="input" type="password" bind:value={newPassword} placeholder="********" />
            </td>
            <td>
              {#if updateError.email}
                <div class="error">{updateError.email}</div>
              {/if}
              <input class="input" type="email" bind:value={user.email} placeholder="" />
            </td>
            <td>
              {#if updateError.groupname}
                <div class="error">{updateError.groupname}</div>
              {/if}
              {#if groupSelect.length > 0}
                <MultiSelect bind:selected={user.groupname} placeholder='' options={groupSelect} />
              {:else}
              <p>No groups available</p>
              {/if}
              <!-- <select bind:value={user.groupname}>
                {#each groupSelect as groups}
                  <option value={groups}>{groups}</option>
                {/each}
              </select> -->
            </td>
            <td>
              {#if updateError.isActive}
                <div class="error">{updateError.isActive}</div>
              {/if}
              <input type="checkbox" bind:checked={user.isActive} />
            </td>
            <td>
              <button class="btn btn-save" on:click={() => saveUser(index)}>Save</button>
              <button class="btn btn-cancel" on:click={() => cancelEdit(index)}>Cancel</button>
            </td>
          {:else}
            <td>********</td>
            <td>{user.email ?? ""}</td>
            <td>{(user.groupname ?? []).join(',  ')}</td>
            <td><input type="checkbox" bind:checked={user.isActive} disabled /></td>
            <td>
              <button class="btn" on:click={() => editUser(index)}>✏️</button>
            </td>
          {/if}
        </tr>
      {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  .container {
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .error {
    color: red;
    font-size: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border: 1px solid #ccc;
  }

  .input-group {
    gap: 10px;
    margin-bottom: 10px;
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

  .btn-save {
    background-color: green;
  }

  .btn-cancel {
    background-color: red;
  }

  .error-group{
    color: red;
    font-size: 12px;
    margin-left: 110px;
    position: absolute;
    margin-top: -15px;
  }

  .input{
    padding: 8px 16px;
  }
</style>
