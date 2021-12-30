<script>
    import { onMount } from "svelte";
    import {
    SEND_CONTACT_REQUEST_PACKET
  } from "./packet";

    export let sendPacket;
    export let errorMessage;

    export function handleResponse(response){
        errorMessage = response;
    }

    let groupName;
    let allowContent;
    let groupSize;
    let sizes = [8,16,32,64];

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

<button on:click={toggelModal}>Create Group</button>

{#if showModal}
<div id="group-form">
    <div id="group-form-header">
        <div class="form-text">Create Group</div> <button on:click={toggelModal}>X</button>
        <hr>
    </div>
    <div id="group-form-body">
        <input placeholder="Group Name" bind:value={groupName}>
        <br>
        <br>
        <label for="content">AllowContent Upload</label>
        <select id="content" bind:value={allowContent}>
            <option value="true">Yes</option>
            <option value="false">No</option>
        </select>
        <br>
        <label for="limit">Group Limit</label>
        <select id="limit" bind:value={groupSize}>
            {#each sizes as size}
            <option value="{size}">{size}</option>
            {/each}
        </select>
        <button on:click={send}>Create</button>
    </div>
</div>
{/if}

<style>
#group-form{
    width:35%;
    height: 52%;
    margin-top: 5%;
    position: fixed;
    background-color: #16124C;
    border-radius: 5px;
    border: 2px solid #484C7B;
    display: block;
    left: 50%;
    transform: translate(-50%, 0);
}
#group-form-header{
    margin-top: 15px;
    width: 100%;
}
#group-form-header > button{
    float: right !important;
    width: initial;
    margin-top: -15px;
    margin-right: 10px;
    background-color: transparent !important;
    border-radius: none !important;
    border: none !important;
}
#group-form-header > .form-text{
    width: 50%;
    display: inline-block;
    margin-left: 20px;
    font-size: 20px;
}
#group-form-header > hr{
    width: 99.5% !important;
}

#group-form-body > input{
    width: 95% !important;
    margin-top: 15px;
    margin-left: 15px;
    font-size: 21px;
    font-weight: bold;
}

#group-form-body > select{
    width: 95% !important;
    margin-top: 15px;
    margin-left: 15px;
    font-size: 21px;
    font-weight: bold;
}

#group-form-body > label{
    margin-left: 15px;
}
#group-form-body > button{
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