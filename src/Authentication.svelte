<script>
  import { onMount } from "svelte";
  import { authenticated, saveItem } from "./stores/store.js";
  import {
    ERROR,
    NULL,
    INFO_PACKET,
    REGISTER_PACKET,
    REGISTER_RESPONSE,
    LOGIN_PACKET,
    LOGIN_RESPONSE,
  } from "./packet";

  var authenticationPacket = {
    id: null,
    credentials: null,
    email: null,
    username: null,
    password: null,
    timestampe: null,
  };

  let LOGIN = -1;
  let REGISTER = 1;
  let authenticationState = REGISTER;
  let client;
  let accountUrl = "wss://localhost:49151/account";
  let errorMessage;
  let accountCreated = false;
  let canSend = false;
  let disabled = true;

  onMount(() => {
    createConnection();
    setupInputFocusEvent();
  });

  function setupInputFocusEvent() {
    let inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("focus", () => {
        if (errorMessage === "Fill in all the fields") errorMessage = null;
      });
    }
  }

  function createConnection() {
    client = new WebSocket(accountUrl);
    client.onopen = clientOpen;
    client.onclose = clientClose;
    client.onmessage = serverMessage;
    client.onerror = clientError;
  }

  function clientOpen() {
    canSend = true;
    disabled = !canSend;
  }
  function clientClose() {
    canSend = false;
    disabled = !canSend;
  }
  function serverMessage(event) {
    var packet = JSON.parse(event.data);

    switch (packet.id) {
      case REGISTER_RESPONSE:
        if (packet.accountCreated) {
          authenticationPacket.email = null;
          authenticationPacket.password = null;
          disabled = false;
          accountCreated = true;
          switchUserInterface();
          accountCreated = true;
        }
        break;

      case LOGIN_RESPONSE:
        if (packet.accountAuthenticated) {
          saveItem("username", authenticationPacket.username);
          $authenticated = true;
        }
        break;

      case INFO_PACKET:
        console.log(packet.connectionId);
        break;

      case ERROR:
        disabled = false;
        errorMessage = packet.error_message;
        clearForm();
        break;

      case NULL:
        break;

      default:
        break;
    }
  }
  
  function clientError() {
    canSend = false;
    disabled = !canSend;
  }

  function switchUserInterface() {
    errorMessage = null;
    accountCreated = false;
    authenticationState = authenticationState * -1;
  }

  function sendPacket() {
    authenticationPacket.timestampe = new Date();
    if (canSend) client.send(JSON.stringify(authenticationPacket));
  }

  function clearForm() {
    authenticationPacket.timestampe = null;
    authenticationPacket.id = -1;
    authenticationPacket.password = "";
  }

  function submitForm() {
    if (!validForm()) return;

    disabled = true;
    switch (authenticationState) {
      case REGISTER:
        authenticationPacket.id = REGISTER_PACKET;
        break;

      case LOGIN:
        authenticationPacket.id = LOGIN_PACKET;
        authenticationPacket.credentials = authenticationPacket.username;
        break;

      default:
        break;
    }

    sendPacket();
  }

  function validForm() {
    let validForm = true;

    switch (authenticationState) {
      case REGISTER:
        if (!authenticationPacket.username) validForm = false;
        if (!authenticationPacket.password) validForm = false;
        if (!authenticationPacket.email) validForm = false;

        if (!validForm) {
          errorMessage = "Fill in all the fields";
        }

        if (validForm && authenticationPacket.username.length < 6) {
          errorMessage = "Username must be at least 6 characters";
          validForm = false;
        }

        if (validForm && authenticationPacket.password.length < 8) {
          errorMessage = "Password must be at least 8 characters";
          validForm = false;
        }
        break;

      case LOGIN:
        if (!authenticationPacket.username) validForm = false;
        if (!authenticationPacket.password) validForm = false;

        if (!validForm) {
          errorMessage = "Fill in all the fields";
        }

        if (validForm && authenticationPacket.username.length < 6) {
          errorMessage = "Username must be at least 6 characters";
          validForm = false;
        }

        if (validForm && authenticationPacket.password.length < 8) {
          errorMessage = "Password must be at least 8 characters";
          validForm = false;
        }
        break;

      default:
        break;
    }

    return validForm;
  }
