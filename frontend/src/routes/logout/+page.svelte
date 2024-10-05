<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { isLoggedIn } from '$lib/stores/states.ts';
    import axios from 'axios';

    onMount(async () => {
    try {
        const response = await axios.get('http://localhost:3000/logout/', {
        headers: { "Content-Type": "application/json"},
        withCredentials: true  // Send cookies with the request
      },
    );
      if (response.status === 200) {
        setTimeout(() => {
            isLoggedIn.set(false);
            goto('/'); // Redirect to the login page after 3 seconds
        }, 3000);
      } 
    } catch (error: any) {
      return error.response?.data?.message || 'An unexpected error occurred.';
    }   
    });
</script>

<div class="logout-container">
    <h1 class="title">Successfully Logged Out</h1>
    <p class="message">You will be redirected to the homepage shortly...</p>
</div>

<style>
  .logout-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-color: #f9f9f9;
    padding: 20px;
  }

  .title {
    font-size: 2.5rem;
    color: #28a745;
    margin-bottom: 10px;
    font-family: 'Arial', sans-serif;
  }

  .message {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
  }
</style>