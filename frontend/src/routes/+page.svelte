<script lang="ts">
  import { goto } from "$app/navigation";
  import axios from "axios";

  let username : string | null;
  let password : string | null;
  let loading : boolean = false;
  let errorMessage : string | null;
  let isLoggedIn : boolean = false;

  async function login() {
    loading = true; // Set loading state
    errorMessage = ''; // Clear previous errors

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username, 
        password
      }, {
        headers: { "Content-Type": "application/json"},
        withCredentials: true  // Send cookies with the request
      },
    );

      console.log(response);

      if (response.status === 200) {
        isLoggedIn = true;
        goto('/applist'); // Redirect on success
      } 
    } catch (error: any) {
      // console.error(error);
      errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
    } finally {
      loading = false; // Reset loading state
    }
  }
</script>

<div class="login-container">
  <form class="login-form" on:submit|preventDefault={login}>
    <input type="text" placeholder="Username" bind:value={username} required />
    <input type="password" placeholder="Password" bind:value={password} required />
    <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
  </form>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    width: 300px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .login-form input {
    margin-bottom: 15px;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .login-form button {
    padding: 10px;
    font-size: 16px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .login-form button:hover {
    background-color: #555;
  }

  .error-message {
    color: red;
    margin-top: 10px;
  }
</style>
