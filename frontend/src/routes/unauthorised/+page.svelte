<script lang="ts">
    import { onMount } from 'svelte';
    import { isLoggedIn } from '$lib/stores/states';

    // To render navbar
    $: isLoggedIn.set(true);
    let message : string = "";

    onMount(() => {
      const url = new URL(window.location.href);
      const state = decodeURIComponent(url.search);

      if(state === "?account_disabled") {
        message = "You account is disabled."
      }

      if(state === "?unauthorised") {
        message = "You are unauthorised to view the page."
      }

      if(state === "?not_admin") {
        message = "You are not an admin."
      }
    });
</script>

<div class="unauthorized-container">
    <h1 class="title">Access Forbidden</h1>
    <h3 class="subtitle">{message}</h3>
    <p class="message">Please use the navbar to navigate back or logout.</p>
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