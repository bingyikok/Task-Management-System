<script lang="ts">
  import axios from "axios";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  export let app_acronym : string;
  export let plans : {[key:string]:string}[];
  export let isPM : boolean;
  
  let errorMessage: { [key: string]: string } = {};
  let newPlan: { [key: string]: string } = {
    plan_app_acronym: app_acronym,
    plan_name: '',
    plan_startdate: "",
    plan_enddate: "",
    plan_colour: "#ffffff"
  };

  async function createPlan() {
    try {
      const response = await axios.post('http://localhost:3000/createplan', newPlan, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (response.status === 200) {
        // plans = [{ ...newPlan }, ...plans];
        newPlan = {
          plan_app_acronym: app_acronym,
          plan_name: '',
          plan_startdate: "",
          plan_enddate: "",
          plan_colour: "#ffffff"
        };
        errorMessage = {};
        dispatch('created', { message: "Plan successfully created", colour: "green"});
      }
    } catch (error) {
        if (error.response.status === 400 || 403) {
            errorMessage = error.response.data.fields || 'An unexpected error occurred.';
            dispatch('error', {message: error.response.data.message, colour: "red"})
        } else {
            alert(error.response.data || "An unexpected error occurred.");
        }
      
    } finally {
        try{
            const response = await axios.post('http://localhost:3000/plans', {app_acronym: app_acronym}, {
                headers: { 'content-type' : 'application/json'}, 
                withCredentials: true
            });

            if (response.status === 200) {
                plans = response.data.existingPlans;
            }
        } catch (error) {
            alert(error.response.data || "An unexpected error occurred.");
        } 
    }
  }

  function closePopup() {
    dispatch("close");
  }
</script>

<div class="popup-overlay">
  <div class="popup-content">
    <div class="popup-header">
      <h2>Plans</h2>
      <button class="close-btn" on:click={closePopup}>✖</button>
    </div>

    <div class="popup-body">
    {#if isPM}
      <div class="plan-form">

        <div class="form-group">
          <label for="planName">Plan Name</label>
          {#if errorMessage.plan_mvp_name}
            <div class="error">{errorMessage.plan_mvp_name}</div>
          {/if}
          <input
            type="text"
            id="planName"
            bind:value={newPlan.plan_mvp_name}
            placeholder="Plan name"
            class="input-text"
          />
        </div>

        <div class="form-group">
          <label for="startDate">Start Date</label>
          {#if errorMessage.plan_startdate}
            <div class="error">{errorMessage.plan_startdate}</div>
          {/if}
          <input
            type="date"
            id="startDate"
            bind:value={newPlan.plan_startdate}
            class="input-date"
          />
        </div>

        <div class="form-group">
          <label for="endDate">End Date</label>
          {#if errorMessage.plan_enddate}
            <div class="error">{errorMessage.plan_enddate}</div>
          {/if}
          <input
            type="date"
            id="endDate"
            bind:value={newPlan.plan_enddate}
            class="input-date"
          />
        </div>

        <div class="colour-group">
          <label for="colourPicker">Colour</label>
          {#if errorMessage.plan_colour}
            <div class="error">{errorMessage.plan_colour}</div>
          {/if}
          <input
            type="color"
            id="colourPicker"
            bind:value={newPlan.plan_colour}
            class="colour-picker"
          />
        </div>
        
        <button class="create-btn" on:click={createPlan}>Create Plan</button>
      </div>
    {/if}
      <div class="plan-list-container">
        <table class="plan-list">
          <tr>
            <td>Plan Name</td>
            <td>Start Date</td>
            <td>End Date</td>
            <td>Colour</td>
          </tr>
          {#if !plans.length}
          <p>No existing plans for {app_acronym}</p>
          {:else}
          {#each plans as plan}
            <tr>
              <td>{plan.plan_mvp_name}</td>
              <td>
                <input type="date" bind:value={plan.plan_startdate} class="startdate" disabled/>
              <td>
                <input type="date" bind:value={plan.plan_enddate} class="enddate" disabled/>
              </td>
              <td>
                <input
                  type="color"
                  value={plan.plan_colour}
                  disabled
                  class="colour-picker"
                />
              </td>
            </tr>
          {/each}
          {/if}
        </table>
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
  }

  .popup-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    height: 80%;
    overflow-y: auto;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .popup-header h2 {
    margin: 0;
  }

  .close-btn {
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }

  .popup-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .plan-form {
    position: relative;
    display: flex;
    gap: 30px;
    flex-wrap: nowrap;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .form-group label {
    margin-bottom: 5px;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .colour-picker {
    width: 40px;
    height: 40px;
    border: none;
    cursor: pointer;
  }

  .create-btn {
    padding: 10px 20px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    align-self: flex-end;
  }

  .create-btn:hover {
    background-color: #555;
  }

  .plan-list-container {
    max-height: 100%;
    overflow-y: auto;
  }

  .plan-list {
    border-collapse: collapse;
    width: 100%;
    overflow-y: auto;
  }

  .plan-list td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }

  .error {
    position: absolute;
    color: red;
    font-size: 12px;
    margin-top: 60px;
  }

  .startdate, .enddate {
    border: none;
    background: none;
  }
</style>