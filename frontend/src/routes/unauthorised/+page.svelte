<script lang="ts">
    import { isLoggedIn } from '$lib/stores/states.ts';
    import { goto } from "$app/navigation";import axios from 'axios';
    import { onMount } from 'svelte';

    // Set the logged-in state to false when the user is unauthorized
    isLoggedIn.set(false);

    onMount(async () => {
    try {
        await axios.get('http://localhost:3000/logout/', {
        headers: { "Content-Type": "application/json"},
        withCredentials: true  // Send cookies with the request
      },
    );
    } catch (error: any) {
      return error.response?.data?.message || 'An unexpected error occurred.';
    }   
    });

    function returnHome() {
        goto('/'); // Redirect to the home (login) page
    }
</script>

<div class="unauthorized-container">
    <h1 class="title">Access Forbidden</h1>
    <h3 class="subtitle">You are not allowed to access this page.</h3>
    <p class="message">Please log in to continue.</p>
    <button class="login-button" on:click={returnHome}>Go to Login Page</button>
</div>

<style>
  /* Style the unauthorized page */
  .unauthorized-container {
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
    color: #ff6b6b;
    margin-bottom: 10px;
    font-family: 'Arial', sans-serif;
  }

  .subtitle {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
  }

  .message {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 30px;
  }

  .login-button {
    padding: 12px 24px;
    font-size: 1rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .login-button:hover {
    background-color: #0056b3;
  }

  /* Add some responsiveness */
  @media (max-width: 768px) {
    .title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1.25rem;
    }

    .message {
      font-size: 1rem;
    }
  }
</style>