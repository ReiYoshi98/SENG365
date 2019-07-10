<template>
  <div id ="app" scroll="no" style="overflow: hidden">
    <h1 class="title" style="color:white"> Travel App </h1>
    <div class="navbar"></div>
    <div v-if="this.$cookie.get('authToken')"></div>
    <router-view></router-view>
    <div id="backgroundol"></div>
    <div id="background"></div>
  </div>
</template>

<style scoped>

  h1 {
    font-size: 40px;
    padding-left: 50px;
    padding-top: 10px;
  }
  .navbar {
    background-color: #424242;
    position: absolute; /* Set the nav bar to fixed position */
    top: 0; /* Position the nav bar at the top of the page */
    width: 100%;
    padding-bottom: 70px;
    border-style: solid;
    border-width: 2px;
    border-color: #FF8000;
    border-radius: 0px 0px 5px 5px;
    display: inline-block;
    z-index: -1;
  }

  #backgroundol {
    position: fixed;
    top:0;
    height: 100%;
    width: 100%;
    background-color: rgba(255,255,255,0.3);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
    z-index: -989;
  }

  #background {
    position: fixed;
    top:0;
    height: 100%;
    width: 100%;
    background-image: url("../images/background2.jpg");
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
    z-index: -999;
  }
</style>
