<script>
    import { onMount } from "svelte"
    import { authenticated } from "./stores/store"
    import { ERROR, NULL, INFO_PACKET, REGISTER_PACKET, REGISTER_RESPONSE, LOGIN_PACKET, LOGIN_RESPONSE } from "./packet"

    let client
    let accountUrl = 'ws://localhost:49152/chat'
    let errorMessage

    onMount(() => {
        createConnection()
        setupInputFocusEvent()
    })

    function createConnection(){
        client = new WebSocket(accountUrl)
        client.onopen = clientOpen
		client.onclose = clientClose
		client.onmessage = serverMessage
		client.onerror = clientError
    }

    function logout(){
        $authenticated = false
    }
</script>

<main>
    <div id="home-container">
        <div id="nav-bar">
            <div id="nav-title">
                <h1>AmpleChat</h1>
            </div>
            <div id="nav-actions">
                <button>Add Contact</button>
                <button>Create Group</button>
                <button on:click={logout}>Logout</button>
            </div>
        </div>
        <div id="side-bar">Side</div>
        <div id="view-bar">View</div>
    </div>
</main>

<style>

#nav-bar{
    grid-area: navbar;
    display: grid;
    grid-template-areas: 'nav-title nav-actions nav-actions nav-actions nav-actions nav-actions nav-actions nav-actions';
}

#nav-title {
    grid-area: nav-title;    
}

#nav-actions {
    grid-area: nav-actions;
}

#nav-actions > button {
    background-color:#6347AB;
    color:white;
    width: 11rem;
    margin-left: 15%;
    margin-top: 2%;
    cursor: pointer;
    font-size: 20px;
}

#nav-title h1{
    color: #1DC7DA;
    font-size: 30px;
    text-align: center;
}

#side-bar {
    grid-area: side-bar;
    min-height: 89vh;
    border: 2px solid #1DC7DA;
    overflow-y: visible;
}

#view-bar {
    grid-area: view-bar;
    min-width: 100%;
}

#home-container {
        display: grid;
        grid-template-areas: 
        'navbar navbar navbar navbar navbar'
        'side-bar view-bar view-bar view-bar view-bar';
    }
</style>