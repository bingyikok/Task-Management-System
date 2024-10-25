<script lang="ts">
  import { fly } from 'svelte/transition';

  export let alertMessage: string = null;
  export let bgColor: string = null;

  $: if (alertMessage) {
    startTimer();
  }

  function startTimer() {
    setTimeout(() => {;
      alertMessage = null;
        }, 1500);
    }
</script>


{#if alertMessage}
  <div class="alert" style="background-color:{bgColor};" transition:fly="{{ y: 20, duration: 300 }}">
    {alertMessage}
  </div>
{/if}


<style>
  .alert {
    background-color: grey;
    color: white;
    padding: 10px;
    border-radius: 5px;
    position: fixed;
    top: 20px;
    left: 45%;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
     z-index: 1000;
  }
</style>