</script>

<div id="grid-container">
  <div id="logo-area">&nbsp;</div>
  <div
    id="form-area"
    style={authenticationState == LOGIN ? "height:22rem !important;" : ""}
  >
    <div id="form">
      <div id="form-inputs">
        {#if accountCreated}
          <div>
            <span id="account-created"
              >Account has been created, you can login now</span
            >
          </div>
        {/if}
        {#if authenticationState == REGISTER}
          <div class="form-input">
            <input
              bind:value={authenticationPacket.email}
              type="email"
              placeholder="Email"
            />
          </div>
        {:else}
          <div class="form-input block">
            <input type="email" />
          </div>
        {/if}
        <div class="form-input">
          <input
            bind:value={authenticationPacket.username}
            type="text"
            placeholder="Username"
          />
        </div>
        <div class="form-input">
          <input
            bind:value={authenticationPacket.password}
            type="password"
            placeholder="Password"
          />
        </div>
      </div>
      {#if errorMessage}
        <br />
        <span id="errorMessage">{errorMessage}</span>
        <br />
      {/if}
      {#if authenticationState == REGISTER}
        <br />
        <span
          >Already registered an account? <button
            on:click={switchUserInterface}
            id="swap-ui-btn">login</button
          > here</span
        >
        <br />
        <button on:click={submitForm} {disabled} id="submit-ui-btn"
          >Register</button
        >
      {:else}
        <br />
        <span
          >Don't have an account? <button
            on:click={switchUserInterface}
            id="swap-ui-btn">register</button
          > here</span
        >
        <br />
        <button on:click={submitForm} {disabled} id="submit-ui-btn"
          >Login</button
        >
      {/if}
    </div>
  </div>
</div>

<style>
  #logo-area {
    grid-area: "logo";
    height: 19rem;
    background-image: url("../main-logo.svg");
    background-repeat: no-repeat;
    background-position: center;
  }

  #form-area {
    grid-area: "form-box";
    height: 25rem;
  }

  #form {
    width: 35%;
    min-height: 100%;
    margin-top: 10%;
    margin: 0px auto;
    background-color: #16124c;
    border: 2px solid #1dc7da;
    border-radius: 10px;
  }

  span {
    margin-left: 25px;
  }

  #form-inputs {
    margin-top: 10%;
  }

  .form-input {
    width: 90%;
    margin: 0px auto;
  }

  .form-input,
  input {
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 21px;
    font-weight: bold;
  }

  input {
    width: 100%;
    height: 2.6rem;
    color: black;
  }

  #swap-ui-btn {
    background-color: transparent;
    border: none !important;
    color: #1dc7da;
    cursor: pointer;
  }

  #submit-ui-btn {
    width: 90%;
    height: 3.1rem;
    margin-top: 2%;
    margin-left: 25px;
    margin-right: 25px;
    background-color: #6347ab;
    color: #fff;
    cursor: pointer;
    border: none;
    font-size: 26px;
    transition-duration: 300ms;
  }

  #submit-ui-btn:disabled {
    cursor: default;
    background-color: #3c2b66;
    color: transparent;
    transform: translateY(9px);
    transition-duration: 700ms;
  }

  #submit-ui-btn:hover:enabled {
    background-color: #8663dd;
  }

  .block {
    display: none;
  }

  #errorMessage {
    color: red;
    font-weight: bolder;
  }

  #account-created {
    color: green;
    font-weight: bolder;
  }

  #grid-container {
    display: grid;
    grid-template-areas:
      "logo"
      "form";
    padding: 10px;
  }
</style>
