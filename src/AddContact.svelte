<script>
    import { onMount } from "svelte";
    import {
    SEND_CONTACT_REQUEST_PACKET
  } from "./packet";

    export let sendPacket;
    export let errorMessage;

    export function handleResponse(response){
        errorMessage = response.message;
    }

    let userName;

    let showModal = false;

    function toggelModal(){
        showModal = !showModal;
        errorMessage = ''
    }

    function send(){
        if(!userName) {
            errorMessage = "Please enter a username"
            return;
        }

        sendPacket({
            id: SEND_CONTACT_REQUEST_PACKET,
            username: userName
        });
    }

    onMount(() =>{})
</script>

<button on:click={toggelModal}>Add Contact</button>

{#if showModal}
<div id="contact-form">
    <div id="contact-form-header">
        <div class="form-text">Add Contact</div> <button on:click={toggelModal}>X</button>
        <hr>
    </div>
    <div id="contact-form-body">
        <input placeholder="Username" bind:value={userName}>
        <div id="contact-form-error">{errorMessage}</div>
        <button on:click={send}>Send Contact Request</button>
    </div>
</div>
{/if}

<style>
#contact-form{
    width:35%;
    height: 30%;
    margin-top: 12%;
    position: fixed;
    background-color: #16124C;
    border-radius: 5px;
    border: 2px solid #484C7B;
    display: block;
    left: 50%;
    transform: translate(-50%, 0);
}
#contact-form-header{
    margin-top: 15px;
    width: 100%;
}
#contact-form-header > button{
    float: right !important;
    width: initial;
    margin-top: -15px;
    margin-right: 10px;
    background-color: transparent !important;
    border-radius: none !important;
    border: none !important;
}
#contact-form-header > .form-text{
    width: 50%;
    display: inline-block;
    margin-left: 20px;
    font-size: 20px;
}
#contact-form-header > hr{
    width: 99.5% !important;
}
#contact-form-body{
    width: 100% !important;
}
#contact-form-body > input{
    width: 95% !important;
    margin-top: 15px;
    margin-left: 15px;
    font-size: 21px;
    font-weight: bold;
}
#contact-form-error{
    width: 100%;
    margin-top: 5px;
    margin-left: 15px;
    color:red;
}
#contact-form-body > button{
    width: 95% !important;
    margin-top: 20px;
    margin-left: 15px !important;
    margin-bottom: 15px !important;
}
button {
    background-color: #6347ab;
    color: white;
    width: 11rem;
    margin-left: 15%;
    margin-top: 2%;
    cursor: pointer;
    font-size: 20px;
  }

  button:hover:enabled{
    background-color: #7756ca;
  }
  button:enabled:active{
    transform: translateY(10px);
    transition-duration: 250ms;
  }
</style>