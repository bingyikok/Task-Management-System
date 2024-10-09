<script lang="ts">
    import { page } from '$app/stores'
    import axios from "axios";
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { isLoggedIn } from '$lib/stores/states';
    import Alert from '$lib/components/Alert.svelte'

  let username: string = $page.data.username || 'Loading...';
  let email: string = $page.data.email;
  let newCredentials : { [key: string]: string } = { username: username, email: '', password: '', change: '' };
  let emailError: string = null;
  let passwordError: string = null;
  let alertMessage: string = null;

  $: isLoggedIn.set($page.data.isActive);

  onMount(() => {
    if ($page.data.status === 403) {
    const message : string = encodeURIComponent("unauthorised");
      goto(`/unauthorised?${message}`);
    } else if (!$isLoggedIn) {
      const message : string = encodeURIComponent("account_disabled");
      goto(`/unauthorised?${message}`);
    }
  })

  async function changeCredentials(state: string) {
    emailError = null;
    passwordError = null;
    newCredentials.change = state;

    try {
      const response = await axios.post('http://localhost:3000/change/', 
        newCredentials, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true  // Send cookies with the request
      });
      console.log(response.status === 200);
      
      if (response.status === 200) {
        switch (response.data.type){
            case "email": 
            emailError = 'Email changed sucessfully';
            email = newCredentials.email;
            newCredentials.email = '';
            triggerAlert('Email successfully changed');
            break;

            case "password":
            passwordError = 'Password changed sucessfully';
            newCredentials.password = '';
            triggerAlert('Password successfully changed');
            break;
        }
      }
    } catch (error: any) {
        switch (error.response.data.type) {
            case "email": 
            emailError = error.response?.data?.message || 'An unexpected error occurred.';
            break;

            case "password":
            passwordError = error.response?.data?.message || 'An unexpected error occurred.';
            break;
    }
  }
}

function triggerAlert(message: string) {
    alertMessage = null; // Need to have a state change in prop
    alertMessage = message;
  }

</script>

<Alert {alertMessage} />

<div class="container">
  <div class="info-group">
    <p class="info-label">Username:</p>
    <p class="info-value">{username}</p>
  </div>
  <div class="info-group">
    <p class="info-label">Email:</p>
    <p class="info-value">{email??"NIL"}</p>
  </div>

  <div class="form-group">
    <label for="newEmail">New Email:</label>
    {#if emailError}
      <div class="error">{emailError}</div>
    {/if}
    <input type="email" bind:value={newCredentials.email} placeholder="New Email" />
    <button on:click={()=>changeCredentials("email")}>Change Email</button>
    
  </div>

  <div class="form-group">
    <label for="newPassword">New Password:</label>
    {#if passwordError}
      <div class="error">{passwordError}</div>
    {/if}
    <input type="password" bind:value={newCredentials.password} placeholder="New Password" />
    <button on:click={()=>changeCredentials("password")}>Change Password</button>
  </div>
</div>

<style>
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .info-group {
    display: flex;
    align-items: center; /* Center items vertically */
    margin-bottom: 10px; /* Space between info groups */
  }

  .info-label {
    margin-right: 10px; /* Space between label and value */
    width: 120px; /* Fixed width for label */
    font-weight: bold; /* Make label bold */
  }

  .info-value {
    margin-left: 0; /* No additional margin */
  }

  .form-group {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .form-group label {
    margin-right: 10px;
    width: 120px; /* Fixed width for label */
  }

  .error {
    position: absolute;
    margin-left: 135px;
    margin-bottom: 50px;
    color: red;
    font-size: 12px;
  }

  input {
    padding: 8px;
    width: 30%;
    margin-right: 10px;
  }

  button {
    padding: 8px 16px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
