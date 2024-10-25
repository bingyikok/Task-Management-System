<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';
    import { isLoggedIn, isAdmin } from '$lib/stores/states';
    import { page } from '$app/stores';
    
    $: isAdmin.set($page.data.isAdmin);
</script>

<div>
  <!-- Render the Navbar -->
  {#if $isLoggedIn}
  <Navbar {isAdmin} />
  {/if}

  <!-- Render the rest of the page -->
  <slot />
</div>

<style>
  div {
    padding: 0;
    margin: 0;
  }
</style>