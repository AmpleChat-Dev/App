<script>
  import { onMount } from "svelte";
  import { authenticated, getItem, saveItem, removeKey } from "./stores/store";
  import AddContact from "./AddContact.svelte";
  import CreateGroup from "./CreateGroup.svelte";
  import {
    ERROR,
    NULL,
    INFO_PACKET,
    ACCOUNT_INFO_PACKET,
    CONTACT_REQUEST_PACKET,
    CONTACTS_PACKET,
    DISCONNECT_PACKET,
    SEND_CONTACT_REQUEST_PACKET_RESPONSE,
    CHAT_MESSAGE_PACKET,
    CHAT_MESSAGES_PACKET,
  } from "./packet";

  var packet = {
    id: null,
    timestampe: null,
    data: null,
    username: getItem("username"),
  };

  let client;
  let accountUrl = "ws://localhost:49152/chat";
  let errorMessage;
  let canSend;
  let disabled;
  let messageContainer;
  let messageValue;
  let onlineCount = 0;
  let userId = undefined;
  let activeContact = undefined;
  let contactList = [];
  let contactRequest = [];
  let contactErrorMessage = "";
  let modal;

  onMount(() => {
    createConnection();
  });

  function createConnection() {
    if (!client) client = new WebSocket(accountUrl);

    client.onopen = clientOpen;
    client.onclose = clientClose;
    client.onmessage = serverMessage;
    client.onerror = clientError;

    packet.id = ACCOUNT_INFO_PACKET;
  }

  function clientOpen() {
    canSend = true;
    disabled = !canSend;
  }

  function clientClose() {
    canSend = false;
    disabled = !canSend;
  }

  function sendMessage() {
    if (messageValue) {
      const child = document.createElement("div");

      child.textContent = messageValue;
      child.classList.add("message");
      child.classList.add("message-self");

      messageContainer.appendChild(child);

      messageContainer.scrollTop = messageContainer.scrollHeight;

      send({
        id: CHAT_MESSAGE_PACKET,
        receiver: `${activeContact.id}`,
        message: messageValue,
      });

      messageValue = "";
    }
  }

  function openChat(event) {
    userId = event.target.dataset.id;
    activeContact = contactList[userId];

    send({
      id: CHAT_MESSAGES_PACKET,
      receiver: `${activeContact.id}`,
    });
  }

  function serverMessage(event) {
    var packet = JSON.parse(event.data);
    switch (packet.id) {
      case INFO_PACKET:
        sendPacket();
        clearForm();
        break;

      case ERROR:
        disabled = false;
        errorMessage = packet.error_message;
        clearForm();
        break;

      case NULL:
        break;

      case CONTACT_REQUEST_PACKET:
        let requests = JSON.parse(packet.requests);
        if (requests) {
          let temp = [];
          for (let i = 0; i < requests.length; i++) {
            temp.push({
              name: requests[i].senderName,
              id: requests[i].id,
            });
          }
          contactRequest = temp;
        }
        contactRequest = contactRequest;
        break;

      case CONTACTS_PACKET:
        let contacts = JSON.parse(packet.contacts);
        if (contacts) {
          onlineCount = 0;
          contactList = [];
          for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].Online) {
              onlineCount++;
            }

            contactList.push({
              name: contacts[i].Name,
              id: contacts[i].Id,
              online: contacts[i].Online,
            });
          }
          contactList = contactList;
        } else return;
        break;
      case SEND_CONTACT_REQUEST_PACKET_RESPONSE:
        modal.handleResponse(packet);
        break;

      case CHAT_MESSAGES_PACKET:
        messageContainer.innerHTML = '';
      
        let messages = JSON.parse(packet.messages);

        let receiverId = packet.receiver;

        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];

          const child = document.createElement("div");

          child.textContent = message.Message;
          child.classList.add("message");

          if (activeContact.id == message.SenderId) {
            child.classList.add("message-other");
          } else {
            child.classList.add("message-self");
          }

          messageContainer.appendChild(child);

          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
        break;
      default:
        break;
    }
  }
  function clientError() {
    canSend = false;
    disabled = !canSend;
  }

  function sendPacket() {
    packet.timestampe = new Date();
    if (canSend) client.send(JSON.stringify(packet));
  }

  function send(packet) {
    if (canSend) client.send(JSON.stringify(packet));
  }

  function clearForm() {
    packet.timestampe = null;
    packet.id = -1;
    packet.data = [];
  }

  function acceptRequest(event) {
    let id = event.target.dataset.id;
    let elementId = event.target.dataset.elementId;

    contactRequest.splice(elementId, 1);
    //contactRequest = contactRequest;

    send({
      id: CONTACT_REQUEST_PACKET,
      requestId: id,
      accept: true,
      timestampe: new Date(),
    });
  }

  function declineRequest(event) {
    let id = event.target.dataset.id;
    let elementId = event.target.dataset.elementId;

    contactRequest.splice(elementId, 1);
    //contactRequest = contactRequest;

    send({
      id: CONTACT_REQUEST_PACKET,
      requestId: id,
      accept: false,
      timestampe: new Date(),
    });
  }

  function logout() {
    $authenticated = false;
    removeKey("username");
    send({
      id: DISCONNECT_PACKET,
    });
  }
