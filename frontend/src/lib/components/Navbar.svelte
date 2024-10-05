<script>
    export let isAdmin;
</script>

<div class="navbar">
  <div class="nav-left">
    <a href="/applist" >Task Management</a>
    {#if $isAdmin}
    <a href="/usermanagement" >User Management</a>
    {/if}
  </div>
  <div class="nav-right">
    <a href="/profile" >Profile</a>
    <a href="/logout" >Log Out</a>
  </div>
</div>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    background-color: #fff;
    border-bottom: 1px solid #ccc;
  }

  .nav-left, .nav-right {
    display: flex;
    gap: 20px;
  }

  a {
    cursor: pointer;
    font-size: 18px;
    color: #000;
    text-decoration: none;
  }

  a:hover {
    color: #007bff;
  }
</style>