</script>

<div id="home-container">
  <div id="nav-bar">
    <div id="nav-title">
      <h1>AmpleChat</h1>
    </div>
    <div id="nav-actions">
      <AddContact
        bind:this={modal}
        sendPacket={send}
        errorMessage={contactErrorMessage}
      />
      <CreateGroup />
      <button on:click={logout}>Logout</button>
    </div>
  </div>
  <div id="side-bar">
    <div>
      <h3>{packet.username}</h3>
      <h3>Online ({onlineCount})</h3>
      <br />
    </div>
    {#each contactRequest as request, i}
      <div class="contact-request-card">
        <div class="contact-request-card-title">{request.name}</div>
        <button
          class="contact-request-card-btn acc"
          on:click={acceptRequest}
          data-id={request.id}
          data-elementId={i}>Accpet</button
        >
        <button
          class="contact-request-card-btn dec"
          on:click={declineRequest}
          data-id={request.id}
          data-elementId={i}>Decline</button
        >
      </div>
    {/each}
    <hr />
    {#each contactList as contact, i}
      <div class="contact-card">
        <img
          class="contact-card-image"
          src="https://eu.ui-avatars.com/api/?name={contact.name}"
          alt=""
        />
        <div class="contact-card-title">
          {contact.name}
          {contact.online === true ? "Online" : "Offline"}
        </div>
        <button class="contact-card-btn" data-id={i} on:click={openChat}
          >Open Chat</button
        >
      </div>
    {/each}
  </div>
  <div id="view-bar">
    {#if activeContact}
      <div id="view-bar-header">
        <img
          class="view-bar-img"
          src="https://eu.ui-avatars.com/api/?name={activeContact.name}"
          alt=""
        />
        <h2>{activeContact.name}</h2>
      </div>
      <div id="view-bar-content" bind:this={messageContainer} />
      <div id="view-bar-nav">
        <button>+</button>
        <input
          on:keypress={(e) => {
            if (e.key == "Enter") {
              sendMessage();
            }
          }}
          id="text-input"
          bind:value={messageValue}
        />
        <button on:click={sendMessage}>Send</button>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.message) {
    display: inline !important;
    width: 50% !important;
    min-height: 5% !important;
    height: auto !important;
    margin-top: 15px;
    margin-left: 15px;
    margin-right: 15px;
    border-radius: 5px;
    padding-left: 10px;
    padding-top: 10px;
    padding-right: 10px;
    overflow-wrap: break-word;
  }

  :global(.message-self) {
    float: right;
    background-color: #6347ab !important;
  }

  :global(.message-self::before) {
    content: "You: " !important;
    color: red;
  }

  :global(.message-other::before) {
    content: var(--message-other-content) !important;
    color: green;
  }

  :global(.message-other) {
    float: left;
    background-color: #9c84dd !important;
  }

  #side-bar div {
    width: 80%;
    border-radius: none !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: clip !important;
    margin: 0px auto;
  }

  #view-bar {
    grid-area: view-bar;
    height: 88vh;
    margin-left: 10px;
    border: 2px solid #484c7b !important;
    border-radius: 5px;
  }
  .view-bar-img {
    border-radius: 50%;
    width: 75px;
    height: 75px;
    border: 2px solid #484c7b !important;
  }

  #view-bar-header {
    background-color: #21124c !important;
  }

  #view-bar-header h2 {
    display: inline-block;
  }

  #view-bar-content {
    height: 34rem;
    overflow-y: auto !important;
    background-color: #1c1658 !important;
  }

  #view-bar-nav {
    height: 3.2rem;
    margin-top: 2px;
    display: grid;
    grid-template-columns: 5% 80% 15%;
  }

  #view-bar-nav input {
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
  }

  #view-bar-nav button {
    margin-top: 5px;
    background-color: #743faa !important;
    font-size: 18px;
    font-weight: bolder;
  }

  #view-bar-nav button:active {
    transform: translateY(10px);
    transition-duration: 700ms;
  }

  .contact-card {
    display: grid;
    margin-top: 15px !important;
    border: 2px solid #1dc7da !important;
    border-radius: 6px;
    grid-template-areas:
      "card-image card-title card-title card-title card-title"
      "card-image card-btn card-btn card-btn card-btn";
  }

  .contact-card-image {
    grid-area: card-image;
    background-color: red;
  }

  .contact-card-title {
    grid-area: card-title;
    width: 100% !important;
    margin-top: 10px !important;
    margin-bottom: 5px !important;
  }

  /* .contact-card-title::after {
    min-width: 12px;
    min-height: 12px;
    display: inline-block;
    content: "";
    border-radius: 50%;
    background-color: #35d432;
    margin-left: 0.5rem;
  } */

  .contact-card-btn {
    background-color: #484c7b !important;
    margin-right: 0.5rem;
    margin-top: 0.25rem;
  }

  .contact-card-btn:hover {
    background-color: #6e73ad !important;
  }

  .contact-card-btn:active {
    transform: translateY(4px);
    color: gray !important;
    transition-duration: 100ms;
  }

  .contact-card img {
    border-radius: 50%;
    margin-top: 0.6rem;
    margin-left: 0.5rem;
  }

  .contact-request-card {
    display: grid;
    margin-top: 15px !important;
    border: 2px solid #1dc7da !important;
    background-color: rgb(54, 53, 53) !important;
    border-radius: 6px;
    grid-template-areas:
      "card-tile card-title"
      "acc-btn dec-btn";
  }

  .contact-request-card-title {
    grid-area: card-tile;
    width: 100% !important;
    margin-top: 10px !important;
    margin-bottom: 5px !important;
    text-align: center !important;
    padding-left: 45%;
  }

  .acc {
    grid-area: acc-btn;
    color: green;
    margin-left: 8px;
  }

  .dec {
    color: red;
    grid-area: dec-btn;
    margin-left: 5px;
  }

  .contact-request-card-btn {
    background-color: #484c7b !important;
    margin-right: 0.5rem;
    margin-top: 0.25rem;
  }

  .contact-request-card-btn:hover {
    background-color: #6e73ad !important;
  }

  .contact-request-card-btn:active {
    transform: translateY(4px);
    color: gray !important;
    transition-duration: 100ms;
  }

  #nav-bar {
    grid-area: navbar;
    display: grid;
    grid-template-areas: "nav-title nav-actions nav-actions nav-actions nav-actions nav-actions nav-actions nav-actions";
  }

  #nav-title {
    grid-area: nav-title;
  }

  #nav-actions {
    grid-area: nav-actions;
  }

  #nav-actions > button {
    background-color: #6347ab;
    color: white;
    width: 11rem;
    margin-left: 15%;
    margin-top: 2%;
    cursor: pointer;
    font-size: 20px;
  }

  #nav-title h1 {
    color: #1dc7da;
    font-size: 30px;
    text-align: center;
  }

  #side-bar {
    grid-area: side-bar;
    border: 2px solid #1dc7da;
    overflow-y: visible;
    background-color: #16124c !important;
  }

  #home-container {
    display: grid;
    grid-template-areas:
      "navbar navbar navbar navbar navbar"
      "side-bar view-bar view-bar view-bar view-bar";
    grid-template-columns: 300px 1fr;
  }
</style>
